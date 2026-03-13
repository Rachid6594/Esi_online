"""
Sérialiseurs pour l'application admin.
"""
from rest_framework import serializers
from app.admin.models import *


class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]
