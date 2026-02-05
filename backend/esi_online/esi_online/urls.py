"""
URL configuration for esi_online project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    # Apps (noms réels des dossiers dans app/)
    path("api/auth/", include("app.authentification.api.urls")),
    path("api/admin/", include("app.admin.urls")),
    path("api/administration/", include("app.administration.urls")),
    path("api/eleve/", include("app.espace_student.urls")),
    path("api/prof/", include("app.espace_prof.urls")),
    path("api/bibliotheque/", include("app.espace_library.urls")),
]
