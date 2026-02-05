"""
Définition et validation du schéma d'un modèle pour la génération de code.
"""
from dataclasses import dataclass, field
from typing import Any


# Mapping type schéma -> type Django
DJANGO_FIELD_MAP = {
    "char": "CharField",
    "text": "TextField",
    "int": "IntegerField",
    "integer": "IntegerField",
    "bigint": "BigIntegerField",
    "float": "FloatField",
    "decimal": "DecimalField",
    "bool": "BooleanField",
    "boolean": "BooleanField",
    "date": "DateField",
    "datetime": "DateTimeField",
    "time": "TimeField",
    "email": "EmailField",
    "url": "URLField",
    "slug": "SlugField",
    "uuid": "UUIDField",
    "json": "JSONField",
    "fk": "ForeignKey",
    "one2one": "OneToOneField",
    "m2m": "ManyToManyField",
}


@dataclass
class ModelDefinition:
    """Définition d'un modèle Django pour la génération."""

    model_name: str
    app_name: str
    fields: dict[str, dict[str, Any]]
    meta: dict[str, str] = field(default_factory=dict)

    def get_django_field_type(self, field_name: str) -> str:
        """Retourne le type Django (ex: CharField) pour un champ."""
        f = self.fields.get(field_name, {})
        t = (f.get("type") or "char").lower().replace(" ", "_")
        return DJANGO_FIELD_MAP.get(t, "CharField")

    def get_field_params(self, field_name: str) -> dict[str, Any]:
        """Paramètres du champ pour models.XXX(...)."""
        f = self.fields.get(field_name, {})
        params = {}
        if "max_length" in f:
            params["max_length"] = f["max_length"]
        if "max_digits" in f:
            params["max_digits"] = f["max_digits"]
        if "decimal_places" in f:
            params["decimal_places"] = f["decimal_places"]
        if f.get("null"):
            params["null"] = True
        if f.get("blank"):
            params["blank"] = True
        if "default" in f:
            params["default"] = f["default"]
        if "verbose_name" in f:
            params["verbose_name"] = f["verbose_name"]
        if "choices" in f:
            params["choices"] = f["choices"]
        t = (f.get("type") or "char").lower().replace(" ", "_")
        if t in ("fk", "one2one", "m2m") and "to" in f:
            params["to"] = f["to"]
            if t != "m2m":
                raw = (f.get("on_delete") or "CASCADE").upper().replace("-", "_")
                params["on_delete"] = f"models.{raw}" if raw in ("CASCADE", "SET_NULL", "SET_DEFAULT", "PROTECT", "DO_NOTHING") else "models.CASCADE"
        if "related_name" in f:
            params["related_name"] = f["related_name"]
        return params


class SchemaValidator:
    """Valide les données d'un modèle et retourne une ModelDefinition."""

    @staticmethod
    def validate_model(data: dict[str, Any]) -> ModelDefinition:
        """
        Valide et normalise les données du modèle.
        data attendu: model_name, app_name, fields { name: { type, max_length?, null?, blank?, ... } }, meta? {}
        """
        model_name = (data.get("model_name") or "").strip()
        app_name = (data.get("app_name") or "").strip().lower().replace("-", "_")
        if not model_name or not app_name:
            raise ValueError("model_name et app_name sont requis.")
        if not model_name[0].isupper():
            model_name = model_name[0].upper() + model_name[1:]

        fields = data.get("fields") or {}
        if not isinstance(fields, dict):
            raise ValueError("fields doit être un dictionnaire.")
        meta = data.get("meta") or {}

        return ModelDefinition(
            model_name=model_name,
            app_name=app_name,
            fields=fields,
            meta=meta,
        )
