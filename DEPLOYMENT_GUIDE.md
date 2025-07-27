# 🚀 Survey 애플리케이션 배포 가이드

이 가이드는 React + Django 설문조사 애플리케이션을 Vercel(프론트엔드) + Railway(백엔드)에 배포하는 방법을 설명합니다.

## 📋 사전 요구사항

- GitHub 계정
- Vercel 계정 (https://vercel.com)
- Railway 계정 (https://railway.app)
- 이 프로젝트가 GitHub 리포지토리에 업로드되어 있어야 함

## 🎯 1. Django 백엔드 Railway 배포

### 1.1 Railway 프로젝트 생성
1. Railway (https://railway.app) 접속 및 로그인
2. "New Project" → "Deploy from GitHub repo" 선택
3. 이 GitHub 리포지토리 선택
4. 루트 디렉토리를 `/backend`로 설정

### 1.2 환경 변수 설정
Railway 대시보드 → Variables 탭에서 다음 환경 변수 추가:

```bash
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
DEBUG=False
ALLOWED_HOSTS=your-app-name.railway.app
DATABASE_URL=postgresql://... (Railway가 자동 생성)
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
PORT=8000
```

### 1.3 PostgreSQL 데이터베이스 추가
1. Railway 프로젝트에서 "New" → "Database" → "PostgreSQL" 선택
2. 자동으로 DATABASE_URL 환경 변수가 생성됨

### 1.4 배포 확인
- Railway가 자동으로 빌드 및 배포 진행
- 배포 완료 후 `https://your-app-name.railway.app/api/` 접속하여 확인

## 🌐 2. React 프론트엔드 Vercel 배포

### 2.1 Vercel 프로젝트 생성
1. Vercel (https://vercel.com) 접속 및 로그인
2. "New Project" 선택
3. 이 GitHub 리포지토리 선택
4. Framework Preset: Vite 선택
5. Root Directory: `.` (루트 그대로)

### 2.2 환경 변수 설정
Vercel 대시보드 → Settings → Environment Variables에서 추가:

```bash
VITE_API_URL=https://your-railway-app.railway.app/api
VITE_NODE_ENV=production
```

### 2.3 빌드 설정 확인
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 2.4 배포 완료
- Vercel이 자동으로 빌드 및 배포
- 완료 후 생성된 도메인으로 접속

## 🔧 3. 배포 후 설정

### 3.1 Railway에서 CORS 업데이트
Railway 환경 변수에서 CORS_ALLOWED_ORIGINS를 실제 Vercel 도메인으로 업데이트:
```bash
CORS_ALLOWED_ORIGINS=https://your-actual-vercel-domain.vercel.app
```

### 3.2 Django 관리자 계정 생성
Railway 프로젝트 터미널에서:
```bash
python manage.py createsuperuser
```

## 🧪 4. 테스트

### 4.1 API 테스트
```bash
curl https://your-railway-app.railway.app/api/
```

### 4.2 프론트엔드 테스트
브라우저에서 Vercel 도메인 접속하여 로그인/회원가입 테스트

## 🔒 5. 보안 설정

### 5.1 Django SECRET_KEY 생성
```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### 5.2 환경 변수 보안
- DEBUG=False 확인
- SECRET_KEY는 안전한 랜덤 문자열 사용
- 데이터베이스 비밀번호는 강력하게 설정

## 📊 6. 모니터링 및 로그

### Railway
- 대시보드에서 로그 확인
- 메트릭스 모니터링

### Vercel
- Functions 탭에서 빌드 로그 확인
- Analytics로 사용자 통계 확인

## 🚨 7. 문제 해결

### 일반적인 문제들:

1. **CORS 오류**
   - Railway 환경 변수의 CORS_ALLOWED_ORIGINS 확인
   - Vercel 도메인이 정확히 설정되었는지 확인

2. **API 연결 오류**
   - Vercel의 VITE_API_URL 환경 변수 확인
   - Railway 앱이 정상 실행 중인지 확인

3. **빌드 오류**
   - package.json의 dependencies 확인
   - Node.js 버전 호환성 확인

## 📞 지원

문제가 발생하면 다음을 확인하세요:
- Railway 로그
- Vercel 함수 로그
- 브라우저 개발자 도구 네트워크 탭

## 🎉 완료!

배포가 완료되면 다음과 같은 구조가 됩니다:
- **프론트엔드**: https://your-app.vercel.app
- **백엔드 API**: https://your-app.railway.app/api
- **관리자 패널**: https://your-app.railway.app/admin

테스트 계정:
- 강사: `instructor` / `password123`
- 관리자: `admin` / `admin123`
