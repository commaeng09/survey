# Render.com 최적화된 Dockerfile
FROM python:3.11-slim

# 환경변수 설정
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        gcc \
        python3-dev \
        libpq-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# requirements 복사 및 Python 패키지 설치
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# 백엔드 코드 복사
COPY backend/ .

# 정적 파일 디렉토리 생성
RUN mkdir -p staticfiles

# 포트 노출
EXPOSE $PORT

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/admin/login/ || exit 1

# 엔트리포인트 스크립트 생성 및 실행
RUN echo '#!/bin/bash\n\
set -e\n\
echo "🚀 Starting Render deployment..."\n\
echo "📦 Running migrations..."\n\
python manage.py migrate --noinput\n\
echo "📁 Collecting static files..."\n\
python manage.py collectstatic --noinput\n\
echo "✅ Setup complete! Starting server..."\n\
exec gunicorn survey_project.wsgi:application \\\n\
    --bind 0.0.0.0:$PORT \\\n\
    --workers 3 \\\n\
    --timeout 120 \\\n\
    --max-requests 1000 \\\n\
    --preload \\\n\
    --log-level info\n' > /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

# 엔트리포인트 실행
CMD ["/app/entrypoint.sh"]
