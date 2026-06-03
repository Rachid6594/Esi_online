import os
import django
from datetime import datetime, date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'esi_online.settings')
django.setup()

from django.contrib.auth import get_user_model
from app.administration.models import (
    AnneeAcademique, Niveau, Filiere, Matiere, 
    EmploiDuTemps, Annonce, Ressource
)
from app.espace_student.models import Etudiant, Eleve

User = get_user_model()

def run_seed():
    print("⏳ Création de l'utilisateur étudiant (test_student)...")
    user, created = User.objects.get_or_create(
        username='test_student',
        defaults={
            'email': 'student@esi.dz',
            'first_name': 'Ahmed',
            'last_name': 'Benali',
            'is_staff': False,
            'is_superuser': False,
        }
    )
    from django.contrib.auth.models import Permission
    if created:
        user.set_password('Password123')
        user.save()
        print("✅ Utilisateur 'test_student' créé (Mot de passe: Password123)")
    else:
        # Update password if already exists
        user.set_password('Password123')
        user.save()
        print("✅ Utilisateur 'test_student' mis à jour (Mot de passe: Password123)")

    # Donner les permissions de lecture pour éviter l'erreur 403 sur l'espace étudiant
    permissions = Permission.objects.filter(codename__in=[
        'view_matiere', 'view_emploidutemps', 'view_ressource', 'view_annonce', 'view_filiere', 'view_classe'
    ])
    user.user_permissions.set(permissions)

    from app.admin.models import User as AdminUser
    admin_user, _ = AdminUser.objects.get_or_create(
        id=user.id,
        defaults={'role': 'user'}
    )

    # Création de l'année
    annee, _ = AnneeAcademique.objects.get_or_create(libelle='2025-2026', defaults={'is_active': True})
    
    # Création du niveau
    niveau, _ = Niveau.objects.get_or_create(libelle='L3', code='L3')
    
    # Création de la filière
    filiere, _ = Filiere.objects.get_or_create(libelle='Génie Logiciel', code='GL')
    
    from app.administration.models import Classe
    classe, _ = Classe.objects.get_or_create(libelle='L3 GL', defaults={'niveau': niveau, 'filiere': filiere, 'annee_academique': annee})

    # Lier l'étudiant à la table Etudiant
    print("⏳ Assignation du profil académique...")
    try:
        Etudiant.objects.get_or_create(
            user=admin_user, 
            defaults={'matricule': '20231GL0042', 'classe': classe}
        )
    except Exception as e:
        print(f"⚠️ Impossible de créer le profil Etudiant: {e}")

    print("⏳ Création de données mock pour le frontend...")
    # Matieres
    m1, _ = Matiere.objects.get_or_create(
        code="INF301", 
        defaults={"libelle": "Algorithmique et structures de données", "credit": 4, "type_matiere": "Cours", "niveau": niveau, "filiere": filiere, "semestre": 5}
    )
    m2, _ = Matiere.objects.get_or_create(
        code="INF302", 
        defaults={"libelle": "Bases de données relationnelles", "credit": 4, "type_matiere": "Cours+TD", "niveau": niveau, "filiere": filiere, "semestre": 5}
    )

    # Emploi du temps
    EmploiDuTemps.objects.get_or_create(
        matiere=m1, jour="Lundi", heure_debut="08:00:00", heure_fin="10:00:00",
        defaults={"salle": "Amphi A", "type_seance": "Cours", "annee_academique": annee, "classe": classe}
    )
    EmploiDuTemps.objects.get_or_create(
        matiere=m2, jour="Mardi", heure_debut="10:00:00", heure_fin="12:00:00",
        defaults={"salle": "Labo 1", "type_seance": "TP", "annee_academique": annee, "classe": classe}
    )

    # Ressources
    Ressource.objects.get_or_create(
        titre="Cours complet Algorithmique",
        defaults={"matiere": m1, "type_ressource": "Cours", "fichier": "dummy/cours.pdf", "taille_fichier": 2516582, "annee_academique": annee, "uploaded_by_id": admin_user.id}
    )

    # Annonces
    Annonce.objects.get_or_create(
        titre="Rappel d'examen",
        defaults={"contenu": "L'examen blanc aura lieu ce vendredi.", "categorie": "Urgent", "auteur_id": admin_user.id, "date_publication": datetime.now()}
    )

    print("🎉 Seeding terminé avec succès !")
    print("=> Connectez-vous avec : student@esi.dz / Password123")

if __name__ == '__main__':
    run_seed()
