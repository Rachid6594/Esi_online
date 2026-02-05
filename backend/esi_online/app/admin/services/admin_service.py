"""
Service métier pour admin.
"""
from app.admin.models import Admin
from app.admin.repositories.admin_repository import AdminRepository


class AdminService:
    def __init__(self):
        self.repository = AdminRepository()

    def get_all(self):
        return self.repository.get_all()

    def get_by_id(self, pk):
        return self.repository.get_by_id(pk)

    def create(self, data):
        return self.repository.create(data)

    def update(self, pk, data, partial=False):
        return self.repository.update(pk, data, partial)

    def delete(self, pk):
        return self.repository.delete(pk)
