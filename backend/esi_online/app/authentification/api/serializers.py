"""
Serializers pour l'API authentification.
User + rôle pour redirection selon le type de compte.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


def get_user_role(user):
    """Rôle pour redirection : admin (superuser), bibliothecaire (staff non superuser), user (étudiant)."""
    if getattr(user, "is_superuser", False):
        return "admin"
    if getattr(user, "is_staff", False):
        return "bibliothecaire"
    return "user"


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "is_active", "date_joined", "role"]
        read_only_fields = ["id", "date_joined", "role"]

    def get_role(self, obj):
        return get_user_role(obj)


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False)


class CreateStudentSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, default="", allow_blank=True)
    last_name = serializers.CharField(required=False, default="", allow_blank=True)
    classe_id = serializers.IntegerField(required=False, allow_null=True)


class CreateBibliothecaireSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, default="", allow_blank=True)
    last_name = serializers.CharField(required=False, default="", allow_blank=True)
    password = serializers.CharField(min_length=8, trim_whitespace=False)


class SetPasswordInvitationSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, trim_whitespace=False)
