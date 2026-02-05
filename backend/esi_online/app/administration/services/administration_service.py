"""
Service métier pour administration.
"""
from app.administration.models import Administration
from app.administration.repositories.administration_repository import AdministrationRepository


class AdministrationService:
    def __init__(self):
        self.repository = AdministrationRepository()

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
