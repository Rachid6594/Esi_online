"""
Permissions pour l'application admin.
"""
from rest_framework import permissions


class CanViewAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("admin.view_admin")
        )


class CanCreateAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("admin.add_admin")
        )


class CanUpdateAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("admin.change_admin")
        )


class CanDeleteAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("admin.delete_admin")
        )


# --- User ---
class CanViewUser(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_user."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.view_user")
            )
        return True


class CanCreateUser(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_user."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.add_user")
            )
        return True


class CanUpdateUser(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_user."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.change_user")
            )
        return True


class CanDeleteUser(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_user."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.delete_user")
            )
        return True


# --- SuperAdmin ---
class CanViewSuperAdmin(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_superadmin."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.view_superadmin")
            )
        return True


class CanCreateSuperAdmin(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_superadmin."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.add_superadmin")
            )
        return True


class CanUpdateSuperAdmin(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_superadmin."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.change_superadmin")
            )
        return True


class CanDeleteSuperAdmin(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_superadmin."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.delete_superadmin")
            )
        return True


# --- Notification ---
class CanViewNotification(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_notification."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.view_notification")
            )
        return True


class CanCreateNotification(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_notification."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.add_notification")
            )
        return True


class CanUpdateNotification(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_notification."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.change_notification")
            )
        return True


class CanDeleteNotification(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_notification."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.delete_notification")
            )
        return True


# --- PreferenceNotification ---
class CanViewPreferenceNotification(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_preferencenotification."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.view_preferencenotification")
            )
        return True


class CanCreatePreferenceNotification(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_preferencenotification."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.add_preferencenotification")
            )
        return True


class CanUpdatePreferenceNotification(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_preferencenotification."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.change_preferencenotification")
            )
        return True


class CanDeletePreferenceNotification(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_preferencenotification."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.delete_preferencenotification")
            )
        return True


# --- AuditLog ---
class CanViewAuditLog(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_auditlog."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.view_auditlog")
            )
        return True


class CanCreateAuditLog(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_auditlog."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.add_auditlog")
            )
        return True


class CanUpdateAuditLog(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_auditlog."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.change_auditlog")
            )
        return True


class CanDeleteAuditLog(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_auditlog."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("admin.delete_auditlog")
            )
        return True

