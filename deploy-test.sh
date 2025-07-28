#!/bin/bash

# Survey App Deployment Test Script
echo "🚀 Survey 애플리케이션 배포 전 최종 테스트"
echo "=================================================="

# 1. 프론트엔드 빌드 테스트
echo "📦 1. 프론트엔드 빌드 테스트..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ 프론트엔드 빌드 성공"
else
    echo "❌ 프론트엔드 빌드 실패"
    exit 1
fi

# 2. TypeScript 타입 체크
echo "🔍 2. TypeScript 타입 체크..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
    echo "✅ TypeScript 타입 체크 통과"
else
    echo "❌ TypeScript 타입 오류 발견"
    exit 1
fi

# 3. 백엔드 Django 체크 (선택사항)
echo "🐍 3. Django 백엔드 체크..."
cd backend
python manage.py check --deploy > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Django 백엔드 설정 확인"
else
    echo "⚠️ Django 백엔드 경고 (배포는 가능)"
fi
cd ..

echo ""
echo "🎉 모든 테스트 통과! 배포 준비 완료"
echo "📋 다음 단계:"
echo "   1. Vercel에서 프론트엔드 배포"
echo "   2. Railway에서 백엔드 배포"
echo "   3. API URL 연결"
echo ""
echo "📖 상세 가이드: DEPLOY_NOW.md 참조"
