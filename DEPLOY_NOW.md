# 🚀 Survey 애플리케이션 즉시 배포 가이드

## ✅ 현재 상태
- ✅ TypeScript 빌드 오류 해결 완료
- ✅ ESLint 경고 대부분 해결
- ✅ 프로덕션 빌드 성공 (312KB)
- ✅ 개발 서버 정상 작동
- ✅ GitHub 업로드 완료

---

## 🔥 즉시 배포 단계

### 1️⃣ **Vercel 프론트엔드 배포 (5분)**

1. **Vercel 접속**: https://vercel.com
2. **GitHub 연결**: "Continue with GitHub"
3. **프로젝트 Import**:
   - Repository: `commaeng09/survey`
   - Framework: **Vite**
   - Root Directory: **/** (기본값)
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **배포 완료 후**:
   - Vercel URL 복사 (예: https://survey-abc123.vercel.app)

### 2️⃣ **Railway 백엔드 배포 (10분)**

1. **Railway 접속**: https://railway.app
2. **GitHub 연결**: "Login with GitHub"
3. **프로젝트 생성**:
   - "New Project" → "Deploy from GitHub repo"
   - Repository: `commaeng09/survey`
   - **Root Directory**: `backend` ⚠️ 중요!

4. **PostgreSQL 추가**:
   - "New Service" → "Database" → "PostgreSQL"

5. **환경변수 설정** (Variables 탭):
   ```
   DEBUG=False
   SECRET_KEY=django-super-secret-key-change-this-in-production-make-it-very-long
   ALLOWED_HOSTS=*.railway.app,*.vercel.app
   CORS_ALLOWED_ORIGINS=https://survey-abc123.vercel.app
   ```

6. **배포 완료 후**:
   - Railway URL 복사 (예: https://survey-backend-xyz.railway.app)

### 3️⃣ **API URL 연결 (2분)**

Vercel에서 환경변수 설정:
```
VITE_API_BASE_URL=https://survey-backend-xyz.railway.app/api
```

---

## 🎯 예상 배포 URL

- **프론트엔드**: https://survey-[random].vercel.app
- **백엔드**: https://survey-backend-[random].railway.app
- **총 배포 시간**: 약 15-20분

---

## 🔧 배포 후 테스트

1. 프론트엔드 URL 접속
2. 회원가입/로그인 테스트
3. 설문 생성 테스트
4. 설문 응답 테스트

---

## 📞 지원

배포 중 문제가 발생하면:
1. Vercel/Railway 로그 확인
2. 브라우저 개발자 도구 Console 확인
3. API 연결 상태 확인

**이제 바로 배포를 시작하세요!** 🚀
