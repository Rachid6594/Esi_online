from django.urls import path

from app.authentification.api import views

app_name = "authentification"

urlpatterns = [
    path("me/", views.current_user),
    path("register/", views.register),
]
