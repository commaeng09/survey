from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('surveys', views.SurveyViewSet, basename='survey')

urlpatterns = [
    path('', include(router.urls)),
    path('public/<uuid:survey_id>/', views.survey_public_view, name='survey-public'),
    path('public/<uuid:survey_id>/submit/', views.submit_response, name='submit-response'),
    path('surveys/<uuid:survey_id>/responses/', views.survey_responses, name='survey-responses'),
]
