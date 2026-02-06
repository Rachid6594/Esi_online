"""
Django settings for esi_online project.
Variables sensibles et configuration via .env (django-environ).
Applications métier dans le dossier app/.
"""
from pathlib import Path

import environ

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Environ : charger .env (projet ou dossier parent backend/)
env = environ.Env(
    DEBUG=(bool, False),
)
env_file = BASE_DIR / ".env"
if not env_file.exists():
    env_file = BASE_DIR.parent / ".env"
if env_file.exists():
    # Windows : tenter UTF-8 puis Latin-1 si le .env contient des accents
    try:
        environ.Env.read_env(env_file=str(env_file), encoding="utf-8")
    except UnicodeDecodeError:
        environ.Env.read_env(env_file=str(env_file), encoding="cp1252")

# ---------------------------------------------------------------------------
# Sécurité
# ---------------------------------------------------------------------------
SECRET_KEY = env(
    "SECRET_KEY",
    default="django-insecure-change-me-in-production-use-env",
)
DEBUG = env("DEBUG", default=True)
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

# ---------------------------------------------------------------------------
# Applications : Django + nos apps dans le dossier app/
# ---------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Apps tierces
    "rest_framework",
    "corsheaders",
    # Nos applications (dossier app/) — app.admin via AdminConfig pour label unique
    "app.admin.apps.AdminConfig",
    "app.administration",
    "app.authentification",
    "app.core",
    "app.espace_library",
    "app.espace_prof",
    "app.espace_student",
    
   
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "esi_online.urls"
WSGI_APPLICATION = "esi_online.wsgi.application"

# ---------------------------------------------------------------------------
# Templates
# ---------------------------------------------------------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ---------------------------------------------------------------------------
# Base de données PostgreSQL (variables dans .env)
# ---------------------------------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("DB_NAME", default="esi_online"),
        "USER": env("DB_USER", default="postgres"),
        "PASSWORD": env("DB_PASSWORD", default=""),
        "HOST": env("DB_HOST", default="127.0.0.1"),
        "PORT": env("DB_PORT", default="5432"),
        "OPTIONS": env.dict("DB_OPTIONS", default={}),
    }
}

# ---------------------------------------------------------------------------
# Validation des mots de passe
# ---------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ---------------------------------------------------------------------------
# Internationalisation
# ---------------------------------------------------------------------------
LANGUAGE_CODE = env("LANGUAGE_CODE", default="fr-fr")
TIME_ZONE = env("TIME_ZONE", default="Africa/Algiers")
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------------------------
# Fichiers statiques et médias
# ---------------------------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"] if (BASE_DIR / "static").exists() else []

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

# ---------------------------------------------------------------------------
# Django REST Framework (JWT pour login unique + redirection par rôle)
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

# ---------------------------------------------------------------------------
# CORS (à restreindre en production)
# ---------------------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = env("CORS_ALLOW_ALL_ORIGINS", default=DEBUG)
if not CORS_ALLOW_ALL_ORIGINS:
    CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])

# ---------------------------------------------------------------------------
# Frontend (liens dans les emails)
# ---------------------------------------------------------------------------
FRONTEND_URL = env("FRONTEND_URL", default="http://localhost:5173")

# ---------------------------------------------------------------------------
# Email (envoi identifiants étudiants, invitations, etc.)
# Par défaut : console (les emails s'affichent dans le terminal).
# Pour envoyer de vrais emails : utiliser Brevo (ex-Sendinblue) ou un autre SMTP.
# ---------------------------------------------------------------------------
EMAIL_HOST = env("EMAIL_HOST", default="")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="noreply@esi.bf")

# Si EMAIL_HOST est défini, utiliser le backend SMTP ; sinon console
if EMAIL_HOST:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
else:
    EMAIL_BACKEND = env(
        "EMAIL_BACKEND",
        default="django.core.mail.backends.console.EmailBackend",
    )

# ---------------------------------------------------------------------------
# Divers
# ---------------------------------------------------------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Chemin des applications métier (pour les imports)
# Les apps vivent dans : BASE_DIR / "app" / "accounts", "app" / "library", etc.
APPS_DIR = BASE_DIR / "app"
