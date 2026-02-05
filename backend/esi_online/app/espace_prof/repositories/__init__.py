from app.espace_prof.repositories.prof_repository import ProfRepository

__all__ = ["ProfRepository", "EnseignantRepository", "CoursRepository", "ChapitreRepository", "RessourceCoursRepository", "ExerciceRepository", "TPRepository", "FichierSupportTPRepository", "QCMRepository", "QuestionQCMRepository", "ReponseQCMRepository"]
from app.espace_prof.repositories.enseignant_repository import EnseignantRepository
from app.espace_prof.repositories.cours_repository import CoursRepository
from app.espace_prof.repositories.chapitre_repository import ChapitreRepository
from app.espace_prof.repositories.ressourcecours_repository import RessourceCoursRepository
from app.espace_prof.repositories.exercice_repository import ExerciceRepository
from app.espace_prof.repositories.tp_repository import TPRepository
from app.espace_prof.repositories.fichiersupporttp_repository import FichierSupportTPRepository
from app.espace_prof.repositories.qcm_repository import QCMRepository
from app.espace_prof.repositories.questionqcm_repository import QuestionQCMRepository
from app.espace_prof.repositories.reponseqcm_repository import ReponseQCMRepository
