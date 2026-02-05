"""
Repository utilisateurs : accès aux données User (Django auth).
À étendre quand tu auras un modèle User personnalisé (ex. avec rôle, profil).
"""
from django.contrib.auth import get_user_model

from app.core.repositories.base import BaseRepository

User = get_user_model()


class UserRepository(BaseRepository[User]):
    model = User

    def get_by_username(self, username: str) -> User | None:
        return self.get_queryset().filter(username=username).first()

    def get_by_email(self, email: str) -> User | None:
        return self.get_queryset().filter(email=email).first()

    def get_active(self):
        return self.get_queryset().filter(is_active=True)
