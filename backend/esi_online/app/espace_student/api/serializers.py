from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from app.administration.models import Ressource
from app.espace_student.models import Etudiant, RenduTP, ReponseEtudiantQCM, TentativeQCM


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
