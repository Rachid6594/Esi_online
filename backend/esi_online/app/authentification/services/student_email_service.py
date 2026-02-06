"""
Envoi des identifiants aux étudiants créés et lien pour changer le mot de passe.
"""
import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator

User = get_user_model()
logger = logging.getLogger(__name__)


def get_frontend_url() -> str:
    return getattr(settings, "FRONTEND_URL", "http://localhost:5173").rstrip("/")


def make_invitation_link(user) -> str:
    """Génère le lien pour changer le mot de passe (première connexion)."""
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return f"{get_frontend_url()}/changer-mot-de-passe?uid={uid}&token={token}"


def send_student_credentials(user, raw_password: str) -> None:
    """
    Envoie un email à l'étudiant avec ses identifiants de connexion
    et un lien pour définir un nouveau mot de passe.
    """
    link = make_invitation_link(user)
    subject = "Vos identifiants ESI Online"
    message = (
        f"Bonjour,\n\n"
        f"Un compte étudiant a été créé pour vous sur ESI Online.\n\n"
        f"Identifiants de connexion :\n"
        f"  Email : {user.email}\n"
        f"  Mot de passe temporaire : {raw_password}\n\n"
        f"Nous vous invitons à changer ce mot de passe dès votre première connexion.\n"
        f"Cliquez sur le lien suivant pour définir un nouveau mot de passe :\n\n"
        f"{link}\n\n"
        f"À bientôt,\nL'équipe ESI Online"
    )
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@esi.bf")
    # Brevo : DEFAULT_FROM_EMAIL doit être un expéditeur déclaré et vérifié dans Brevo (Expéditeurs).
    try:
        print(f"[Email] Envoi identifiants vers {user.email} ...", flush=True)
        send_mail(
            subject,
            message,
            from_email,
            [user.email],
            fail_silently=False,
        )
        print(f"[Email] Envoyé avec succès à {user.email}", flush=True)
    except Exception as e:
        print(f"[Email] ÉCHEC vers {user.email}: {e}", flush=True)
        logger.exception("Envoi email étudiant échoué (destinataire=%s): %s", user.email, e)
        raise
