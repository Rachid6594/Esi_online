"""
Sérialiseurs pour l'application eleve.
"""
from rest_framework import serializers
from app.espace_student.models import Eleve


class EleveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Eleve
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]
