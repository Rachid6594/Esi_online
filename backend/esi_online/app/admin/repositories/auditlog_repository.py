"""
Repository auditlog : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.admin.models import AuditLog


class AuditLogRepository(BaseRepository):
    model = AuditLog

    def get_queryset(self):
        return super().get_queryset()