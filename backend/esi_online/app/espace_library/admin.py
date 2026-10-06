from django.contrib import admin

from app.espace_library.models import DownloadHistory, EspaceBibliotheque, LibraryDocument

admin.site.register(EspaceBibliotheque)


@admin.register(LibraryDocument)
class LibraryDocumentAdmin(admin.ModelAdmin):
    list_display = [
        "titre",
        "type",
        "auteur",
        "matiere",
        "filiere",
        "annee",
        "nb_telechargements",
        "date_ajout",
        "est_approuve",
    ]
    list_filter = ["type", "est_approuve", "filiere"]
    search_fields = ["titre", "description"]


@admin.register(DownloadHistory)
class DownloadHistoryAdmin(admin.ModelAdmin):
    list_display = ["document", "utilisateur", "date"]
    list_filter = ["date"]
