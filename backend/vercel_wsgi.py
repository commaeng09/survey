import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'survey_project.settings')

application = get_wsgi_application()

# Vercel 호환
app = application
