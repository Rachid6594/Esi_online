"""
URLs pour l'application administration.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.administration.views.administration_viewset import AdministrationViewSet

router = DefaultRouter(trailing_slash=False)
router.register(r"", AdministrationViewSet, basename="administration")

urlpatterns = [
    path("", include(router.urls)),
]
app_name = "administration"
