from django.urls import path
from . import views
from .debug_views import debug_settings_view

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('check-username/', views.check_username_view, name='check_username'),
    path('debug-settings/', debug_settings_view, name='debug_settings'),
]
