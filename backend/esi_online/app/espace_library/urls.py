"""
URLs pour l'application espace_bibliotheque.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.espace_library.views import *

router = DefaultRouter(trailing_slash=False)
router.register(r"", EspaceBibliothequeViewSet, basename="espace_bibliotheque")
router.register(r"auteurs",       AuteurViewSet,             basename="auteur")
router.register(r"categories",    CategorieViewSet,          basename="categorie")
router.register(r"collections",   CollectionViewSet,         basename="collection")
router.register(r"livres",        LivreViewSet,              basename="livre")
router.register(r"rapports",      RapportSoutenanceViewSet,  basename="rapport")
router.register(r"devoirs",       DocumentDevoirViewSet,     basename="devoir")
router.register(r"signalements",  SignalementViewSet,        basename="signalement")


urlpatterns = [
    path("", include(router.urls)),
]
app_name = "espace_library"
