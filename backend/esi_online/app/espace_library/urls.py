"""
URLs pour l'application espace_bibliotheque.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.espace_library.views.espace_bibliotheque_viewset import EspaceBibliothequeViewSet

router = DefaultRouter(trailing_slash=False)
router.register(r"", EspaceBibliothequeViewSet, basename="espace_bibliotheque")

urlpatterns = [
    path("", include(router.urls)),
]
app_name = "espace_library"
