"""
Permissions pour l'application prof.
"""
from rest_framework import permissions


class CanViewProf(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("espace_prof.view_prof")
        )


class CanCreateProf(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("espace_prof.add_prof")
        )


class CanUpdateProf(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("espace_prof.change_prof")
        )


class CanDeleteProf(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("espace_prof.delete_prof")
        )
