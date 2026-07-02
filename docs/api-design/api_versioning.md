# API Versioning Strategy & Deprecation Policy - EDRP

* **File Name:** `api_versioning.md`
* **Folder Location:** `docs/api-design/`
* **Purpose:** Define standards for API version routing, deprecation cycles, and breaking change workflows.

---

## 1. Versioning Mechanism

EDRP implements **URL Path Versioning** for all REST APIs. The version identifier must be present in the path prefix directly after the base domain:
`https://api.edrp.organization.com/api/v1/...`

### 1.1 Why URL Path Versioning?
- **Visibility:** Easily searchable in proxy/router access logs (e.g. Nginx, CloudFront).
- **Client Ease:** Simplifies setup in Axios/API client headers configurations.
- **Microservices Routing:** Enables Nginx path-routing rules (e.g. routing `/api/v1` traffic to monolith, and `/api/v2` to a separate microservice).

---

## 2. API Version Lifecycle

Each API version progresses through three lifecycle states:

```
[ ACTIVE ]  --->  [ DEPRECATED ]  --->  [ SUNSET / RETIRED ]
```

1. **Active (V1):** The current, supported API version. Active feature development occurs here.
2. **Deprecated:** A new version (V2) has been released. The deprecated version is maintained for compatibility, but no new features are added (only security patches). Deprecation warnings are sent to clients.
3. **Sunset (Retired):** The version is turned off. Requests return `410 Gone`.

---

## 3. Deprecation Headers & Communication

When an API is marked **Deprecated**, EDRP backend injects standard RFC 8594 headers into all responses:
* **`Deprecation`:** Specifies the date/time when deprecation occurred (e.g., `Deprecation: @1782914100`).
* **`Sunset`:** Specifies the date/time when the endpoint will be shut down (e.g., `Sunset: Fri, 01 Jan 2027 00:00:00 GMT`).
* **`Link`:** Link to migration guide documentation.

---

## 4. Breaking vs. Non-Breaking Changes

### 4.1 Non-Breaking Changes (V1 Minor Update)
These do not require a version bump. They include:
- Adding a new endpoint (e.g., `POST /api/v1/decisions/export`).
- Adding an optional query parameter or an optional request body field.
- Adding a new field to a response body payload.

### 4.2 Breaking Changes (Requires Version Bump to V2)
These require incrementing the version path prefix. They include:
- Removing or renaming an endpoint.
- Renaming or deleting an existing field in a request or response payload.
- Changing validation constraints (e.g. making an optional field required).
- Changing an authentication scheme or default status response behavior.

---

## 5. Version Migration Strategy

When introducing a new version (e.g. `v2`):
1. **Coexistence:** Both `v1` and `v2` router endpoints run in parallel inside `app/api/v1/` and `app/api/v2/`.
2. **Code Sharing:** Route handlers in both versions call the same `app/services/` logic layer to prevent business duplication. Only serialization schemas (`app/schemas/v1/` and `app/schemas/v2/`) differ.
3. **Deprecation Period:** A minimum window of **6 months** is enforced before a deprecated version enters the Sunset phase.
