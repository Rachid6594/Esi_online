"""
Modèles pour l'application prof.
"""
from django.db import models
from django.utils import timezone


class Prof(models.Model):
    """Modèle Prof."""
    name = models.CharField(max_length=255, verbose_name="Nom")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de modification")

    class Meta:
        verbose_name = "Prof"
        verbose_name_plural = "Prof"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Enseignant(models.Model):
    """Enseignant."""

    user = models.OneToOneField(to='app_admin.User', on_delete=models.CASCADE, related_name='enseignant_profile')
    matricule = models.CharField(max_length=20)
    grade = models.CharField(max_length=20, null=True, blank=True)
    specialite = models.CharField(max_length=200, null=True, blank=True)
    bureau = models.CharField(max_length=50, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'enseignants'
        verbose_name = 'Enseignant'
        verbose_name_plural = 'Enseignants'
        ordering = ['-created_at']

    def __str__(self):
        return str(self.title if hasattr(self, 'title') else self.id)

class Cours(models.Model):
    """Cours."""

    titre = models.CharField(max_length=300)
    description = models.TextField(null=True, blank=True)
    matiere = models.ForeignKey(to='administration.Matiere', on_delete=models.CASCADE, related_name='cours')
    classe = models.ForeignKey(to='administration.Classe', on_delete=models.CASCADE, related_name='cours')
    enseignant = models.ForeignKey(to='espace_prof.Enseignant', on_delete=models.CASCADE, related_name='cours')
    annee_academique = models.ForeignKey(to='administration.AnneeAcademique', on_delete=models.CASCADE, related_name='cours')
    is_published = models.BooleanField(default=False)
    date_debut = models.DateField(null=True, blank=True)
    date_fin = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cours'
        verbose_name = 'Cours'
        verbose_name_plural = 'Cours'
        ordering = ['-created_at']

    def __str__(self):
        return str(self.title if hasattr(self, 'title') else self.id)

class Chapitre(models.Model):
    """Chapitre."""

    cours = models.ForeignKey(to='espace_prof.Cours', on_delete=models.CASCADE, related_name='chapitres')
    titre = models.CharField(max_length=300)
    description = models.TextField(null=True, blank=True)
    ordre = models.IntegerField(default=0)
    date_disponibilite = models.DateTimeField(null=True, blank=True)
    date_expiration = models.DateTimeField(null=True, blank=True)
    is_visible = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chapitres'
        verbose_name = 'Chapitre'
        verbose_name_plural = 'Chapitres'
        ordering = ['-created_at']

    def __str__(self):
        return str(self.title if hasattr(self, 'title') else self.id)

class RessourceCours(models.Model):
    """RessourceCours."""

    chapitre = models.ForeignKey(to='espace_prof.Chapitre', on_delete=models.CASCADE, related_name='ressources')
    titre = models.CharField(max_length=300)
    type_ressource = models.CharField(max_length=10)
    fichier = models.CharField(max_length=500, null=True, blank=True)
    lien = models.URLField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    ordre = models.IntegerField(default=0)
    is_downloadable = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ressources_cours'
        verbose_name = 'Ressource de Cours'
        verbose_name_plural = 'Ressources de Cours'
        ordering = ['-created_at']

    def __str__(self):
        return str(self.title if hasattr(self, 'title') else self.id)

class Exercice(models.Model):
    """Exercice."""

    chapitre = models.ForeignKey(to='espace_prof.Chapitre', on_delete=models.CASCADE, related_name='exercices')
    titre = models.CharField(max_length=300)
    enonce = models.TextField()
    fichier_enonce = models.CharField(max_length=500, null=True, blank=True)
    corrige = models.TextField(null=True, blank=True)
    fichier_corrige = models.CharField(max_length=500, null=True, blank=True)
    date_disponibilite_corrige = models.DateTimeField(null=True, blank=True)
    ordre = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'exercices'
        verbose_name = 'Exercice'
        verbose_name_plural = 'Exercices'
        ordering = ['-created_at']

    def __str__(self):
        return str(self.title if hasattr(self, 'title') else self.id)

class TP(models.Model):
    """TP."""

    chapitre = models.ForeignKey(to='espace_prof.Chapitre', on_delete=models.CASCADE, related_name='tps')
    titre = models.CharField(max_length=300)
    enonce = models.TextField()
    consignes = models.TextField(null=True, blank=True)
    fichier_enonce = models.CharField(max_length=500, null=True, blank=True)
    date_limite = models.DateTimeField()
    accepte_retard = models.BooleanField(default=False)
    penalite_retard = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    type_rendu = models.CharField(max_length=15, default='INDIVIDUEL')
    taille_groupe_max = models.IntegerField(default=1)
    formats_acceptes = models.CharField(max_length=200, default='.pdf,.zip,.py')
    taille_max_fichier = models.IntegerField(default=10)
    note_sur = models.DecimalField(max_digits=5, decimal_places=2, default=20)
    bareme = models.TextField(null=True, blank=True)
    ordre = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tps'
        verbose_name = 'TP'
        verbose_name_plural = 'TPs'
        ordering = ['-created_at']

    def __str__(self):
        return str(self.title if hasattr(self, 'title') else self.id)

class FichierSupportTP(models.Model):
    """FichierSupportTP."""

    tp = models.ForeignKey(to='espace_prof.TP', on_delete=models.CASCADE, related_name='fichiers_support')
    fichier = models.CharField(max_length=500)
    libelle = models.CharField(max_length=200, null=True, blank=True)
    ordre = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'fichiers_support_tp'
        verbose_name = 'Fichier support TP'
        verbose_name_plural = 'Fichiers support TP'
        ordering = ['-created_at']

    def __str__(self):
        return str(self.title if hasattr(self, 'title') else self.id)

class QCM(models.Model):
    """QCM."""

    chapitre = models.ForeignKey(to='espace_prof.Chapitre', on_delete=models.CASCADE, related_name='qcms')
    titre = models.CharField(max_length=300)
    description = models.TextField(null=True, blank=True)
    duree_minutes = models.IntegerField(default=30)
    note_sur = models.DecimalField(max_digits=5, decimal_places=2, default=20)
    nombre_tentatives_max = models.IntegerField(default=1)
    affiche_correction = models.BooleanField(default=True)
    melange_questions = models.BooleanField(default=True)
    date_ouverture = models.DateTimeField()
    date_fermeture = models.DateTimeField()
    ordre = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'qcms'
        verbose_name = 'QCM'
        verbose_name_plural = 'QCMs'
        ordering = ['-created_at']

    def __str__(self):
        return str(self.title if hasattr(self, 'title') else self.id)

class QuestionQCM(models.Model):
    """QuestionQCM."""

    qcm = models.ForeignKey(to='espace_prof.QCM', on_delete=models.CASCADE, related_name='questions')
    enonce = models.TextField()
    type_question = models.CharField(max_length=10, default='UNIQUE')
    points = models.DecimalField(max_digits=5, decimal_places=2, default=1)
    ordre = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'questions_qcm'
        verbose_name = 'Question QCM'
        verbose_name_plural = 'Questions QCM'
        ordering = ['-created_at']

    def __str__(self):
        return str(self.title if hasattr(self, 'title') else self.id)

class ReponseQCM(models.Model):
    """ReponseQCM."""

    question = models.ForeignKey(to='espace_prof.QuestionQCM', on_delete=models.CASCADE, related_name='reponses')
    texte = models.CharField(max_length=500)
    is_correcte = models.BooleanField(default=False)
    ordre = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reponses_qcm'
        verbose_name = 'Réponse QCM'
        verbose_name_plural = 'Réponses QCM'
        ordering = ['-created_at']

    def __str__(self):
        return str(self.title if hasattr(self, 'title') else self.id)

