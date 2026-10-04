# Documentation API

Le schéma OpenAPI du projet a une seule source de vérité, côté backend :

    backend/esi_online/openapi-schema.yaml

Ce dossier ne contient plus de copie. Les deux emplacements étaient
identiques à l'octet près sans rien pour les synchroniser, ce qui a laissé
le schéma avec 17 endpoints de retard sur le backend réel.

## Régénérer le schéma

Depuis le dossier `backend/esi_online/` :

    ../.venv/bin/python manage.py spectacular --file openapi-schema.yaml

Vérifié : cette commande reproduit le fichier versionné à l'octet près.

Le schéma est également servi en direct par le backend, si le service est
lancé :

- `/api/schema/` — le YAML lui-même
- `/api/docs/` — Swagger UI
- `/api/redoc/` — ReDoc

La documentation interactive est donc la façon la plus fiable de consulter
l'état réel de l'API ; le fichier versionné sert d'archive.

## À savoir avant de régénérer

Trois endpoints sont déclarés sans corps de réponse, parce que leurs
vues sont des fonctions `@api_view` sans sérialiseur et que
drf-spectacular ne peut rien deviner :

- `/api/eleve/upload-permissions/` (GET et POST)
- `/api/eleve/me/upload/`
- `/api/eleve/me/upload-permission/`

Le `requestBody` de l'upload est correctement décrit, mais les `responses`
ne portent qu'une description. Les corriger demande d'écrire des
sérialiseurs DRF pour `PermissionUploadService.serialize()` et de les
référencer dans les `responses=` des `@extend_schema` de
`backend/esi_online/app/espace_student/api/upload_views.py`.
