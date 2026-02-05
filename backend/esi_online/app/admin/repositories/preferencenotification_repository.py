"""
Repository preferencenotification : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.admin.models import PreferenceNotification


class PreferenceNotificationRepository(BaseRepository):
    model = PreferenceNotification

    def get_queryset(self):
        return super().get_queryset()