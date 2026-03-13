"""
Sérialiseurs pour l'application administration.
"""
from rest_framework import serializers
from app.administration.models import *


class AdministrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Administration
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

class FiliereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filiere
        fields = "__all__"

class MatiereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Matiere
        fields = "__all__"