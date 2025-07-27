from django.http import JsonResponse
from django.conf import settings

def debug_settings_view(request):
    """Railway 환경에서 Django 설정 디버그"""
    debug_info = {
        'DEBUG': settings.DEBUG,
        'CORS_ALLOW_ALL_ORIGINS': getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', 'NOT_SET'),
        'MIDDLEWARE': settings.MIDDLEWARE,
        'INSTALLED_APPS': settings.INSTALLED_APPS,
        'CORS_ALLOWED_ORIGINS': getattr(settings, 'CORS_ALLOWED_ORIGINS', 'NOT_SET'),
        'DATABASE_ENGINE': settings.DATABASES['default']['ENGINE'],
    }
    
    response = JsonResponse(debug_info, json_dumps_params={'indent': 2})
    # 직접 CORS 헤더 추가
    response['Access-Control-Allow-Origin'] = '*'
    return response
