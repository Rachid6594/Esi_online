"""
Permissions pour l'application eleve.
"""
from rest_framework import permissions


class CanViewEleve(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("espace_student.view_eleve")
        )


class CanCreateEleve(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("espace_student.add_eleve")
        )


class CanUpdateEleve(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("espace_student.change_eleve")
        )


class CanDeleteEleve(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("espace_student.delete_eleve")
        )
