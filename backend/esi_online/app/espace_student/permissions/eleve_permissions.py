"""
Permissions pour l'application eleve.
"""
from rest_framework import permissions


class CanViewEleve(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("eleve.view_eleve")
        )


class CanCreateEleve(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("eleve.add_eleve")
        )


class CanUpdateEleve(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("eleve.change_eleve")
        )


class CanDeleteEleve(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("eleve.delete_eleve")
        )
