from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from app.authentification.api import views

app_name = "authentification"

urlpatterns = [
    path("login/", views.login_view),
    path("token/refresh/", TokenRefreshView.as_view()),
    path("me/", views.current_user),
    path("register/", views.register),
    path("students/", views.students_list),
    path("students/export/", views.students_export),
    path("students/create/", views.create_student),
    path("students/import-csv/", views.import_students_csv),
    path("bibliothecaires/", views.bibliothecaires_list),
    path("bibliothecaires/create/", views.create_bibliothecaire),
    path("professeurs/", views.professeurs_list),
    path("professeurs/create/", views.create_professeur),
    path("invitation/validate/", views.validate_invitation_token),
    path("invitation/set-password/", views.set_password_from_invitation),
]
