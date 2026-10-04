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


class IsStudentUser(permissions.BasePermission):
    """
    Étudiant = authentifié, non staff, non superuser.

    Déclaré ici plutôt que dans upload_views : c'est la règle d'accès de tout
    l'espace étudiant, pas d'un seul endpoint. L'upload l'utilisait déjà, la
    liste de documents en a besoin aussi.
    """

    def has_permission(self, request, view):
        u = request.user
        return bool(
            u
            and u.is_authenticated
            and not u.is_staff
            and not u.is_superuser
        )
