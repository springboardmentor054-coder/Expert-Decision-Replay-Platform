FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ /app/backend/

ENV PYTHONPATH=/app
ENV DATABASE_URL=sqlite:////app/backend/decisions.db
ENV UPLOAD_DIR=/app/uploads

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
