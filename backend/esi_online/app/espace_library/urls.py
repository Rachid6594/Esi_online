"""
URLs pour l'application espace_bibliotheque.
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from app.espace_library.views.espace_bibliotheque_viewset import EspaceBibliothequeViewSet
from app.espace_library.views import (
    LibraryDocumentViewSet,
    LibraryTreeView,
    MyDownloadsView,
    TeacherStatsView,
)

# Ancien router — conservé pour ne pas casser l'API existante
router = DefaultRouter(trailing_slash=False)
router.register(r"", EspaceBibliothequeViewSet, basename="espace_bibliotheque")

# Nouveau router — bibliothèque numérique Sprint 3
library_router = DefaultRouter()
library_router.register(r"documents", LibraryDocumentViewSet, basename="library-document")

library_urlpatterns = [
    *library_router.urls,
    path("tree/", LibraryTreeView.as_view(), name="library-tree"),
    path("my-downloads/", MyDownloadsView.as_view(), name="my-downloads"),
    path("teacher-stats/", TeacherStatsView.as_view(), name="teacher-stats"),
]

urlpatterns = [
    path("", include(router.urls)),
]
app_name = "espace_library"
