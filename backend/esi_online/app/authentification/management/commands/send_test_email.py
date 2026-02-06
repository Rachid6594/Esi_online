"""
Commande de test : envoi d'un email pour vérifier la config (Brevo, etc.).
Usage : python manage.py send_test_email votre@email.com
"""
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings


class Command(BaseCommand):
    help = "Envoie un email de test (vérifier config SMTP / Brevo)"

    def add_arguments(self, parser):
        parser.add_argument("dest", type=str, help="Adresse email destinataire")

    def handle(self, *args, **options):
        dest = options["dest"]
        backend = getattr(settings, "EMAIL_BACKEND", "")
        host = getattr(settings, "EMAIL_HOST", "")
        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "")
        user = getattr(settings, "EMAIL_HOST_USER", "")

        self.stdout.write(f"Backend : {backend}")
        self.stdout.write(f"EMAIL_HOST : {host}")
        self.stdout.write(f"DEFAULT_FROM_EMAIL : {from_email}")
        self.stdout.write(f"EMAIL_HOST_USER : {user}")
        self.stdout.write(f"Destinataire : {dest}")
        self.stdout.write("")

        try:
            n = send_mail(
                subject="Test ESI Online",
                message="Ceci est un email de test. Si vous le recevez, la config SMTP fonctionne.",
                from_email=from_email,
                recipient_list=[dest],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS(f"Envoi réussi (nb={n}). Vérifiez la boîte de réception (et les spams)."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Erreur : {e!s}"))
            import traceback
            traceback.print_exc()
