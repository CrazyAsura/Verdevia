FROM python:3.10-slim

# Enable registry mirrors and disable SSL verification via trusted-host/apt-settings to bypass firewalls
ARG PIP_INDEX_URL=https://pypi.org/simple
ARG PIP_TRUSTED_HOST="pypi.org files.pythonhosted.org pypi.python.org"
ENV PIP_INDEX_URL=$PIP_INDEX_URL \
    PIP_TRUSTED_HOST=$PIP_TRUSTED_HOST

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Disable apt SSL verification to prevent firewall blocks during update/install
RUN echo 'Acquire::https::Verify-Peer "false";' > /etc/apt/apt.conf.d/99verify-peer

RUN apt-get update \
    && apt-get install -y --no-install-recommends default-jdk procps \
    && pip install --no-cache-dir pyspark psycopg2-binary kafka-python numpy \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


CMD ["python", "/app/backend/src/modules/stats/scripts/spark_processor.py"]
