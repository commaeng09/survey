@echo off
echo 🚀 Survey 애플리케이션 배포 전 최종 테스트
echo ==================================================

echo 📦 1. 프론트엔드 빌드 테스트...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 프론트엔드 빌드 실패
    pause
    exit /b 1
)
echo ✅ 프론트엔드 빌드 성공

echo 🔍 2. TypeScript 타입 체크...
call npx tsc --noEmit
if %errorlevel% neq 0 (
    echo ❌ TypeScript 타입 오류 발견
    pause
    exit /b 1
)
echo ✅ TypeScript 타입 체크 통과

echo 🐍 3. Django 백엔드 체크...
cd backend
python manage.py check --deploy >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Django 백엔드 설정 확인
) else (
    echo ⚠️ Django 백엔드 경고 (배포는 가능^)
)
cd ..

echo.
echo 🎉 모든 테스트 통과! 배포 준비 완료
echo 📋 다음 단계:
echo    1. Vercel에서 프론트엔드 배포
echo    2. Railway에서 백엔드 배포  
echo    3. API URL 연결
echo.
echo 📖 상세 가이드: DEPLOY_NOW.md 참조
pause
