# System Input Validation Rules - EDRP

* **File Name:** `validation_rules.md`
* **Folder Location:** `docs/validation/`
* **Purpose:** Define validation schemas, input regex patterns, character limits, and error messages for API schemas (Pydantic) and forms (Zod).

---

## 1. User & Account Entity Validation

| Field Name | Required | Nullable | Data Type | Regex / Constraints | Min | Max | Allowed Values | Unique | Example | Validation Message |
| :--- | :---: | :---: | :--- | :--- | :---: | :---: | :--- | :---: | :--- | :--- |
| **`email`** | Yes | No | String | `^[a-zA-Z0-9._%+-]+@organization\.com$` | 5 | 255 | N/A | Yes | `john@organization.com` | "Must be a valid corporate email ending with @organization.com" |
| **`password`**| Yes | No | String | Requires 1 uppercase, 1 lowercase, 1 number | 8 | 128 | N/A | No | `SecureP@ss123` | "Password must be at least 8 characters, containing uppercase, lowercase, and numbers." |
| **`full_name`**| Yes | No | String | Letters and spaces only | 2 | 100 | N/A | No | `Jane Doe` | "Name must contain only alphabetic characters and spaces." |
| **`role`** | Yes | No | String | N/A | N/A | N/A | `Employee`, `Reviewer`, `Manager`, `Administrator` | No | `Manager` | "Role must be Employee, Reviewer, Manager, or Administrator." |

---

## 2. Decision Record Entity Validation

| Field Name | Required | Nullable | Data Type | Regex / Constraints | Min | Max | Allowed Values | Unique | Example | Validation Message |
| :--- | :---: | :---: | :--- | :--- | :---: | :---: | :--- | :---: | :--- | :--- |
| **`title`** | Yes | No | String | Alphanumeric, spaces, common punctuation | 10 | 255 | N/A | Yes | `Migrate Core API to FastAPI` | "Title must be between 10 and 255 characters." |
| **`summary`** | Yes | No | String | N/A | 50 | 1000 | N/A | No | `Proposal to migrate API layer...` | "Summary must be between 50 and 1000 characters." |
| **`context`** | Yes | No | String | Markdown text | 100 | 10000| N/A | No | `### Core Context...` | "Context description must be at least 100 characters." |
| **`problem`** | Yes | No | String | Markdown text | 50 | 5000 | N/A | No | `High RAM usage under load...` | "Problem statement must be at least 50 characters." |
| **`category`** | Yes | No | String | N/A | 3 | 100 | N/A | No | `Architecture` | "Category must be a valid text string." |
| **`status`** | No | No | String | N/A | N/A | N/A | `Draft`, `Under Review`, `Changes Requested`, `Approved`, `Rejected`, `Deprecated` | No | `Draft` | "Status is not a valid lifecycle state." |

---

## 3. Alternatives Entity Validation

| Field Name | Required | Nullable | Data Type | Regex / Constraints | Min | Max | Allowed Values | Unique | Example | Validation Message |
| :--- | :---: | :---: | :--- | :--- | :---: | :---: | :--- | :---: | :--- | :--- |
| **`name`** | Yes | No | String | Alphanumeric | 3 | 100 | N/A | No | `Go Gin Framework` | "Name must be between 3 and 100 characters." |
| **`description`**| Yes | No | String | N/A | 20 | 2000 | N/A | No | `Fast lightweight framework...` | "Description must be between 20 and 2000 characters." |
| **`pros`** | No | No | Array | Array of string elements | 0 | 50 | N/A | No | `["Fast", "Type-safe"]` | "Pros must be an array of descriptive strings." |
| **`cons`** | No | No | Array | Array of string elements | 0 | 50 | N/A | No | `["Heavy learning curve"]`| "Cons must be an array of descriptive strings." |
| **`score`** | No | No | Decimal | Range: `0.00` to `10.00` | N/A | N/A | N/A | No | `8.50` | "Evaluation score must be between 0.00 and 10.00." |

---

## 4. Discussion Comments Validation

| Field Name | Required | Nullable | Data Type | Regex / Constraints | Min | Max | Allowed Values | Unique | Example | Validation Message |
| :--- | :---: | :---: | :--- | :--- | :---: | :---: | :--- | :---: | :--- | :--- |
| **`comment_text`**| Yes | No | String | Plain or markdown text | 1 | 4000 | N/A | No | `Is database connection secure?`| "Comment must contain at least 1 character and not exceed 4000 characters." |
| **`parent_id`** | No | Yes | UUID | Valid UUID format | N/A | N/A | N/A | No | `d0bfa900-2d88-4228...` | "Parent comment ID must be a valid UUID." |
