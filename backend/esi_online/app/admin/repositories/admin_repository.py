"""
Repository pour l'accès aux données admin.
"""
from app.admin.models import Admin
from app.admin.interfaces.admin_repository_interface import AdminRepositoryInterface


class AdminRepository(AdminRepositoryInterface):
    def get_all(self):
        return Admin.objects.all()

    def get_by_id(self, pk):
        return Admin.objects.get(id=pk)

    def create(self, data):
        return Admin.objects.create(**data)

    def update(self, pk, data, partial=False):
        obj = self.get_by_id(pk)
        for field, value in data.items():
            if hasattr(obj, field):
                setattr(obj, field, value)
        obj.save()
        return obj

    def delete(self, pk):
        obj = self.get_by_id(pk)
        obj.delete()
        return True
