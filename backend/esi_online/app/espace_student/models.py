"""
Modèles pour l'application eleve.
"""
from django.db import models
from django.utils import timezone


class Eleve(models.Model):
    """Modèle Eleve."""
    name = models.CharField(max_length=255, verbose_name="Nom")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de modification")

    class Meta:
        verbose_name = "Eleve"
        verbose_name_plural = "Eleve"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Etudiant(models.Model):
    """Etudiant."""

    user = models.OneToOneField(to='app_admin.User', on_delete=models.CASCADE, related_name='etudiant_profile')
    matricule = models.CharField(max_length=20)
    date_naissance = models.DateField(null=True, blank=True)
    lieu_naissance = models.CharField(max_length=200, null=True, blank=True)
    adresse = models.TextField(null=True, blank=True)
    classe = models.ForeignKey(null=True, to='administration.Classe', on_delete=models.SET_NULL, related_name='etudiants')
    annee_entree = models.IntegerField(null=True, blank=True)
    contact_urgence_nom = models.CharField(max_length=200, null=True, blank=True)
    contact_urgence_phone = models.CharField(max_length=20, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'etudiants'
        verbose_name = 'Étudiant'
        verbose_name_plural = 'Étudiants'
        ordering = ['-created_at']

    def __str__(self):
        return str(self.title if hasattr(self, 'title') else self.id)

class RenduTP(models.Model):
    """RenduTP."""

    tp = models.ForeignKey(to='espace_prof.TP', on_delete=models.CASCADE, related_name='rendus')
    etudiant = models.ForeignKey(to='espace_student.Etudiant', on_delete=models.CASCADE, related_name='rendus_tp')
    fichier = models.CharField(max_length=500)
    commentaire_etudiant = models.TextField(null=True, blank=True)
    statut = models.CharField(max_length=15, default='RENDU')
    note = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    commentaire_enseignant = models.TextField(null=True, blank=True)
    fichier_correction = models.CharField(max_length=500, null=True, blank=True)
    date_correction = models.DateTimeField(null=True, blank=True)
    corrige_par = models.ForeignKey(null=True, blank=True, to='espace_prof.Enseignant', on_delete=models.SET_NULL, related_name='tps_corriges')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rendus_tp'
        verbose_name = 'Rendu TP'
        verbose_name_plural = 'Rendus TP'
        ordering = ['-created_at']

    def __str__(self):
        return str(self.title if hasattr(self, 'title') else self.id)

class TentativeQCM(models.Model):
    """TentativeQCM."""

    qcm = models.ForeignKey(to='espace_prof.QCM', on_delete=models.CASCADE, related_name='tentatives')
    etudiant = models.ForeignKey(to='espace_student.Etudiant', on_delete=models.CASCADE, related_name='tentatives_qcm')
    numero_tentative = models.IntegerField(default=1)
    statut = models.CharField(max_length=15, default='EN_COURS')
    date_fin = models.DateTimeField(null=True, blank=True)
    note_obtenue = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    pourcentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tentatives_qcm'
        verbose_name = 'Tentative QCM'
        verbose_name_plural = 'Tentatives QCM'
        ordering = ['-created_at']

    def __str__(self):
        return str(self.title if hasattr(self, 'title') else self.id)

class ReponseEtudiantQCM(models.Model):
    """ReponseEtudiantQCM."""

    tentative = models.ForeignKey(to='espace_student.TentativeQCM', on_delete=models.CASCADE, related_name='reponses_etudiant')
    question = models.ForeignKey(to='espace_prof.QuestionQCM', on_delete=models.CASCADE, related_name='reponses_etudiants')
    is_correcte = models.BooleanField(default=False)
    points_obtenus = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reponses_etudiant_qcm'
        verbose_name = 'Réponse Étudiant QCM'
        verbose_name_plural = 'Réponses Étudiant QCM'
        ordering = ['-created_at']

    def __str__(self):
        return str(self.title if hasattr(self, 'title') else self.id)


TYPE_UPLOAD_CHOICES = [
    ("Cours", "Cours"),
    ("TD", "TD"),
    ("TP", "TP"),
    ("Devoir", "Devoir"),
    ("Examen", "Examen"),
    ("Autre", "Autre"),
]

TYPES_UPLOAD_VALIDES = {c[0] for c in TYPE_UPLOAD_CHOICES}


class PermissionUploadEtudiant(models.Model):
    """
    Droit d'upload accordé par un admin à un étudiant précis.
    Seuls les étudiants avec is_active=True peuvent uploader,
    et uniquement les types listés dans types_autorises.
    """

    etudiant = models.OneToOneField(
        to="espace_student.Etudiant",
        on_delete=models.CASCADE,
        related_name="permission_upload",
    )
    types_autorises = models.JSONField(
        default=list,
        help_text="Liste de types : Cours, TD, TP, Devoir, Examen, Autre",
    )
    is_active = models.BooleanField(default=True)
    note = models.CharField(max_length=255, blank=True, default="")
    accorde_par = models.ForeignKey(
        to="auth.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="permissions_upload_accordees",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "permissions_upload_etudiant"
        verbose_name = "Permission upload étudiant"
        verbose_name_plural = "Permissions upload étudiants"
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Upload #{self.pk} — actif={self.is_active}"

    def types_normes(self):
        raw = self.types_autorises or []
        return [t for t in raw if t in TYPES_UPLOAD_VALIDES]

    def peut_uploader_type(self, type_ressource: str) -> bool:
        if not self.is_active:
            return False
        return type_ressource in self.types_normes()

