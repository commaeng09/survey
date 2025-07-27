# 🚀 Railway + Vercel 배포 가이드

## 📋 배포 순서
1. GitHub에 코드 업로드
2. Railway에서 백엔드 배포
3. Vercel에서 프론트엔드 배포
4. 도메인 연결 및 테스트

---

## 🔥 **1단계: GitHub 저장소 생성**

### 1-1. GitHub에서 새 저장소 생성
1. https://github.com 접속
2. "New repository" 클릭
3. Repository name: `survey-app` (원하는 이름)
4. Public 선택 (무료 배포용)
5. "Create repository" 클릭

### 1-2. 로컬에서 Git 초기화 및 업로드
```bash
# 프로젝트 루트 폴더에서 실행
cd "c:\Users\HOME\OneDrive\바탕 화면\git\reset"

# Git 초기화
git init

# 모든 파일 추가
git add .

# 첫 번째 커밋
git commit -m "Initial commit: Survey app with Django backend and React frontend"

# GitHub 저장소 연결 (YOUR_USERNAME을 실제 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/survey-app.git

# 메인 브랜치로 설정
git branch -M main

# GitHub에 업로드
git push -u origin main
```

---

## 🚂 **2단계: Railway 백엔드 배포**

### 2-1. Railway 계정 생성
1. https://railway.app 접속
2. "Login" → "Login with GitHub" 선택
3. GitHub 계정으로 로그인

### 2-2. 백엔드 프로젝트 생성
1. "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. 방금 만든 저장소 선택
4. **중요**: Root Directory를 `backend`로 설정

### 2-3. PostgreSQL 데이터베이스 추가
1. 프로젝트 대시보드에서 "New Service" 클릭
2. "Database" → "PostgreSQL" 선택
3. 자동으로 `DATABASE_URL` 환경변수가 생성됩니다

### 2-4. 환경변수 설정
Variables 탭에서 다음 환경변수들을 추가:

```
DEBUG=False
SECRET_KEY=your-super-secret-production-key-here-make-it-long-and-random
ALLOWED_HOSTS=*.railway.app
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

**SECRET_KEY 생성 방법:**
```python
# Python에서 실행
import secrets
print(secrets.token_urlsafe(50))
```

### 2-5. 배포 확인
- 배포가 완료되면 URL이 생성됩니다 (예: `https://survey-backend-production.railway.app`)
- `/admin/` 접속해서 관리자 페이지가 뜨는지 확인
- 이 URL을 메모해 두세요!

---

## 🔥 **3단계: Vercel 프론트엔드 배포**

### 3-1. Vercel 계정 생성
1. https://vercel.com 접속
2. "Sign Up" → "Continue with GitHub" 선택

### 3-2. 프론트엔드 프로젝트 배포
1. "New Project" 클릭
2. GitHub 저장소 선택 후 "Import"
3. **Framework Preset**: Vite 선택
4. **Root Directory**: 기본값 (루트) 유지
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`

### 3-3. 환경변수 설정
Environment Variables에서:

**Variable Name**: `VITE_API_URL`
**Value**: `https://your-backend.railway.app/api` (Railway에서 받은 URL)

예시:
```
VITE_API_URL=https://survey-backend-production.railway.app/api
```

### 3-4. 배포 실행
- "Deploy" 클릭
- 배포 완료 후 URL 확인 (예: `https://survey-app.vercel.app`)

---

## 🔄 **4단계: CORS 설정 업데이트**

### 4-1. Railway에서 CORS 설정 수정
Vercel 배포가 완료되면, Railway의 환경변수를 업데이트:

```
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

실제 Vercel URL로 변경하세요!

### 4-2. Railway 재배포
환경변수 변경 후 자동으로 재배포됩니다.

---

## ✅ **5단계: 테스트**

### 5-1. 기본 기능 테스트
1. **프론트엔드 접속**: https://your-app.vercel.app
2. **회원가입**: 새 계정 생성 테스트
3. **로그인**: 생성한 계정으로 로그인
4. **설문 생성**: 새 설문조사 만들기
5. **설문 응답**: 설문 링크로 응답 테스트

### 5-2. 관리자 페이지 접속
1. **백엔드 관리자**: https://your-backend.railway.app/admin/
2. 개발환경에서 만든 관리자 계정으로는 접속 불가
3. 새 관리자 계정 생성 필요

---

## 🛠 **6단계: 운영환경 관리자 계정 생성**

### 6-1. Railway 터미널 접속
1. Railway 프로젝트 대시보드
2. "Deployments" 탭
3. 최신 배포 클릭
4. "View Logs" → "Connect to Terminal"

### 6-2. 관리자 계정 생성
터미널에서 실행:
```bash
python manage.py createsuperuser
```

---

## 📱 **7단계: 커스텀 도메인 (선택사항)**

### 7-1. Vercel 커스텀 도메인
1. Vercel 프로젝트 → Settings → Domains
2. 도메인 추가 (예: mydomain.com)

### 7-2. Railway 커스텀 도메인
1. Railway 프로젝트 → Settings → Domains
2. 도메인 추가 (예: api.mydomain.com)

---

## 🔄 **자동 배포 설정**

GitHub에 코드를 push하면 자동으로 배포됩니다:

```bash
# 코드 수정 후
git add .
git commit -m "Update features"
git push origin main

# → Railway와 Vercel이 자동으로 새 버전 배포
```

---

## 💡 **주의사항**

1. **환경변수 보안**: SECRET_KEY, DATABASE_URL 등은 절대 GitHub에 올리지 마세요
2. **무료 제한**: Railway는 월 $5 크레딧, Vercel은 월 100GB 대역폭
3. **슬립 모드**: Railway는 비활성 시 슬립모드 진입 (첫 요청 시 깨어남)
4. **HTTPS 필수**: 운영환경에서는 HTTPS만 사용

---

## 📞 **문제 해결**

### 백엔드 접속 안됨
- Railway 로그 확인
- 환경변수 설정 확인
- DATABASE_URL 확인

### 프론트엔드에서 API 호출 실패
- CORS 설정 확인
- VITE_API_URL 확인
- 네트워크 탭에서 요청 URL 확인

### 배포 실패
- 빌드 로그 확인
- requirements.txt 확인
- package.json 확인

---

이제 이 가이드를 따라 배포해보세요! 각 단계에서 막히는 부분이 있으면 언제든 물어보세요! 🚀
