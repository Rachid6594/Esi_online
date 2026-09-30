from rest_framework import serializers
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
