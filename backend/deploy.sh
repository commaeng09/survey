#!/bin/bash

# 배포 스크립트
echo "🚀 Django 설문조사 백엔드 배포 시작..."

# 1. 가상환경 생성 및 활성화
echo "📦 가상환경 생성 중..."
python -m venv venv

# Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    # macOS/Linux
    source venv/bin/activate
fi

# 2. 패키지 설치
echo "📚 패키지 설치 중..."
pip install -r requirements.txt

# 3. 환경변수 설정
echo "⚙️ 환경변수 설정..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ .env 파일이 생성되었습니다. 필요한 설정을 수정해주세요."
fi

# 4. 데이터베이스 마이그레이션
echo "🗄️ 데이터베이스 마이그레이션..."
python manage.py makemigrations
python manage.py migrate

# 5. 슈퍼유저 생성 (선택사항)
echo "👤 관리자 계정을 생성하시겠습니까? (y/n)"
read -r create_superuser
if [ "$create_superuser" = "y" ]; then
    python manage.py createsuperuser
fi

# 6. 정적 파일 수집 (운영환경)
echo "📁 정적 파일 수집..."
python manage.py collectstatic --noinput

echo "✅ 배포 완료!"
echo "🖥️ 개발 서버 실행: python manage.py runserver"
echo "🌐 관리자 페이지: http://localhost:8000/admin/"
