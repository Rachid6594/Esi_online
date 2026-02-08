from rest_framework import serializers
from app.administration.models import (
    AdministrationEcole,
    AffectationEnseignant,
    AnneeAcademique,
    Annonce,
    Categorie,
    Classe,
    ConsultationRessource,
    DroitAdministration,
    EmploiDuTemps,
    Emprunt,
    Evenement,
    Exemplaire,
    Filiere,
    Forum,
    LectureAnnonce,
    Matiere,
    Message,
    Niveau,
    ReactionReponse,
    Reponse,
    Reservation,
    Ressource,
    Sujet,
    Tag,
)


class AnneeAcademiqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnneeAcademique
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class NiveauSerializer(serializers.ModelSerializer):
    class Meta:
        model = Niveau
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class FiliereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filiere
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ClasseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classe
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class MatiereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Matiere
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class DroitAdministrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DroitAdministration
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class AdministrationEcoleSerializer(serializers.ModelSerializer):
    droits = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=DroitAdministration.objects.all(),
        required=False,
        allow_empty=True,
    )
    droits_detail = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = AdministrationEcole
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_droits_detail(self, obj):
        return [
            {"id": d.id, "code": d.code, "libelle": d.libelle, "domaine": d.domaine, "action": d.action}
            for d in obj.droits.all()
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["droits_detail"] = self.get_droits_detail(instance)
        return data

class AnnonceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annonce
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class LectureAnnonceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LectureAnnonce
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class EmploiDuTempsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploiDuTemps
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class EvenementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evenement
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class AffectationEnseignantSerializer(serializers.ModelSerializer):
    class Meta:
        model = AffectationEnseignant
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class RessourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ressource
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ConsultationRessourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationRessource
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ExemplaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exemplaire
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class EmpruntSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emprunt
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ForumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forum
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class SujetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sujet
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ReponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reponse
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ReactionReponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReactionReponse
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

