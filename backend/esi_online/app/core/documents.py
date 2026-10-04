"""
Stockage des documents deposes et liste des types de documents.

Ce module est partage parce que deux espaces deposent des fichiers dans la
meme table Ressource : celui de l'etudiant (PermissionUploadService) et celui
de l'admin. Avant, chaque cote avait sa propre liste d'extensions et son propre
ecriture sur disque, ce qui empechait de les comparer.

Ressource.fichier est un CharField qui stocke un chemin relatif, pas un
FileField. C'est volontaire : le fichier vit sur le disque et le chemin pointe
vers lui. Si le stockage passe un jour sur un bucket, seule la fonction
enregistrer_fichier() est a reecrire, la base ne bouge pas.
"""
import uuid
from pathlib import Path

from django.conf import settings

from app.core.exceptions import ValidationError

# (valeur stockee en base, libelle affiche). La valeur est le seul contrat
# avec la base et elle tient dans les 15 caracteres de Ressource.type_ressource.
TYPES_DOCUMENT = [
    ("Cours", "Cours"),
    ("TD", "TD"),
    ("TP", "TP"),
    ("Devoir", "Devoir"),
    ("Examen", "Examen"),
    ("Rapport", "Rapport de stage ou mémoire"),
    ("Exercice", "Exercice"),
    ("Annonce", "Annonce"),
    ("Document", "Document"),
    ("Autre", "Autre"),
]

TYPES_DOCUMENT_VALIDES = {valeur for valeur, _ in TYPES_DOCUMENT}

# Les memes types que TYPES_UPLOAD_CHOICES historique de l'espace etudiant,
# completes des nouveau types. L'import se fait dans espace_student/models.py
# pour garder une seule definition.

EXTENSIONS_AUTORISEES = {
    ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx",
    ".png", ".jpg", ".jpeg", ".gif", ".txt", ".zip", ".rar", ".7z",
    ".py", ".c", ".cpp", ".java",
}

# 20 Mo : meme plafond que celui historique de l'upload etudiant, pour ne pas
# creuser deux limites differentes selon qui depose.
TAILLE_MAX_OCTETS = 20 * 1024 * 1024


def enregistrer_fichier(
    uploaded_file,
    *,
    sous_dossier: str,
    taille_max: int = TAILLE_MAX_OCTETS,
    extensions: set[str] | None = None,
) -> tuple[str, int, str]:
    """
    Ecrit un fichier televerse sous MEDIA_ROOT et renvoie (chemin_relatif,
    taille_en_octets, extension).

    Le nom d origine n est jamais reutilise : on garde l extension et on
    remplace le reste par un uuid. Un fichier contenant ".." ou un nom
    construit pour traverser un dossier ne peut donc pas ecrit hors du
    dossier de destination.
    """
    extensions = extensions or EXTENSIONS_AUTORISEES

    if uploaded_file is None:
        raise ValidationError("Le fichier est requis.")

    nom = getattr(uploaded_file, "name", "") or ""
    extension = Path(nom).suffix.lower()

    if extension not in extensions:
        raise ValidationError(
            f"Extension non autorisée : {extension or '(aucune)'}. "
            f"Autorisées : {', '.join(sorted(extensions))}"
        )

    taille = getattr(uploaded_file, "size", 0) or 0
    if taille > taille_max:
        raise ValidationError(
            f"Fichier trop volumineux ({_lisible(taille)}), "
            f"maximum {_lisible(taille_max)}."
        )

    dossier = Path(settings.MEDIA_ROOT) / sous_dossier
    dossier.mkdir(parents=True, exist_ok=True)

    nom_securise = f"{uuid.uuid4().hex}{extension}"
    chemin = dossier / nom_securise
    with open(chemin, "wb") as sortie:
        for morceau in uploaded_file.chunks():
            sortie.write(morceau)

    return f"{sous_dossier}/{nom_securise}", taille, extension


def _lisible(octets: int) -> str:
    """20 * 1024 * 1024 doit s'afficher « 20.0 Mo » et non « 20971520 »."""
    if octets < 1024:
        return f"{octets} o"
    if octets < 1024 * 1024:
        return f"{octets / 1024:.1f} Ko"
    return f"{octets / (1024 * 1024):.1f} Mo"
