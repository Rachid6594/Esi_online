"""
Vues API authentification : appellent les services (pas les repositories directement).
Login unique : retourne user (avec rôle) + tokens JWT pour redirection par rôle côté front.
Création étudiants (admin) : formulaire ou CSV, envoi identifiants par email + lien changer MDP.
Liste / export étudiants (admin) : filtres, tri, export CSV.
"""
import csv
import io

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.http import HttpResponse
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from app.authentification.api.serializers import (
    UserSerializer,
    UserCreateSerializer,
    LoginSerializer,
    CreateStudentSerializer,
    CreateBibliothecaireSerializer,
    CreateProfesseurSerializer,
    SetPasswordInvitationSerializer,
)
from app.authentification.models import UserClasse
from app.authentification.services import AuthService
from app.authentification.services.student_email_service import send_student_credentials
from app.core.exceptions import ValidationError

User = get_user_model()


@api_view(["GET"])
def current_user(request):
    """Utilisateur connecté (à utiliser avec auth JWT)."""
    if not request.user.is_authenticated:
        return Response({"detail": "Non authentifié"}, status=status.HTTP_401_UNAUTHORIZED)
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Connexion par email + mot de passe.
    Retourne { user, access, refresh } pour une seule page de login
    et redirection par rôle (admin -> /admin, etc.) côté frontend.
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    try:
        auth_service = AuthService()
        user = auth_service.login_with_email(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
    except ValidationError as e:
        return Response({"detail": e.message}, status=status.HTTP_401_UNAUTHORIZED)
    refresh = RefreshToken.for_user(user)
    return Response({
        "user": UserSerializer(user).data,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """Inscription : utilise AuthService."""
    serializer = UserCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    try:
        auth_service = AuthService()
        user = auth_service.create_user(
            username=serializer.validated_data["username"],
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    except ValidationError as e:
        return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)


# --- Création étudiants (admin) + lien changer mot de passe ---

@api_view(["POST"])
@permission_classes([IsAdminUser])
def create_student(request):
    """
    Crée un étudiant : mot de passe aléatoire, envoi des identifiants par email
    avec invitation à changer le mot de passe.
    """
    serializer = CreateStudentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    try:
        auth_service = AuthService()
        user, raw_password = auth_service.create_student(
            email=serializer.validated_data["email"],
            first_name=serializer.validated_data.get("first_name", ""),
            last_name=serializer.validated_data.get("last_name", ""),
        )
        classe_id = serializer.validated_data.get("classe_id")
        if classe_id:
            from app.administration.models import Classe
            if Classe.objects.filter(pk=classe_id).exists():
                UserClasse.objects.update_or_create(user=user, defaults={"classe_id": classe_id})
        try:
            send_student_credentials(user, raw_password)
            message = "Compte créé. Identifiants envoyés par email."
        except Exception as e:
            message = f"Compte créé. L'envoi de l'email a échoué : {e!s}"
        return Response(
            {"user": UserSerializer(user).data, "message": message},
            status=status.HTTP_201_CREATED,
        )
    except ValidationError as e:
        return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def import_students_csv(request):
    """
    Import CSV : colonnes attendues email,prenom,nom (en-tête optionnel).
    Crée un compte par ligne, mot de passe aléatoire, envoi des identifiants par email.
    """
    if "file" not in request.FILES and "csv" not in request.FILES:
        return Response(
            {"detail": "Envoyez un fichier CSV (champ 'file' ou 'csv')."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    file = request.FILES.get("file") or request.FILES.get("csv")
    if not file.name.lower().endswith(".csv"):
        return Response(
            {"detail": "Le fichier doit être un CSV (.csv)."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        content = file.read().decode("utf-8-sig").strip()
    except UnicodeDecodeError:
        return Response(
            {"detail": "Le fichier doit être encodé en UTF-8."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    reader = csv.DictReader(io.StringIO(content), fieldnames=("email", "prenom", "nom", "classe_id"))
    rows = list(reader)
    if not rows:
        return Response({"detail": "Le fichier CSV est vide."}, status=status.HTTP_400_BAD_REQUEST)
    first = rows[0]
    if first.get("email", "").lower() == "email":
        rows = rows[1:]
    created = []
    errors = []
    auth_service = AuthService()
    from app.administration.models import Classe
    for i, row in enumerate(rows):
        email = (row.get("email") or "").strip()
        if not email:
            errors.append({"ligne": i + 2, "erreur": "Email manquant"})
            continue
        prenom = (row.get("prenom") or "").strip()
        nom = (row.get("nom") or "").strip()
        classe_id = None
        if (row.get("classe_id") or "").strip():
            try:
                classe_id = int((row.get("classe_id") or "").strip())
            except ValueError:
                pass
        try:
            user, raw_password = auth_service.create_student(
                email=email,
                first_name=prenom,
                last_name=nom,
            )
            if classe_id and Classe.objects.filter(pk=classe_id).exists():
                UserClasse.objects.update_or_create(user=user, defaults={"classe_id": classe_id})
            send_student_credentials(user, raw_password)
            created.append({"email": email, "id": user.id})
        except ValidationError as e:
            errors.append({"ligne": i + 2, "email": email, "erreur": e.message})
    return Response({"created": len(created), "errors": errors, "details": created})


def _get_students_queryset(request):
    """Queryset des utilisateurs étudiants (non staff), avec filtres et tri."""
    qs = User.objects.filter(is_staff=False, is_superuser=False).select_related()
    search = (request.query_params.get("search") or "").strip()
    if search:
        qs = qs.filter(
            Q(email__icontains=search)
            | Q(first_name__icontains=search)
            | Q(last_name__icontains=search)
            | Q(username__icontains=search)
        )
    classe_id = request.query_params.get("classe_id")
    if classe_id:
        try:
            qs = qs.filter(classe_affectation__classe_id=int(classe_id))
        except ValueError:
            pass
    is_active = request.query_params.get("is_active")
    if is_active is not None and is_active != "":
        qs = qs.filter(is_active=is_active.lower() in ("1", "true", "yes"))
    ordering = request.query_params.get("ordering") or "-date_joined"
    allowed = {"id", "email", "first_name", "last_name", "date_joined"}
    if ordering.lstrip("-") in allowed:
        qs = qs.order_by(ordering)
    return qs


@api_view(["GET"])
@permission_classes([IsAdminUser])
def students_list(request):
    """
    Liste des étudiants (utilisateurs non staff).
    Query params : search, classe_id, is_active, ordering (ex. email, -date_joined).
    """
    qs = _get_students_queryset(request)
    result = []
    for u in qs:
        uc = UserClasse.objects.filter(user=u).select_related("classe").first()
        classe_id = uc.classe_id if uc else None
        classe_code = uc.classe.code if uc and uc.classe else None
        classe_libelle = uc.classe.libelle if uc and uc.classe else None
        result.append({
            "id": u.id,
            "email": u.email,
            "first_name": u.first_name or "",
            "last_name": u.last_name or "",
            "username": u.username,
            "is_active": u.is_active,
            "date_joined": u.date_joined.isoformat() if u.date_joined else None,
            "classe_id": classe_id,
            "classe_code": classe_code,
            "classe_libelle": classe_libelle,
        })
    return Response(result)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def students_export(request):
    """
    Export CSV des étudiants (mêmes filtres que students_list).
    Query params : search, classe_id, is_active, ordering.
    """
    qs = _get_students_queryset(request)
    response = HttpResponse(content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = 'attachment; filename="etudiants.csv"'
    response.write("\ufeff")
    writer = csv.writer(response, delimiter=";")
    writer.writerow(["id", "email", "prénom", "nom", "classe_id", "actif", "date_inscription"])
    for u in qs:
        uc = UserClasse.objects.filter(user=u).select_related("classe").first()
        classe_id = uc.classe_id if uc else None
        writer.writerow([
            u.id,
            u.email,
            u.first_name or "",
            u.last_name or "",
            classe_id or "",
            "Oui" if u.is_active else "Non",
            u.date_joined.strftime("%Y-%m-%d %H:%M") if u.date_joined else "",
        ])
    return response


# --- Bibliothécaires (staff, non superuser) ---

def _get_bibliothecaires_queryset(request):
    """Queryset des utilisateurs staff non superuser (bibliothécaires)."""
    qs = User.objects.filter(is_staff=True, is_superuser=False).order_by("email")
    search = (request.query_params.get("search") or "").strip()
    if search:
        qs = qs.filter(
            Q(email__icontains=search)
            | Q(first_name__icontains=search)
            | Q(last_name__icontains=search)
            | Q(username__icontains=search)
        )
    return qs


@api_view(["GET"])
@permission_classes([IsAdminUser])
def bibliothecaires_list(request):
    """
    Liste des bibliothécaires (utilisateurs staff, non superuser).
    Query params : search.
    """
    qs = _get_bibliothecaires_queryset(request)
    result = [
        {
            "id": u.id,
            "email": u.email,
            "first_name": u.first_name or "",
            "last_name": u.last_name or "",
            "username": u.username,
            "is_active": u.is_active,
            "date_joined": u.date_joined.isoformat() if u.date_joined else None,
        }
        for u in qs
    ]
    return Response(result)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def create_bibliothecaire(request):
    """Crée un compte bibliothécaire (staff, mot de passe fourni par l'admin)."""
    serializer = CreateBibliothecaireSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    try:
        auth_service = AuthService()
        user = auth_service.create_bibliothecaire(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
            first_name=serializer.validated_data.get("first_name", ""),
            last_name=serializer.validated_data.get("last_name", ""),
        )
        return Response(
            {"user": UserSerializer(user).data, "message": "Compte bibliothécaire créé."},
            status=status.HTTP_201_CREATED,
        )
    except ValidationError as e:
        return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)


# --- Professeurs (groupe "professeurs") ---

def _get_professeurs_queryset(request):
    """Queryset des utilisateurs du groupe professeurs."""
    qs = User.objects.filter(groups__name="professeurs").distinct().order_by("email")
    search = (request.query_params.get("search") or "").strip()
    if search:
        qs = qs.filter(
            Q(email__icontains=search)
            | Q(first_name__icontains=search)
            | Q(last_name__icontains=search)
            | Q(username__icontains=search)
        )
    return qs


@api_view(["GET"])
@permission_classes([IsAdminUser])
def professeurs_list(request):
    """
    Liste des professeurs (utilisateurs du groupe professeurs) avec leurs matières liées.
    Query params : search.
    """
    from app.authentification.models import ProfesseurMatiere

    qs = _get_professeurs_queryset(request).prefetch_related("professeur_matieres__matiere")
    result = []
    for u in qs:
        matieres = [
            {"id": pm.matiere.id, "libelle": pm.matiere.libelle, "code": getattr(pm.matiere, "code", "")}
            for pm in u.professeur_matieres.all()
        ]
        result.append({
            "id": u.id,
            "email": u.email,
            "first_name": u.first_name or "",
            "last_name": u.last_name or "",
            "username": u.username,
            "is_active": u.is_active,
            "date_joined": u.date_joined.isoformat() if u.date_joined else None,
            "matieres": matieres,
        })
    return Response(result)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def create_professeur(request):
    """Crée un compte professeur (groupe professeurs) et le lie aux matières choisies."""
    serializer = CreateProfesseurSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    try:
        auth_service = AuthService()
        user = auth_service.create_professeur(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
            first_name=serializer.validated_data.get("first_name", ""),
            last_name=serializer.validated_data.get("last_name", ""),
        )
        matiere_ids = serializer.validated_data["matiere_ids"]
        auth_service.link_professeur_matieres(user, matiere_ids)
        return Response(
            {"user": UserSerializer(user).data, "message": "Compte professeur créé."},
            status=status.HTTP_201_CREATED,
        )
    except ValidationError as e:
        return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([AllowAny])
def validate_invitation_token(request):
    """
    Vérifie que le lien d'invitation (uid + token) est valide.
    Retourne { valid: true, email } pour afficher le formulaire de nouveau mot de passe.
    """
    uid = request.query_params.get("uid")
    token = request.query_params.get("token")
    if not uid or not token:
        return Response({"valid": False, "detail": "Paramètres manquants."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        uid_int = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=uid_int)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({"valid": False})
    if not default_token_generator.check_token(user, token):
        return Response({"valid": False})
    return Response({"valid": True, "email": user.email})


@api_view(["POST"])
@permission_classes([AllowAny])
def set_password_from_invitation(request):
    """
    Définit le nouveau mot de passe depuis le lien d'invitation (uid + token).
    """
    serializer = SetPasswordInvitationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    uid = serializer.validated_data["uid"]
    token = serializer.validated_data["token"]
    new_password = serializer.validated_data["new_password"]
    try:
        uid_int = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=uid_int)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({"detail": "Lien invalide ou expiré."}, status=status.HTTP_400_BAD_REQUEST)
    if not default_token_generator.check_token(user, token):
        return Response({"detail": "Lien invalide ou expiré."}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new_password)
    user.save()
    return Response({"message": "Mot de passe mis à jour. Vous pouvez vous connecter."})
