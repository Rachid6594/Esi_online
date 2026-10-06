"""
Vues pour la bibliothèque numérique (Sprint 3).
"""
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from app.core.documents import enregistrer_fichier
from app.espace_library.models import DownloadHistory, LibraryDocument
from app.espace_library.serializers import (
    DownloadHistorySerializer,
    LibraryDocumentCreateSerializer,
    LibraryDocumentSerializer,
)


class LibraryDocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return LibraryDocumentCreateSerializer
        return LibraryDocumentSerializer

    def get_queryset(self):
        qs = LibraryDocument.objects.select_related(
            "auteur", "matiere", "filiere"
        ).filter(est_approuve=True)
        q = self.request.query_params.get("q")
        type_ = self.request.query_params.get("type")
        matiere = self.request.query_params.get("matiere")
        filiere = self.request.query_params.get("filiere")
        if q:
            qs = qs.filter(Q(titre__icontains=q) | Q(description__icontains=q))
        if type_:
            qs = qs.filter(type=type_)
        if matiere:
            qs = qs.filter(matiere_id=matiere)
        if filiere:
            qs = qs.filter(filiere_id=filiere)
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def create(self, request, *args, **kwargs):
        fichier = request.FILES.get("fichier")
        serializer = LibraryDocumentCreateSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        chemin = ""
        if fichier:
            chemin, _, _ = enregistrer_fichier(
                fichier, sous_dossier="library/documents"
            )
        doc = LibraryDocument.objects.create(
            **serializer.validated_data,
            auteur=request.user,
            fichier=chemin,
        )
        out = LibraryDocumentSerializer(doc, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        doc = self.get_object()
        if not (
            request.user.is_superuser
            or request.user.is_staff
            or doc.auteur_id == request.user.id
        ):
            return Response(
                {"detail": "Permission refusée."},
                status=status.HTTP_403_FORBIDDEN,
            )
        doc.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def download(self, request, pk=None):
        doc = self.get_object()
        doc.nb_telechargements += 1
        doc.save(update_fields=["nb_telechargements"])
        DownloadHistory.objects.create(document=doc, utilisateur=request.user)
        fichier_url = ""
        if doc.fichier:
            fichier_url = (
                request.build_absolute_uri(doc.fichier)
                if doc.fichier.startswith("/")
                else doc.fichier
            )
        return Response({"fichier_url": fichier_url})


class LibraryTreeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from app.administration.models import Filiere

        result = []
        for filiere in Filiere.objects.prefetch_related("matieres").all():
            filiere_data = {
                "id": filiere.id,
                "nom": filiere.libelle,
                "matieres": [],
            }
            for matiere in filiere.matieres.all():
                nb = LibraryDocument.objects.filter(
                    matiere=matiere, est_approuve=True
                ).count()
                filiere_data["matieres"].append(
                    {"id": matiere.id, "nom": matiere.libelle, "nb_docs": nb}
                )
            result.append(filiere_data)
        return Response(result)


class MyDownloadsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        history = DownloadHistory.objects.filter(
            utilisateur=request.user
        ).select_related("document", "document__matiere")
        serializer = DownloadHistorySerializer(history, many=True)
        return Response(serializer.data)


class TeacherStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"detail": "Permission refusée."},
                status=status.HTTP_403_FORBIDDEN,
            )
        docs = LibraryDocument.objects.filter(auteur=request.user).prefetch_related(
            "downloads__utilisateur"
        )
        result = []
        for doc in docs:
            derniers = doc.downloads.order_by("-date")[:5].select_related(
                "utilisateur"
            )
            result.append(
                {
                    "id": doc.id,
                    "titre": doc.titre,
                    "nb_telechargements": doc.nb_telechargements,
                    "derniers_telechargeurs": [
                        {
                            "id": d.utilisateur.id,
                            "nom": str(d.utilisateur),
                            "date": d.date.isoformat(),
                        }
                        for d in derniers
                    ],
                }
            )
        return Response(result)
