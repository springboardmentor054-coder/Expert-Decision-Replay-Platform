FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY frontend_web/ /app/frontend_web/

ENV FLASK_APP=frontend_web/app/main.py
ENV BACKEND_API_URL=http://backend:8000/api/v1

EXPOSE 5000

CMD ["python", "frontend_web/app/main.py"]
