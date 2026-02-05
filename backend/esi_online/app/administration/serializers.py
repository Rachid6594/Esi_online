"""
Sérialiseurs pour l'application administration.
"""
from rest_framework import serializers
from app.administration.models import Administration


class AdministrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Administration
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]
