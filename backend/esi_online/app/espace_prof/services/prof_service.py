"""
Service métier pour prof.
"""
from app.espace_prof.models import Prof
from app.espace_prof.repositories.prof_repository import ProfRepository


class ProfService:
    def __init__(self):
        self.repository = ProfRepository()

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
