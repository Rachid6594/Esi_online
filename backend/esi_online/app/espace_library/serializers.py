"""
Sérialiseurs pour l'application espace_library.
"""
from rest_framework import serializers
from app.espace_library.models import *
from app.administration.serializers import FiliereSerializer
from app.admin.serializers import UserSerializer


class EspaceBibliothequeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EspaceBibliotheque
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

class AuteurSerializer(serializers.ModelSerializer):
    """Serialiseur pour Auteur"""
    class Meta:
        model = Auteur
        fields = "__all__"


class CategorieSerializer(serializers.ModelSerializer):
    """Serialiseur pour Categorie"""
    class Meta:
        model = Categorie
        fields = "__all__"


class CollectionSerializer(serializers.ModelSerializer):
    """Serialiseur pour Collection"""
    class Meta:

        model = Collection
        fields = "__all__"


class LivreListSerializer(serializers.ModelSerializer):
    """Serialiseur pour liste de livre"""
    class Meta:

        model = Livre

        fields = [

            "titre",
            "isbn",
            "resume",
            "annee_publication",
        ]

class LivreDetailSerializer(serializers.ModelSerializer):
    """Serialiseur pour detail de livre"""
    auteurs = AuteurSerializer(
        many=True,
        read_only=True
    )
    categories = CategorieSerializer(
        many=True,
        read_only=True
    )
    collections = CollectionSerializer(
        many=True,
        read_only=True
    )
    class Meta:
        model = Livre
        fields = "__all__"

class RapportSoutenanceSerializer(serializers.ModelSerializer):
    """Serialiseur pour rapport de soutenance"""
    filiere_detail = FiliereSerializer(
        source="filiere",
        read_only = True
    )
    class Meta:
        model = RapportSoutenance
        fields = "__all__"

class DocumentDevoirSerializer(serializers.ModelSerializer):
    """Serialiseur pour document devoir"""
    matiere_detail = MatiereSerializer(
        source="matiere",
        read_only=True
    )
    class Meta:
        model = DocumentDevoir
        fields = "__all__"

class SignalementSerializer(serializers.ModelSerializer):
    """Serialiseur pour signalement etudiant"""
    signale_par = serializers.HiddenField(

        default=serializers.CurrentUserDefault()
    )
    class Meta:
        model = Signalement
        fields = "__all__"
        read_only_fields = [
            "statut",
            "traite_par",
            "created_at",
            "updated_at"
        ]

class SignalementAdminSerializer(serializers.ModelSerializer):
    """Serialiseur cote bibliothecaire"""
    signale_par_user = UserSerializer(
        source="signale_par",
        read_only=True
    )
    traite_par = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )
    class Meta:
        model = Signalement
        fields = "__all__"
        read_only_fields = [
            "signale_par",
            "created_at",
            "updated_at",
        ]
