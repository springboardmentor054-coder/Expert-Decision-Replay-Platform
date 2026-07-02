# Environment Variables Documentation - EDRP

* **File Name:** `environment_variables.md`
* **Folder Location:** `docs/config/`
* **Purpose:** Document all system configuration parameters, default settings, and secrets management rules for EDRP services.

---

## 1. Backend Environment Variables

The backend application reads variables dynamically at startup using a custom Pydantic `BaseSettings` class located in `app/core/config.py`.

| Variable Name | Description / Purpose | Required | Default Value | Example Value (Dev) | Example Value (Prod) |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **`PROJECT_NAME`** | Name of the platform application. | No | `Expert Decision Replay Platform` | `EDRP Dev Instance` | `Expert Decision Replay Platform` |
| **`ENV`** | Current deployment environment. | No | `development` | `development` | `production` |
| **`DATABASE_URL`** | Connection string for PostgreSQL database. | **Yes** | N/A | `postgresql://usr:pwd@db:5432/db` | `postgresql://prod_user:pwd@rds:5432/edrp` |
| **`REDIS_URL`** | Redis server host connection URI. | **Yes** | N/A | `redis://localhost:6379/0` | `redis://elasticache:6379/0` |
| **`JWT_SECRET_KEY`** | Secret key used to sign access JWTs. | **Yes** | N/A | `change_me_in_dev_12345` | *[AES-256 secure random generated secret]* |
| **`JWT_ALGORITHM`** | Cryptographic hash algorithm. | No | `HS256` | `HS256` | `HS256` |
| **`ACCESS_TOKEN_EXPIRE_MINUTES`**| Lifespan of short-lived access JWT tokens. | No | `15` | `15` | `15` |
| **`REFRESH_TOKEN_EXPIRE_DAYS`**| Lifespan of refresh tokens in the Redis cache. | No | `7` | `7` | `7` |
| **`AWS_ACCESS_KEY_ID`** | AWS credentials for S3 uploads. | **Yes** | N/A | `mock_key` | `AKIAIOSFODNN7EXAMPLE` |
| **`AWS_SECRET_ACCESS_KEY`**| AWS credentials for S3 uploads. | **Yes** | N/A | `mock_secret` | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| **`S3_BUCKET_NAME`** | Target bucket name for attachments storage. | **Yes** | N/A | `edrp-dev-bucket` | `edrp-enterprise-prod-attachments` |
| **`SMTP_HOST`** | SMTP server address for dispatching alerts. | No | `localhost` | `smtp.mailtrap.io` | `email-smtp.us-east-1.amazonaws.com` |
| **`SMTP_PORT`** | Port number for outgoing SMTP traffic. | No | `1025` | `2525` | `587` |
| **`SMTP_USER`** | Username for SMTP server authentication. | No | N/A | `mailtrap_user` | `ses_smtp_user_credentials` |
| **`SMTP_PASSWORD`** | Password for SMTP server authentication. | No | N/A | `mailtrap_pwd` | `ses_smtp_password_credentials` |
| **`CORS_ORIGINS`** | JSON-parsed array of origins permitted CORS. | No | `["*"]` | `["http://localhost:3000"]` | `["https://edrp.organization.com"]` |

---

## 2. Frontend Environment Variables

Vite reads environment parameters prefixed with `VITE_` at build time and embeds them in the static bundle.

| Variable Name | Description / Purpose | Required | Default Value | Example Value (Dev) | Example Value (Prod) |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **`VITE_API_URL`** | Base URL path targeting the backend gateways. | **Yes** | N/A | `http://localhost:8000/api/v1` | `https://api.edrp.organization.com/api/v1` |
| **`VITE_ENVIRONMENT`**| Frontend tracking runtime label. | No | `development` | `development` | `production` |

---

## 3. Production Secrets Management Strategy

1. **Zero Text Exposure:** Never commit `.env` files or secret values into version control. Ensure `.gitignore` contains rules blocking `.env`.
2. **Environment Injection (Docker):** During deployment, containers pull configuration dynamically from the environment. In Docker Compose, configure:
   `env_file: .env`
3. **Enterprise Secrets Managers:** For production systems, configurations are managed in an encrypted cloud service (e.g. **AWS Secrets Manager** or **HashiCorp Vault**). The CI/CD pipeline fetches these values and injects them directly as secure task environment variables during container orchestration.
