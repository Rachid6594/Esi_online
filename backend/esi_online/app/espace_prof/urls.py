"""
URLs pour l'application prof.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.espace_prof.views.prof_viewset import ProfViewSet

router = DefaultRouter(trailing_slash=False)
router.register(r"", ProfViewSet, basename="prof")

urlpatterns = [
    path("", include(router.urls)),
]
app_name = "prof"
