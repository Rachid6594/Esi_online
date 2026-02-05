"""
URLs pour l'application eleve.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.espace_student.views.eleve_viewset import EleveViewSet

router = DefaultRouter(trailing_slash=False)
router.register(r"", EleveViewSet, basename="eleve")

urlpatterns = [
    path("", include(router.urls)),
]
app_name = "eleve"
