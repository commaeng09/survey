# Render.com 최적화된 간단한 Dockerfile
FROM python:3.11-slim

# 환경변수 설정
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 의존성 설치 (PostgreSQL 지원 포함)
RUN apt-get update && apt-get install -y \
    postgresql-client \
    postgresql-server-dev-all \
    gcc \
    g++ \
    python3-dev \
    libpq-dev \
    pkg-config \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# pip 업그레이드
RUN pip install --upgrade pip

# requirements 복사 및 설치
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 백엔드 코드 복사
COPY backend/ .

# 정적 파일 디렉토리 생성
RUN mkdir -p staticfiles

# 시작 스크립트 생성
RUN echo '#!/bin/bash\n\
python manage.py migrate --noinput\n\
python manage.py collectstatic --noinput\n\
gunicorn survey_project.wsgi:application --bind 0.0.0.0:$PORT' > start.sh

RUN chmod +x start.sh

# 포트 설정
EXPOSE 10000

# 애플리케이션 실행
CMD ["./start.sh"]
