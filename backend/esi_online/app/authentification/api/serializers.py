"""
Serializers pour l'API authentification.
User + rôle pour redirection selon le type de compte.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema_field

User = get_user_model()


def get_user_role(user):
    """Rôle pour redirection : admin (superuser), admin_ecole (profil AdministrationEcole), professeur, bibliothecaire, user (étudiant)."""
    if getattr(user, "is_superuser", False):
        return "admin"
    try:
        from app.administration.models import AdministrationEcole
        if AdministrationEcole.objects.filter(auth_user=user).exists():
            return "admin_ecole"
    except Exception:
        pass
    if getattr(user, "groups", None) and user.groups.filter(name="professeurs").exists():
        return "professeur"
    if getattr(user, "is_staff", False):
        return "bibliothecaire"
    return "user"


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    poste = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "is_active", "date_joined", "role", "poste"]
        read_only_fields = ["id", "date_joined", "role", "poste"]

    @extend_schema_field(serializers.CharField())
    def get_role(self, obj) -> str:
        return get_user_role(obj)

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_poste(self, obj) -> str | None:
        """Pour les comptes Administration École : afficher le poste dans la sidebar."""
        try:
            from app.administration.models import AdministrationEcole
            profile = AdministrationEcole.objects.filter(auth_user=obj).first()
            return profile.poste if profile else None
        except Exception:
            return None


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False)


class CreateStudentSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, default="", allow_blank=True)
    last_name = serializers.CharField(required=False, default="", allow_blank=True)
    classe_id = serializers.IntegerField(required=False, allow_null=True)


class CreateBibliothecaireSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, default="", allow_blank=True)
    last_name = serializers.CharField(required=False, default="", allow_blank=True)
    password = serializers.CharField(min_length=8, trim_whitespace=False)


class CreateProfesseurSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, default="", allow_blank=True)
    last_name = serializers.CharField(required=False, default="", allow_blank=True)
    password = serializers.CharField(min_length=8, trim_whitespace=False)
    matiere_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=True,
        allow_empty=False,
        help_text="Liste des id de matières à associer au professeur (au moins une obligatoire).",
    )

    def validate_matiere_ids(self, value):
        if not value:
            raise serializers.ValidationError("Au moins une matière doit être sélectionnée.")
        return value


class SetPasswordInvitationSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, trim_whitespace=False)


class ErrorDetailSerializer(serializers.Serializer):
    detail = serializers.CharField()


class LoginResponseSerializer(serializers.Serializer):
    user = UserSerializer()
    access = serializers.CharField()
    refresh = serializers.CharField()


class UserWithMessageSerializer(serializers.Serializer):
    user = UserSerializer()
    message = serializers.CharField()


class StudentListItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    username = serializers.CharField()
    is_active = serializers.BooleanField()
    date_joined = serializers.DateTimeField(allow_null=True)
    classe_id = serializers.IntegerField(allow_null=True)
    classe_code = serializers.CharField(allow_null=True)
    classe_libelle = serializers.CharField(allow_null=True)


class StaffListItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    username = serializers.CharField()
    is_active = serializers.BooleanField()
    date_joined = serializers.DateTimeField(allow_null=True)


class MatiereMiniSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    libelle = serializers.CharField()
    code = serializers.CharField(allow_blank=True)


class ProfesseurListItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    username = serializers.CharField()
    is_active = serializers.BooleanField()
    date_joined = serializers.DateTimeField(allow_null=True)
    matieres = MatiereMiniSerializer(many=True)


class InvitationValidationSerializer(serializers.Serializer):
    valid = serializers.BooleanField()
    email = serializers.EmailField(required=False)
    detail = serializers.CharField(required=False)


class StudentImportErrorSerializer(serializers.Serializer):
    ligne = serializers.IntegerField()
    email = serializers.CharField(required=False)
    erreur = serializers.CharField()


class StudentImportDetailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    id = serializers.IntegerField()


class ImportStudentsResponseSerializer(serializers.Serializer):
    created = serializers.IntegerField()
    errors = StudentImportErrorSerializer(many=True)
    details = StudentImportDetailSerializer(many=True)


class ApiMessageSerializer(serializers.Serializer):
    message = serializers.CharField()
