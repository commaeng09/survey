# Railway 배포 가이드

## 1. GitHub에 코드 업로드
```bash
# 프로젝트 루트에서
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/survey-app.git
git push -u origin main
```

## 2. Railway 배포

### 백엔드 배포:
1. https://railway.app 회원가입
2. "New Project" → "Deploy from GitHub repo"
3. `backend` 폴더 선택
4. 환경변수 설정:
   ```
   DEBUG=False
   SECRET_KEY=your-super-secret-key-here
   ALLOWED_HOSTS=*.railway.app
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```
5. PostgreSQL 데이터베이스 추가:
   - "Add Service" → "Database" → "PostgreSQL"
   - 자동으로 DATABASE_URL 환경변수 생성됨

### 백엔드 URL 확인:
- 배포 완료 후 URL 복사 (예: https://your-app.railway.app)

## 3. Vercel 배포

### 프론트엔드 배포:
1. https://vercel.com 회원가입
2. "New Project" → GitHub repo 선택
3. Root Directory를 "src" 또는 프론트엔드 폴더로 설정
4. 환경변수 설정:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
5. Deploy 클릭

## 4. 도메인 연결 (선택사항)
- Vercel에서 Custom Domain 설정 가능
- Railway에서도 Custom Domain 지원

## 5. 자동 배포 설정
- GitHub에 push할 때마다 자동 배포됨
- main 브랜치 → 운영환경
- develop 브랜치 → 개발환경 (별도 설정시)
