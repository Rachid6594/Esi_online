from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from app.administration.models import Ressource
from app.core.documents import TYPES_DOCUMENT
from app.espace_student.models import (
    Etudiant,
    RenduTP,
    ReponseEtudiantQCM,
    TentativeQCM,
)


# Champs que seul l'enseignant (ou le staff) a le droit d'ecrire : la note, le
# statut et le retour de correction. Un etudiant qui les enverrait pourrait
# s'attribuer sa propre note, donc ils sont filtres a la deserialisation.
CHAMPS_CORRECTION_RENDU_TP = [
    "statut",
    "note",
    "commentaire_enseignant",
    "fichier_correction",
    "date_correction",
    "corrige_par",
]

# Champs calcules par le serveur lors de la correction d'un QCM.
CHAMPS_CALCULES_TENTATIVE_QCM = [
    "numero_tentative",
    "statut",
    "date_fin",
    "note_obtenue",
    "pourcentage",
]

# Champs calcules par le serveur lors de la correction des reponses.
CHAMPS_CALCULES_REPONSE_QCM = [
    "is_correcte",
    "points_obtenus",
]


class ChampsProtegesMixin:
    """
    Refuse les champs reserves au staff pour un simple etudiant.

    Les serializers listent desormais leurs champs un par un, ce qui evite le
    "fields = '__all__'" qui laissait un etudiant ecrire sa propre note. Mais
    lister ne suffit pas : l'enseignant doit garder le droit de corriger. Ce
    mixin rejette donc explicitement les champs proteges quand la requete ne
    vient pas d un utilisateur staff, plutot que de les ignorer en silence.
    """

    champs_proteges: list[str] = []

    def to_internal_value(self, data):
        if not self._requester_est_staff():
            interdits = sorted(set(self.champs_proteges) & set(data.keys()))
            if interdits:
                raise serializers.ValidationError(
                    {
                        champ: "Ce champ est reserve a l'enseignant."
                        for champ in interdits
                    }
                )
        return super().to_internal_value(data)

    def _requester_est_staff(self) -> bool:
        request = self.context.get("request")
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and user.is_staff)


class EtudiantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etudiant
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class RenduTPSerializer(ChampsProtegesMixin, serializers.ModelSerializer):
    champs_proteges = CHAMPS_CORRECTION_RENDU_TP

    class Meta:
        model = RenduTP
        fields = [
            "id",
            "tp",
            "etudiant",
            "fichier",
            "commentaire_etudiant",
            "statut",
            "note",
            "commentaire_enseignant",
            "fichier_correction",
            "date_correction",
            "corrige_par",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        # "etudiant" est facultatif a la validation : pour un etudiant c'est le
        # serveur qui l'assigne, l'exiger ici rejetterait son propre depot.
        extra_kwargs = {"etudiant": {"required": False}}


class TentativeQCMSerializer(ChampsProtegesMixin, serializers.ModelSerializer):
    champs_proteges = CHAMPS_CALCULES_TENTATIVE_QCM

    class Meta:
        model = TentativeQCM
        fields = [
            "id",
            "qcm",
            "etudiant",
            "numero_tentative",
            "statut",
            "date_fin",
            "note_obtenue",
            "pourcentage",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {"etudiant": {"required": False}}


class ReponseEtudiantQCMSerializer(ChampsProtegesMixin, serializers.ModelSerializer):
    champs_proteges = CHAMPS_CALCULES_REPONSE_QCM

    class Meta:
        model = ReponseEtudiantQCM
        fields = [
            "id",
            "tentative",
            "question",
            "is_correcte",
            "points_obtenus",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DocumentEtudiantSerializer(serializers.ModelSerializer):
    """
    Vue d'un document pour l'etudiant, avec des libelles et non des ids.

    L'espace etudiant lisait directement RessourceSerializer, dont les cles
    etrangeres sortent en cascade d'ids : le front affichait « Matiere N°5 »
    dans ses filtres et son tri. Ici chaque libelle est resolu une fois, et
    les ids restent disponibles pour relancer un filtre.
    """

    matiere_id = serializers.IntegerField(read_only=True, allow_null=True)
    matiere_libelle = serializers.SerializerMethodField()
    classe_id = serializers.IntegerField(read_only=True, allow_null=True)
    classe_libelle = serializers.SerializerMethodField()
    niveau_libelle = serializers.SerializerMethodField()
    filiere_libelle = serializers.SerializerMethodField()
    annee_libelle = serializers.SerializerMethodField()
    categorie_libelle = serializers.SerializerMethodField()
    telechargeable = serializers.SerializerMethodField()
    url_telechargement = serializers.SerializerMethodField()

    class Meta:
        model = Ressource
        fields = [
            "id",
            "titre",
            "description",
            "type_ressource",
            "auteur",
            "fichier",
            "lien",
            "taille_fichier",
            "format_fichier",
            "date_publication",
            "created_at",
            "matiere_id",
            "matiere_libelle",
            "classe_id",
            "classe_libelle",
            "niveau_libelle",
            "filiere_libelle",
            "annee_libelle",
            "categorie_libelle",
            "is_public",
            "telechargeable",
            "url_telechargement",
        ]
        read_only_fields = fields

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_matiere_libelle(self, obj):
        return obj.matiere.libelle if obj.matiere else None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_classe_libelle(self, obj):
        return obj.classe.libelle if obj.classe else None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_niveau_libelle(self, obj):
        return obj.niveau.libelle if obj.niveau else None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_filiere_libelle(self, obj):
        return obj.filiere.libelle if obj.filiere else None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_annee_libelle(self, obj):
        return obj.annee_academique.libelle if obj.annee_academique else None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_categorie_libelle(self, obj):
        return obj.categorie.libelle if obj.categorie else None

    @extend_schema_field(serializers.BooleanField)
    def get_telechargeable(self, obj):
        """Un document sans fichier joint ne propose pas de telechargement."""
        return bool(obj.fichier)

    # Chemin relatif, pas une URL absolue : l'API est servie sous un prefixe
    # (/api), que le front ne doit pas avoir a deviner.
    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_url_telechargement(self, obj):
        if not obj.fichier:
            return None
        return f"/api/eleve/documents/{obj.pk}/telecharger/"


# ---------------------------------------------------------------------------
# Upload : permissions d'upload et depot de fichier par l'etudiant
# ---------------------------------------------------------------------------
# Ces trois endpoints renvoient des dicts construits a la main dans
# PermissionUploadService, sans serialiseur. Le schema OpenAPI ne pouvait donc
# decrire aucune de leurs reponses : le Swagger affichait "aucun schema" et le
# front ne pouvait pas generer de client. Les serialiseurs ci-dessous
# reproduisent exactement les memes cles — ils decrivent, ils ne transforment
# pas. Toute divergence casserait le front, donc les tests compares les deux.


class ErreurDetailSerializer(serializers.Serializer):
    """
    Forme de toutes les erreurs metier des endpoints d'upload.

    Les vues renvoient {"detail": "message"} et rien d'autre. Sans ce
    serialiseur, le schema annonait un objet libre sur chaque 400 et 404, et
    le front ne pouvait pas typer ses cas d'erreur.
    """

    detail = serializers.CharField()


class TypeUploadSerializer(serializers.Serializer):
    """Un couple (valeur stockee, libelle affiche) de la liste des types."""

    value = serializers.CharField()
    label = serializers.CharField()


class PermissionUploadSerializer(serializers.Serializer):
    """
    Une permission d'upload, vue par l'admin.

    Les noms et prenoms viennent du User d'authentification, pas du profil
    Etudiant : c'est ce que le service lit, via get_auth_user_for_etudiant.
    """

    id = serializers.IntegerField(read_only=True)
    etudiant_id = serializers.IntegerField(read_only=True)
    user_id = serializers.IntegerField(read_only=True, allow_null=True)
    email = serializers.CharField(read_only=True, allow_blank=True)
    first_name = serializers.CharField(read_only=True, allow_blank=True)
    last_name = serializers.CharField(read_only=True, allow_blank=True)
    matricule = serializers.CharField(read_only=True)
    types_autorises = serializers.ListField(
        child=serializers.CharField(), read_only=True
    )
    is_active = serializers.BooleanField(read_only=True)
    note = serializers.CharField(read_only=True, allow_blank=True)
    accorde_par_id = serializers.IntegerField(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True, allow_null=True)
    updated_at = serializers.DateTimeField(read_only=True, allow_null=True)


class PermissionUploadGrantSerializer(serializers.Serializer):
    """
    Corps du POST d'octroi. Seul l'admin l'atteint (IsSuperAdmin).

    Les types sont valides ici plutot que dans le service, pour que le schema
    annonce la liste autorisee, libelles compris. Le service revérifie : un
    sérialiseur documente, il n'est pas la seule porte.
    """

    user_id = serializers.IntegerField()
    types_autorises = serializers.ListField(
        child=serializers.ChoiceField(choices=TYPES_DOCUMENT)
    )
    is_active = serializers.BooleanField(required=False, default=True)
    note = serializers.CharField(required=False, allow_blank=True, default="")


class PermissionUploadPatchSerializer(serializers.Serializer):
    """
    Corps du PATCH. Tous les champs sont facultatifs : le service n'ecrit que
    ceux qui sont presents, un PATCH {"is_active": false} doit laisser la liste
    de types intacte.
    """

    types_autorises = serializers.ListField(
        child=serializers.ChoiceField(choices=TYPES_DOCUMENT),
        required=False,
    )
    is_active = serializers.BooleanField(required=False)
    note = serializers.CharField(required=False, allow_blank=True)


class MyUploadPermissionSerializer(serializers.Serializer):
    """
    Ma permission d'upload, vue par l'etudiant connecte.

    Deux formes pour un seul endpoint : sans permission, l'endpoint renvoie
    allowed/is_active/types_autorises sans id ni note, parce qu'il n'y a pas de
    ligne a decrire. Les deux sont ici, avec les champs optionnels.
    """

    allowed = serializers.BooleanField()
    is_active = serializers.BooleanField()
    types_autorises = serializers.ListField(child=serializers.CharField())
    note = serializers.CharField(required=False, allow_blank=True)
    id = serializers.IntegerField(required=False)


class UploadEtudiantSerializer(serializers.Serializer):
    """
    Corps du POST de depot : multipart/form-data.

    Le service valide l'extension, le plafond et la permission ; ce
    sérialiseur valide la forme. Il ne peut pas valider le fichier lui-meme
    (taille, extension), donc il ne le fait pas : un "fichier" declare ici
    peut encore etre refuse, et c'est le service qui refuse.
    """

    titre = serializers.CharField(max_length=300)
    type_ressource = serializers.ChoiceField(choices=TYPES_DOCUMENT)
    description = serializers.CharField(
        required=False, allow_blank=True, default="", max_length=5000
    )
    matiere_id = serializers.IntegerField(required=False, allow_null=True)
    fichier = serializers.FileField(required=True)


class UploadEtudiantReponseSerializer(serializers.Serializer):
    """Ce que renvoie un depot accepte."""

    id = serializers.IntegerField(read_only=True)
    titre = serializers.CharField(read_only=True)
    type_ressource = serializers.CharField(read_only=True)
    fichier = serializers.CharField(read_only=True, allow_null=True)
    taille_fichier = serializers.IntegerField(read_only=True, allow_null=True)
    message = serializers.CharField(read_only=True)
