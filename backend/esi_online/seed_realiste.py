import os
import django
from datetime import datetime, date, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'esi_online.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from app.administration.models import (
    AnneeAcademique, Niveau, Filiere, Classe, Matiere, 
    EmploiDuTemps, Annonce, Ressource
)
from app.espace_student.models import Etudiant
from app.admin.models import User as AdminUser

User = get_user_model()

def run_seed():
    print("🚀 Début du peuplement réaliste de la base de données...")

    # 1. Nettoyage (optionnel, mais utile pour éviter les doublons si on relance)
    print("🧹 Nettoyage des anciennes données mock...")
    # On garde les utilisateurs existants pour ne pas casser le login 'saca'
    # Mais on peut supprimer les classes, matieres, etc.
    EmploiDuTemps.objects.all().delete()
    Ressource.objects.all().delete()
    Annonce.objects.all().delete()
    Matiere.objects.all().delete()
    Classe.objects.all().delete()
    Niveau.objects.all().delete()
    Filiere.objects.all().delete()

    # 2. Année académique
    annee, _ = AnneeAcademique.objects.get_or_create(libelle='2025-2026', defaults={'is_active': True})

    # 3. Création des Niveaux et Filières (Typique ESI)
    niveaux_data = [('CP1', 'C1'), ('CP2', 'C2'), ('1CS', '1C'), ('2CS', '2C'), ('3CS', '3C')]
    filieres_data = [
        ('TC', 'Tronc Commun'),
        ('GL', 'Génie Logiciel'),
        ('SIQ', 'Systèmes Informatiques'),
        ('SIT', 'Systèmes d\'Information et Technologie'),
        ('IASD', 'Intelligence Artificielle et Sciences des Données')
    ]
    
    niveaux = {n[0]: Niveau.objects.create(libelle=n[0], code=n[1]) for n in niveaux_data}
    filieres = {code: Filiere.objects.create(libelle=nom, code=code) for code, nom in filieres_data}

    # 4. Création des Classes
    print("🏫 Création des classes...")
    classes = {}
    classes['CP1_TC'] = Classe.objects.create(libelle='CP1 Tronc Commun', niveau=niveaux['CP1'], filiere=filieres['TC'], annee_academique=annee)
    classes['CP2_TC'] = Classe.objects.create(libelle='CP2 Tronc Commun', niveau=niveaux['CP2'], filiere=filieres['TC'], annee_academique=annee)
    classes['1CS_GL'] = Classe.objects.create(libelle='1CS Génie Logiciel', niveau=niveaux['1CS'], filiere=filieres['GL'], annee_academique=annee)
    classes['1CS_SIQ'] = Classe.objects.create(libelle='1CS Systèmes Info', niveau=niveaux['1CS'], filiere=filieres['SIQ'], annee_academique=annee)
    classes['2CS_GL'] = Classe.objects.create(libelle='2CS Génie Logiciel', niveau=niveaux['2CS'], filiere=filieres['GL'], annee_academique=annee)

    # 5. Utilisateurs Étudiants (Plusieurs profils)
    etudiants_info = [
        {'username': 'student_gl', 'email': 'student_gl@esi.dz', 'first': 'Yanis', 'last': 'Mansouri', 'classe': classes['1CS_GL'], 'mat': '1CSGL001'},
        {'username': 'student_siq', 'email': 'student_siq@esi.dz', 'first': 'Amira', 'last': 'Bouzid', 'classe': classes['1CS_SIQ'], 'mat': '1CSSIQ001'},
        {'username': 'student_cp', 'email': 'student_cp@esi.dz', 'first': 'Karim', 'last': 'Haddad', 'classe': classes['CP1_TC'], 'mat': 'CP1TC001'},
    ]

    print("🎓 Création des utilisateurs étudiants...")
    permissions = Permission.objects.filter(codename__in=[
        'view_matiere', 'view_emploidutemps', 'view_ressource', 'view_annonce', 'view_filiere', 'view_classe'
    ])

    admin_users = []
    for info in etudiants_info:
        user, created = User.objects.get_or_create(username=info['username'], defaults={
            'email': info['email'], 'first_name': info['first'], 'last_name': info['last'], 'is_staff': False, 'is_superuser': False
        })
        user.set_password('Password123')
        user.user_permissions.set(permissions)
        user.save()

        admin_user, _ = AdminUser.objects.get_or_create(id=user.id, defaults={'role': 'user'})
        admin_users.append(admin_user)

        Etudiant.objects.update_or_create(user=admin_user, defaults={'matricule': info['mat'], 'classe': info['classe']})

    # Utilisateur prof
    prof_user, _ = User.objects.get_or_create(username='prof_bensaid', defaults={'email': 'k_bensaid@esi.dz', 'first_name': 'Kamal', 'last_name': 'Bensaid'})
    prof_user.set_password('Password123')
    prof_user.save()
    admin_prof, _ = AdminUser.objects.get_or_create(id=prof_user.id, defaults={'role': 'professeur'})

    # 6. Création des Matières (Programme réaliste ESI)
    print("📚 Création du programme (Matières)...")
    matieres_data = [
        # CP1
        {'code': 'ALG1', 'libelle': 'Algèbre 1', 'credit': 5, 'semestre': 1, 'niveau': 'CP1', 'filiere': 'TC'},
        {'code': 'ANA1', 'libelle': 'Analyse 1', 'credit': 5, 'semestre': 1, 'niveau': 'CP1', 'filiere': 'TC'},
        {'code': 'ALGO1', 'libelle': 'Algorithmique 1', 'credit': 6, 'semestre': 1, 'niveau': 'CP1', 'filiere': 'TC'},
        {'code': 'ARCHI1', 'libelle': 'Architecture des ordinateurs 1', 'credit': 4, 'semestre': 1, 'niveau': 'CP1', 'filiere': 'TC'},
        # 1CS GL
        {'code': 'BDD', 'libelle': 'Bases de Données', 'credit': 5, 'semestre': 5, 'niveau': '1CS', 'filiere': 'GL'},
        {'code': 'SYST', 'libelle': 'Systèmes d\'Exploitation 1', 'credit': 5, 'semestre': 5, 'niveau': '1CS', 'filiere': 'GL'},
        {'code': 'POO', 'libelle': 'Programmation Orientée Objet (Java)', 'credit': 6, 'semestre': 5, 'niveau': '1CS', 'filiere': 'GL'},
        {'code': 'RES1', 'libelle': 'Réseaux Informatiques 1', 'credit': 4, 'semestre': 5, 'niveau': '1CS', 'filiere': 'GL'},
        {'code': 'THG', 'libelle': 'Théorie des Graphes', 'credit': 3, 'semestre': 5, 'niveau': '1CS', 'filiere': 'GL'},
        {'code': 'COMP', 'libelle': 'Compilation', 'credit': 4, 'semestre': 5, 'niveau': '1CS', 'filiere': 'GL'},
        # 1CS SIQ
        {'code': 'BDD_SIQ', 'libelle': 'Bases de Données', 'credit': 5, 'semestre': 5, 'niveau': '1CS', 'filiere': 'SIQ'},
        {'code': 'SYST2', 'libelle': 'Systèmes d\'Exploitation Avancés', 'credit': 6, 'semestre': 5, 'niveau': '1CS', 'filiere': 'SIQ'},
    ]

    matieres_objs = {}
    for m in matieres_data:
        obj = Matiere.objects.create(
            code=m['code'],
            libelle=m['libelle'],
            credit=m['credit'],
            semestre=m['semestre'],
            type_matiere="Cours",
            niveau=niveaux[m['niveau']],
            filiere=filieres[m['filiere']]
        )
        matieres_objs[m['code']] = obj

    # 7. Création de l'emploi du temps (Très complet pour 1CS GL)
    print("📅 Génération des emplois du temps...")
    jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
    creneaux = [("08:00:00", "10:00:00"), ("10:00:00", "12:00:00"), ("13:30:00", "15:30:00"), ("15:30:00", "17:30:00")]
    salles_cours = ['Amphi A', 'Amphi B', 'Amphi C']
    salles_tp = ['Labo 1', 'Labo 2', 'Labo 3', 'Labo 4']
    salles_td = ['Salle 201', 'Salle 202', 'Salle 203']

    # Planning 1CS GL
    planning_1cs_gl = [
        ('Lundi', 0, 'POO', 'Cours', salles_cours[0]),
        ('Lundi', 1, 'BDD', 'Cours', salles_cours[0]),
        ('Lundi', 2, 'THG', 'TD', salles_td[0]),
        ('Mardi', 0, 'SYST', 'Cours', salles_cours[1]),
        ('Mardi', 1, 'RES1', 'Cours', salles_cours[1]),
        ('Mardi', 2, 'POO', 'TP', salles_tp[0]),
        ('Mardi', 3, 'BDD', 'TP', salles_tp[1]),
        ('Mercredi', 0, 'COMP', 'Cours', salles_cours[2]),
        ('Mercredi', 1, 'COMP', 'TD', salles_td[1]),
        ('Jeudi', 0, 'SYST', 'TD', salles_td[2]),
        ('Jeudi', 1, 'RES1', 'TP', salles_tp[2]),
    ]

    for jour, creneau_idx, code_mat, type_seance, salle in planning_1cs_gl:
        EmploiDuTemps.objects.create(
            matiere=matieres_objs[code_mat],
            jour=jour,
            heure_debut=creneaux[creneau_idx][0],
            heure_fin=creneaux[creneau_idx][1],
            salle=salle,
            type_seance=type_seance,
            annee_academique=annee,
            classe=classes['1CS_GL']
        )

    # 8. Création de Ressources Pédagogiques (Fichiers, Cours, TD)
    print("📂 Ajout des documents et ressources...")
    for code, matiere in matieres_objs.items():
        if matiere.niveau.code == '1C':
            # Ajouter 3 ressources par matière 1CS
            Ressource.objects.create(
                titre=f"Cours Complet - {matiere.libelle}",
                matiere=matiere,
                type_ressource="Cours",
                fichier=f"supports/{code.lower()}_cours.pdf",
                taille_fichier=random.randint(1500000, 8500000), # Entre 1.5MB et 8.5MB
                annee_academique=annee,
                uploaded_by_id=admin_prof.id
            )
            Ressource.objects.create(
                titre=f"Série de TD N°1 - {matiere.libelle}",
                matiere=matiere,
                type_ressource="TD",
                fichier=f"supports/{code.lower()}_td1.pdf",
                taille_fichier=random.randint(300000, 900000),
                annee_academique=annee,
                uploaded_by_id=admin_prof.id
            )
            if 'TP' in [p[3] for p in planning_1cs_gl if p[2] == code]:
                Ressource.objects.create(
                    titre=f"Énoncé TP1 - {matiere.libelle}",
                    matiere=matiere,
                    type_ressource="TP",
                    fichier=f"supports/{code.lower()}_tp1.pdf",
                    taille_fichier=random.randint(500000, 1200000),
                    annee_academique=annee,
                    uploaded_by_id=admin_prof.id
                )

    # 9. Création d'Annonces et Notifications (Dates récentes)
    print("🔔 Génération d'annonces de l'administration...")
    annonces = [
        {"titre": "Planning des examens finaux", "contenu": "Le planning des examens du S5 est affiché au niveau de l'administration et sera bientôt disponible sur la plateforme.", "cat": "Information"},
        {"titre": "Changement de salle", "contenu": "Le cours de Systèmes d'Exploitation du mardi est déplacé à l'Amphi C pour cette semaine.", "cat": "Urgent"},
        {"titre": "Fermeture de la bibliothèque", "contenu": "La bibliothèque sera exceptionnellement fermée ce jeudi après-midi pour inventaire.", "cat": "Alerte"},
        {"titre": "Club scientifique", "contenu": "Le CSE organise un hackathon ce weekend. Inscriptions ouvertes !", "cat": "Événement"},
        {"titre": "Rappel: Remise des TPs", "contenu": "Dernier délai pour la remise du TP2 de Bases de Données : Dimanche à 23h59.", "cat": "Urgent"},
    ]

    for i, ann in enumerate(annonces):
        # Répartir les dates sur les 7 derniers jours
        date_pub = datetime.now() - timedelta(days=random.randint(0, 7))
        Annonce.objects.create(
            titre=ann['titre'],
            contenu=ann['contenu'],
            categorie=ann['cat'],
            auteur_id=admin_prof.id,
            date_publication=date_pub
        )

    print("\n✅ BASE DE DONNÉES PEUPLÉE AVEC SUCCÈS !")
    print("--------------------------------------------------")
    print(" COMPTES ÉTUDIANTS (Mot de passe: Password123) :")
    for info in etudiants_info:
        print(f" - {info['email']}  ({info['first']} {info['last']}, {info['classe'].libelle})")
    print("--------------------------------------------------")


if __name__ == '__main__':
    run_seed()
