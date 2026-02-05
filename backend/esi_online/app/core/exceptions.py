"""Exceptions métier partagées (à utiliser dans services/repositories)."""


class AppError(Exception):
    """Erreur métier générique."""

    def __init__(self, message: str, code: str | None = None):
        self.message = message
        self.code = code
        super().__init__(message)


class NotFoundError(AppError):
    """Ressource introuvable."""

    def __init__(self, message: str = "Ressource introuvable"):
        super().__init__(message, code="not_found")


class ValidationError(AppError):
    """Erreur de validation métier."""

    def __init__(self, message: str):
        super().__init__(message, code="validation_error")
