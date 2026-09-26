"""Initialize the Railway database once before serving API requests."""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

from django.core.management import call_command
from django.db import connection, transaction
from app.dbmodels.models import Team
from scripts.ingest_raw_data import (
    ingest_teams, ingest_games, ingest_players, ingest_possessions,
)

with connection.cursor() as cursor:
    cursor.execute("CREATE SCHEMA IF NOT EXISTS app")
call_command("migrate", interactive=False)
if not Team.objects.exists():
    with transaction.atomic():
        ingest_teams()
        ingest_games()
        ingest_players()
        ingest_possessions()
call_command("collectstatic", interactive=False, verbosity=0)
