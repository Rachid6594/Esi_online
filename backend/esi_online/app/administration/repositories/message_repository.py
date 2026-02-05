"""
Repository message : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.administration.models import Message


class MessageRepository(BaseRepository):
    model = Message

    def get_queryset(self):
        return super().get_queryset()