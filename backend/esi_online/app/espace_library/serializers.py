"""
Sérialiseurs pour l'application espace_library.
"""
from rest_framework import serializers

from app.core.documents import TYPES_DOCUMENT_VALIDES
from app.espace_library.models import DownloadHistory, EspaceBibliotheque, LibraryDocument


class EspaceBibliothequeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EspaceBibliotheque
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class LibraryDocumentSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.SerializerMethodField()
    auteur_id = serializers.SerializerMethodField()
    matiere_libelle = serializers.SerializerMethodField()
    filiere_libelle = serializers.SerializerMethodField()
    fichier_url = serializers.SerializerMethodField()

    class Meta:
        model = LibraryDocument
        fields = [
            "id",
            "titre",
            "type",
            "fichier",
            "fichier_url",
            "description",
            "matiere",
            "matiere_libelle",
            "filiere",
            "filiere_libelle",
            "auteur",
            "auteur_id",
            "auteur_nom",
            "annee",
            "nb_telechargements",
            "date_ajout",
            "est_approuve",
        ]

    def get_auteur_nom(self, obj):
        if obj.auteur:
            full = (obj.auteur.get_full_name() or "").strip()
            return full if full else obj.auteur.username
        return None

    def get_auteur_id(self, obj):
        return obj.auteur_id

    def get_matiere_libelle(self, obj):
        if obj.matiere:
            return obj.matiere.libelle
        return None

    def get_filiere_libelle(self, obj):
        if obj.filiere:
            return obj.filiere.libelle
        return None

    def get_fichier_url(self, obj):
        if not obj.fichier:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.fichier)
        return obj.fichier


class LibraryDocumentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibraryDocument
        fields = ["titre", "type", "description", "matiere", "filiere", "annee"]

    def validate_type(self, value):
        if value not in TYPES_DOCUMENT_VALIDES:
            raise serializers.ValidationError(
                f"Type invalide : {value}. "
                f"Autorisés : {', '.join(sorted(TYPES_DOCUMENT_VALIDES))}"
            )
        return value


class DownloadHistorySerializer(serializers.ModelSerializer):
    document_titre = serializers.SerializerMethodField()
    matiere_libelle = serializers.SerializerMethodField()
    date = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S")

    class Meta:
        model = DownloadHistory
        fields = ["id", "document", "document_titre", "matiere_libelle", "date"]

    def get_document_titre(self, obj):
        return obj.document.titre

    def get_matiere_libelle(self, obj):
        if obj.document.matiere:
            return obj.document.matiere.libelle
        return None
