"""
URLs pour l'application eleve.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.espace_student.views.eleve_viewset import EleveViewSet
from app.espace_student.api import upload_views

router = DefaultRouter(trailing_slash=False)
router.register(r"", EleveViewSet, basename="eleve")

urlpatterns = [
    path("upload-types/", upload_views.upload_types),
    path("upload-permissions/", upload_views.upload_permissions_list),
    path("upload-permissions/<int:pk>/", upload_views.upload_permissions_detail),
    path("me/upload-permission/", upload_views.my_upload_permission),
    path("me/upload/", upload_views.my_upload_ressource),
    path("", include("app.espace_student.api.urls")),
    path("", include(router.urls)),
]
app_name = "eleve"
