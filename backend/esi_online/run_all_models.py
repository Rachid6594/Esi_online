#!/usr/bin/env python3
"""
Cree les apps (admin, administration, espace_student, espace_prof) si besoin,
puis genere tous les modeles depuis models_zones (zones: admin, espace, eleve, prof).
Les zones eleve et prof ecrivent dans app/espace_student et app/espace_prof.
Usage: python run_all_models.py
"""
import subprocess
import sys
from pathlib import Path

_here = Path(__file__).resolve().parent
_backend = _here.parent
sys.path.insert(0, str(_here))
sys.path.insert(0, str(_backend))

# Ordre des zones et des modèles (respect des dépendances)
ZONES_ET_MODELES = [
    # 1. admin (aucune dép interne)
    ("admin", ["user", "super_admin", "audit_log", "notification", "preference_notification"]),
    # 2. espace (administration) - première vague (sans affectation, ressource qui dépendent de prof/eleve)
    (
        "espace",
        [
            "annee_academique",
            "niveau",
            "filiere",
            "classe",
            "matiere",
            "administration_ecole",
            "annonce",
            "lecture_annonce",
            "emploi_du_temps",
            "evenement",
            "categorie",
            "tag",
        ],
    ),
    # 3. prof - enseignant d'abord
    ("prof", ["enseignant"]),
    # 4. eleve - etudiant (dépend de admin.User, administration.Classe)
    ("eleve", ["etudiant"]),
    # 5. espace - deuxième vague (affectation_enseignant, ressource, etc.)
    (
        "espace",
        [
            "affectation_enseignant",
            "ressource",
            "consultation_ressource",
            "exemplaire",
            "emprunt",
            "reservation",
            "message",
            "forum",
            "sujet",
            "reponse",
            "reaction_reponse",
        ],
    ),
    # 6. prof - reste
    (
        "prof",
        [
            "cours",
            "chapitre",
            "ressource_cours",
            "exercice",
            "tp",
            "fichier_support_tp",
            "qcm",
            "question_qcm",
            "reponse_qcm",
        ],
    ),
    # 7. eleve - reste
    ("eleve", ["rendu_tp", "tentative_qcm", "reponse_etudiant_qcm"]),
]


def run(cmd: list[str]) -> bool:
    r = subprocess.run(cmd, cwd=str(_here))
    return r.returncode == 0


def main():
    # Apps réelles (dossiers dans app/) : admin, administration, espace_student, espace_prof
    apps_a_creer = ["admin", "administration", "espace_student", "espace_prof"]
    print("=" * 60)
    print("1. Creation des apps (admin, administration, espace_student, espace_prof)")
    print("=" * 60)
    for app in apps_a_creer:
        if (_here / "app" / app).exists():
            print(f"  [OK] app/{app} existe deja.")
        else:
            print(f"  Creation de app/{app}...")
            if not run([sys.executable, "run_menu.py", "--create-app-full", app]):
                print(f"  [ERREUR] Echec creation {app}")
                sys.exit(1)
    print()

    print("=" * 60)
    print("2. Generation des modeles (--generate-from-zone)")
    print("=" * 60)
    for zone, modeles in ZONES_ET_MODELES:
        for modele in modeles:
            print(f"  {zone} / {modele} ... ", end="", flush=True)
            if run([sys.executable, "run_menu.py", "--generate-from-zone", zone, modele]):
                print("OK")
            else:
                print("ERREUR (on continue)")
    print()
    print("Termine. Puis: python manage.py makemigrations && python manage.py migrate")


if __name__ == "__main__":
    main()
