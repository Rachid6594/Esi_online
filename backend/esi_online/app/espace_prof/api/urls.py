from django.urls import path
from . import views


urlpatterns = [

    path("enseignants/", views.enseignant_list),
    path("enseignants/<int:pk>/", views.enseignant_detail),

    path("courss/", views.cours_list),
    path("courss/<int:pk>/", views.cours_detail),

    path("chapitres/", views.chapitre_list),
    path("chapitres/<int:pk>/", views.chapitre_detail),

    path("ressourcecourss/", views.ressourcecours_list),
    path("ressourcecourss/<int:pk>/", views.ressourcecours_detail),

    path("exercices/", views.exercice_list),
    path("exercices/<int:pk>/", views.exercice_detail),

    path("tps/", views.tp_list),
    path("tps/<int:pk>/", views.tp_detail),

    path("fichiersupporttps/", views.fichiersupporttp_list),
    path("fichiersupporttps/<int:pk>/", views.fichiersupporttp_detail),

    path("qcms/", views.qcm_list),
    path("qcms/<int:pk>/", views.qcm_detail),

    path("questionqcms/", views.questionqcm_list),
    path("questionqcms/<int:pk>/", views.questionqcm_detail),

    path("reponseqcms/", views.reponseqcm_list),
    path("reponseqcms/<int:pk>/", views.reponseqcm_detail),

    path("enseignants/", views.enseignant_list),
    path("enseignants/<int:pk>/", views.enseignant_detail),

    path("courss/", views.cours_list),
    path("courss/<int:pk>/", views.cours_detail),

    path("chapitres/", views.chapitre_list),
    path("chapitres/<int:pk>/", views.chapitre_detail),

    path("ressourcecourss/", views.ressourcecours_list),
    path("ressourcecourss/<int:pk>/", views.ressourcecours_detail),

    path("exercices/", views.exercice_list),
    path("exercices/<int:pk>/", views.exercice_detail),

    path("tps/", views.tp_list),
    path("tps/<int:pk>/", views.tp_detail),

    path("fichiersupporttps/", views.fichiersupporttp_list),
    path("fichiersupporttps/<int:pk>/", views.fichiersupporttp_detail),

    path("qcms/", views.qcm_list),
    path("qcms/<int:pk>/", views.qcm_detail),

    path("questionqcms/", views.questionqcm_list),
    path("questionqcms/<int:pk>/", views.questionqcm_detail),

    path("reponseqcms/", views.reponseqcm_list),
    path("reponseqcms/<int:pk>/", views.reponseqcm_detail),
]
