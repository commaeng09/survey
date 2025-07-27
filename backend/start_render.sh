#!/bin/bash

# Render.com 배포 스크립트
set -o errexit

echo "🚀 Starting Render deployment..."

# 데이터베이스 마이그레이션
echo "📦 Running database migrations..."
python manage.py migrate --noinput

# 정적 파일 수집
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# 슈퍼유저 생성 (선택적)
echo "👤 Creating superuser if not exists..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created')
else:
    print('Superuser already exists')
EOF

echo "✅ Deployment setup complete!"

# Gunicorn 시작
echo "🌐 Starting Gunicorn server..."
exec gunicorn survey_project.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120
