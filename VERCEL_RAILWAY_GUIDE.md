# 🚀 Vercel + Railway 배포 가이드 (권장)

## 📋 배포 전략
- **Vercel**: React 프론트엔드 배포
- **Railway**: Django 백엔드 배포

---

## 🔥 **1단계: Railway 백엔드 배포**

### 1-1. Railway 계정 생성
1. https://railway.app 접속
2. "Login with GitHub" 클릭

### 1-2. 백엔드 프로젝트 생성
1. "New Project" → "Deploy from GitHub repo"
2. `commaeng09/survey` 선택
3. **⚠️ 중요**: Root Directory를 `backend`로 설정

### 1-3. PostgreSQL 데이터베이스 추가
1. "New Service" → "Database" → "PostgreSQL"
2. 자동으로 DATABASE_URL 환경변수 생성됨

### 1-4. 환경변수 설정 (Variables 탭):
```
DEBUG=False
SECRET_KEY=django-insecure-make-this-very-long-and-random-in-production
ALLOWED_HOSTS=*.railway.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### 1-5. 배포 확인
- 완료 후 URL 메모 (예: https://survey-backend.railway.app)

---

## 🔥 **2단계: Vercel 프론트엔드 배포**

### 2-1. Vercel 계정 생성
1. https://vercel.com 접속  
2. "Continue with GitHub" 클릭

### 2-2. 프론트엔드 배포
1. "New Project" 클릭
2. `commaeng09/survey` Import
3. **Framework Preset**: Vite
4. **Root Directory**: 기본값 (루트)
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`

### 2-3. 환경변수 설정:
```
VITE_API_URL=https://your-backend.railway.app/api
```
(Railway에서 받은 실제 URL 사용)

---

## 🔄 **3단계: CORS 설정 업데이트**

Vercel 배포 완료 후, Railway 환경변수 업데이트:
```
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

---

## ✅ **배포 완료 후 테스트**

1. **프론트엔드**: https://your-app.vercel.app
2. **백엔드 API**: https://your-backend.railway.app/api/
3. **관리자**: https://your-backend.railway.app/admin/

---

## 💡 **장점**
- ✅ 각 플랫폼의 강점 활용
- ✅ 안정적인 배포
- ✅ 자동 HTTPS
- ✅ 자동 스케일링
- ✅ 무료 티어 충분

---

## 🚀 **지금 바로 시작하세요!**

1. **Railway 먼저** (백엔드)
2. **Vercel 나중에** (프론트엔드)
3. **환경변수 연결**
