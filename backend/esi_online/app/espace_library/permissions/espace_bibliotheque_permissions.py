"""
Permissions pour l'application espace_library.
"""
from rest_framework import permissions


class CanViewEspaceBibliotheque(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("espace_library.view_espacebibliotheque")
        )


class CanCreateEspaceBibliotheque(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("espace_library.add_espacebibliotheque")
        )


class CanUpdateEspaceBibliotheque(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("espace_library.change_espacebibliotheque")
        )


class CanDeleteEspaceBibliotheque(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("espace_library.delete_espacebibliotheque")
        )
