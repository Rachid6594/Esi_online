"""
Vues API authentification : appellent les services (pas les repositories directement).
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from app.authentification.api.serializers import UserSerializer, UserCreateSerializer
from app.authentification.services import AuthService
from app.core.exceptions import ValidationError


@api_view(["GET"])
def current_user(request):
    """Utilisateur connecté (à utiliser avec auth JWT/session)."""
    if not request.user.is_authenticated:
        return Response({"detail": "Non authentifié"}, status=status.HTTP_401_UNAUTHORIZED)
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """Inscription : utilise AuthService."""
    serializer = UserCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    try:
        auth_service = AuthService()
        user = auth_service.create_user(
            username=serializer.validated_data["username"],
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    except ValidationError as e:
        return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)
