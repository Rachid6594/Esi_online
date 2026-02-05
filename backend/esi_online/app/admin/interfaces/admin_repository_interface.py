"""
Interface du repository admin.
"""
from abc import ABC, abstractmethod


class AdminRepositoryInterface(ABC):
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
