FROM python:3.12-slim

WORKDIR /app

# Enable registry mirrors and disable SSL verification via trusted-host to bypass firewalls
ARG PIP_INDEX_URL=https://pypi.org/simple
ARG PIP_TRUSTED_HOST="pypi.org files.pythonhosted.org pypi.python.org"
ENV PIP_INDEX_URL=$PIP_INDEX_URL \
    PIP_TRUSTED_HOST=$PIP_TRUSTED_HOST

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
