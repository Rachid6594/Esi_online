"""
Service d'authentification : logique métier (login, inscription, etc.).
Utilise UserRepository ; les vues API appellent les services, pas les repositories directement.
"""
from django.contrib.auth import get_user_model

from app.authentification.repositories import UserRepository
from app.core.exceptions import ValidationError

User = get_user_model()


class AuthService:
    def __init__(self):
        self.user_repository = UserRepository()

    def get_user_by_id(self, user_id: int) -> User | None:
        return self.user_repository.get_by_id(user_id)

    def get_user_by_username(self, username: str) -> User | None:
        return self.user_repository.get_by_username(username)

    def user_exists(self, username: str) -> bool:
        return self.user_repository.exists(username=username)

    def create_user(self, username: str, email: str, password: str, **extra_fields) -> User:
        if self.user_repository.get_by_username(username):
            raise ValidationError(f"Le nom d'utilisateur '{username}' est déjà pris.")
        if self.user_repository.get_by_email(email):
            raise ValidationError(f"L'email '{email}' est déjà utilisé.")
        return User.objects.create_user(
            username=username,
            email=email,
            password=password,
            **extra_fields,
        )
