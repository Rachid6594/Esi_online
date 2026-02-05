"""
URLs pour l'application admin.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.admin.views.admin_viewset import AdminViewSet

router = DefaultRouter(trailing_slash=False)
router.register(r"", AdminViewSet, basename="admin")

urlpatterns = [
    path("", include(router.urls)),
]
app_name = "app_admin"  # évite conflit avec django.contrib.admin (namespace "admin")
