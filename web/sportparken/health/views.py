# Python
import logging
# Packages
from django.conf import settings
from django.db import connection
from django.http import HttpResponse

# Project
from sportparken.dataset.models import Sportpark

log = logging.getLogger(__name__)


def health(request):
    # check database
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            assert cursor.fetchone()
    except:
        log.exception("Database connectivity failed")
        return HttpResponse(
            "Database connectivity failed",
            content_type="text/plain", status=500)

    # check debug
    if settings.DEBUG:
        log.exception("Debug mode not allowed in production")
        return HttpResponse(
            "Debug mode not allowed in production",
            content_type="text/plain", status=500)

    return HttpResponse(
        "Health OK", content_type='text/plain', status=200)


def check_data(request):
    # check bag
    try:
        assert Sportpark.objects.count() > 30
    except:
        log.exception("No Sportparken data found")
        return HttpResponse(
            "No Sportparken data found",
            content_type="text/plain", status=500)

    return HttpResponse("Data OK", content_type='text/plain', status=200)
