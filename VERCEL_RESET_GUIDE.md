# Vercel 재설정 스크립트

## 1. Vercel CLI 설치 (아직 없다면)
npm i -g vercel

## 2. 로그인
vercel login

## 3. 현재 프로젝트 링크 해제
vercel --yes

## 4. 새 프로젝트로 배포
vercel --name survey-new-clean

## 5. 환경변수 설정
vercel env add VITE_API_URL
# 값: https://survey-backend-dgiy.onrender.com/api

vercel env add VITE_BACKEND_URL  
# 값: https://survey-backend-dgiy.onrender.com/api

## 6. 프로덕션 배포
vercel --prod

---

## 예상 새 URL
https://survey-new-clean.vercel.app
또는
https://survey-new-clean-[random].vercel.app
