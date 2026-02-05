"""
Interface du repository espace_library.
"""
from abc import ABC, abstractmethod


class EspaceBibliothequeRepositoryInterface(ABC):
    @abstractmethod
    def get_all(self):
        pass

    @abstractmethod
    def get_by_id(self, pk):
        pass

    @abstractmethod
    def create(self, data):
        pass

    @abstractmethod
    def update(self, pk, data, partial=False):
        pass

    @abstractmethod
    def delete(self, pk):
        pass
