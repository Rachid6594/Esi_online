"""
Service d'authentification : logique métier (login, inscription, etc.).
Utilise UserRepository ; les vues API appellent les services, pas les repositories directement.
"""
import secrets
import re

from django.contrib.auth import get_user_model, authenticate

from app.authentification.repositories import UserRepository
from app.core.exceptions import ValidationError

User = get_user_model()


def _username_from_email(email: str) -> str:
    """Génère un username unique à partir de l'email (car Django User exige username)."""
    base = re.sub(r"[^a-zA-Z0-9]", "_", email.lower())[:50]
    return base or "user"


def generate_random_password(length: int = 12) -> str:
    """Mot de passe aléatoire (lettres + chiffres)."""
    alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"
    return "".join(secrets.choice(alphabet) for _ in range(length))


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

    def login_with_email(self, email: str, password: str) -> User:
        """
        Authentification par email + mot de passe.
        Retourne l'utilisateur si OK, sinon lève ValidationError.
        """
        user = self.user_repository.get_by_email(email)
        if not user:
            raise ValidationError("Email ou mot de passe incorrect.")
        if not user.is_active:
            raise ValidationError("Ce compte est désactivé.")
        auth_user = authenticate(username=user.username, password=password)
        if not auth_user:
            raise ValidationError("Email ou mot de passe incorrect.")
        return auth_user

    def create_student(
        self,
        email: str,
        first_name: str = "",
        last_name: str = "",
    ) -> tuple[User, str]:
        """
        Crée un utilisateur étudiant avec mot de passe aléatoire.
        Retourne (user, mot_de_passe_en_clair).
        Lève ValidationError si l'email est déjà utilisé.
        """
        if self.user_repository.get_by_email(email):
            raise ValidationError(f"L'email '{email}' est déjà utilisé.")
        base_username = _username_from_email(email)
        username = base_username
        counter = 0
        while self.user_repository.get_by_username(username):
            counter += 1
            username = f"{base_username}{counter}"
        raw_password = generate_random_password()
        user = User.objects.create_user(
            username=username,
            email=email,
            password=raw_password,
            first_name=first_name or "",
            last_name=last_name or "",
            is_staff=False,
            is_superuser=False,
        )
        return user, raw_password

    def create_bibliothecaire(
        self,
        email: str,
        password: str,
        first_name: str = "",
        last_name: str = "",
    ) -> User:
        """
        Crée un utilisateur bibliothécaire (is_staff=True, is_superuser=False).
        Lève ValidationError si l'email est déjà utilisé.
        """
        if self.user_repository.get_by_email(email):
            raise ValidationError(f"L'email '{email}' est déjà utilisé.")
        base_username = _username_from_email(email)
        username = base_username
        counter = 0
        while self.user_repository.get_by_username(username):
            counter += 1
            username = f"{base_username}{counter}"
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name or "",
            last_name=last_name or "",
            is_staff=True,
            is_superuser=False,
        )
        return user
