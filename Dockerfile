# Render.com PostgreSQL 최적화 Dockerfile
FROM python:3.11-slim

# 환경변수 설정
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive
ENV PG_CONFIG=/usr/bin/pg_config

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 업데이트 및 PostgreSQL 전체 스택 설치
RUN apt-get update -y && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends \
        postgresql \
        postgresql-contrib \
        postgresql-client \
        postgresql-server-dev-all \
        libpq-dev \
        gcc \
        g++ \
        make \
        python3-dev \
        python3-pip \
        pkg-config \
        build-essential \
        libc6-dev \
        libssl-dev \
        libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# PostgreSQL 설정 확인
RUN which pg_config && pg_config --version

# pip 업그레이드
RUN pip install --upgrade pip setuptools wheel

# requirements 복사 및 설치
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --verbose -r requirements.txt

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
