"""
Sérialiseurs pour l'application espace_library.
"""
from rest_framework import serializers
from app.espace_library.models import EspaceBibliotheque


class EspaceBibliothequeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EspaceBibliotheque
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]
