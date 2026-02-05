"""
Sérialiseurs pour l'application prof.
"""
from rest_framework import serializers
from app.espace_prof.models import Prof


class ProfSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prof
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]
