# Django 백엔드 구현 가이드

## 🏗️ 프로젝트 구조

```
survey-backend/
├── survey_project/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── authentication/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── surveys/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   └── responses/
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       └── urls.py
├── requirements.txt
├── runtime.txt
├── Procfile
└── manage.py
```

## 📦 필수 패키지 (requirements.txt)

```
Django==4.2.7
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.7
python-decouple==3.8
whitenoise==6.6.0
gunicorn==21.2.0
pillow==10.1.0
```

## 🗄️ 데이터베이스 모델

### User 모델 (확장)
```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('instructor', '강사'),
        ('admin', '관리자'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='instructor')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Survey 모델
```python
class Survey(models.Model):
    STATUS_CHOICES = [
        ('draft', '초안'),
        ('published', '배포중'),
        ('closed', '마감'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='surveys')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Question 모델
```python
class Question(models.Model):
    TYPE_CHOICES = [
        ('short-text', '단답형'),
        ('long-text', '장문형'),
        ('multiple-choice', '객관식'),
        ('checkbox', '체크박스'),
        ('dropdown', '드롭다운'),
        ('rating', '평점'),
    ]
    
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='questions')
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    required = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    options = models.JSONField(default=list, blank=True)  # 객관식 등의 선택지
```

### Response 모델
```python
class Response(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='responses')
    respondent_ip = models.GenericIPAddressField()
    submitted_at = models.DateTimeField(auto_now_add=True)

class Answer(models.Model):
    response = models.ForeignKey(Response, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_text = models.TextField(blank=True)
    answer_choice = models.JSONField(default=list, blank=True)  # 객관식 답변
```

## 🔐 JWT 인증 설정

### settings.py
```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

## 🌐 API 엔드포인트

### 인증 API
```python
# apps/authentication/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
]
```

### 설문지 API
```python
# apps/surveys/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'surveys', views.SurveyViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('surveys/<int:survey_id>/publish/', views.PublishSurveyView.as_view(), name='publish-survey'),
    path('surveys/<int:survey_id>/responses/', views.ResponseCreateView.as_view(), name='submit-response'),
    path('surveys/<int:survey_id>/analytics/', views.AnalyticsView.as_view(), name='survey-analytics'),
]
```

## 🚀 무료 배포 가이드

### 1. Railway 배포 (추천)
1. **Railway 계정 생성**: railway.app
2. **GitHub 저장소 연결**
3. **환경 변수 설정**:
   ```
   DATABASE_URL=postgresql://...
   SECRET_KEY=your-secret-key
   DEBUG=False
   ALLOWED_HOSTS=*.railway.app
   ```

### 2. Render 배포
1. **Render 계정 생성**: render.com
2. **Web Service 생성**
3. **빌드 명령어**: `pip install -r requirements.txt`
4. **시작 명령어**: `gunicorn survey_project.wsgi:application`

### 3. 프론트엔드 배포 (Vercel)
1. **환경 변수 추가**:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   ```

## 📋 배포 체크리스트

### 백엔드 설정
- [ ] SECRET_KEY 환경변수 설정
- [ ] DEBUG=False
- [ ] ALLOWED_HOSTS 설정
- [ ] CORS 설정
- [ ] 정적 파일 설정 (WhiteNoise)
- [ ] 데이터베이스 마이그레이션

### 프론트엔드 연동
- [ ] API 기본 URL 환경변수 설정
- [ ] 토큰 저장/관리 로직 수정
- [ ] API 호출 함수 구현
- [ ] 에러 처리 개선

### 보안 설정
- [ ] CORS 허용 도메인 설정
- [ ] CSP 헤더 설정
- [ ] JWT 토큰 보안 설정
- [ ] 환경변수 보안

## 💡 다음 단계

1. **Django 프로젝트 생성 및 설정**
2. **모델 및 API 구현**
3. **프론트엔드 API 연동**
4. **배포 환경 설정**
5. **도메인 연결 (선택사항)**

각 단계별로 자세한 구현을 도와드릴 수 있습니다!
