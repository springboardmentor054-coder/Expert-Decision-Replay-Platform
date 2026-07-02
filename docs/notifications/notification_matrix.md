# Notification Routing & Template Matrix - EDRP

* **File Name:** `notification_matrix.md`
* **Folder Location:** `docs/notifications/`
* **Purpose:** Map systemic events, delivery channels (In-app vs Email), email templates, retry rules, and expiration lifetimes.

---

## 1. Notification Event Routing Matrix

| System Event | Target Recipient | Delivery Method | Priority | Notification Template | Retry Rule | Expiry (TTL) |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **`decision.submitted`** | Assigned Reviewers | In-App (WebSockets)<br>Email (SMTP) | **High** | **Subject:** Review Request: [Decision Title]<br>**Body:** User [Owner Name] has submitted a decision for your technical review. [View Workspace Link] | Retry 3 times, backoff 5m | 14 Days |
| **`decision.approved`** | Creator, Team Members | In-App (WebSockets)<br>Email (SMTP) | **Medium**| **Subject:** Approved: [Decision Title]<br>**Body:** Decision "[Decision Title]" has been approved by [Manager Name] and is published. [View Link] | Retry 3 times, backoff 10m| 30 Days |
| **`decision.changes_req`**| Creator (Owner) | In-App (WebSockets)<br>Email (SMTP) | **High** | **Subject:** Action Required: Modifications requested on [Decision Title]<br>**Body:** Reviewer [Reviewer Name] requested modifications: [Comments] | Retry 5 times, backoff 2m | 14 Days |
| **`comment.mentioned`** | Mentioned User | In-App (WebSockets)<br>Email (SMTP) | **Medium**| **Subject:** Mentioned in Discussion: [Decision Title]<br>**Body:** [User Name] mentioned you in a comment: "[Snippet]" | Retry 2 times, backoff 15m| 7 Days |
| **`comment.added`** | Creator (Owner) | In-App Only | **Low** | **Body:** New discussion post from [User Name] on your decision: "[Snippet]" | No retry (Drop if fail) | 7 Days |
| **`account.role_updated`**| Target User | Email Only | **High** | **Subject:** Account Permissions Update: EDRP<br>**Body:** Your role has been updated to: [New Role Name]. Please sign in again. | Retry 5 times, backoff 10m| N/A |

---

## 2. Notification System Design Specifications

### 2.1 WebSocket (In-App Dispatch)
1. **Connection:** During UI boot, the React application opens a persistent connection to `wss://api.edrp.org/api/v1/notifications/ws` using the user's JWT as authentication.
2. **Failure Fallback:** If the connection drops, the UI attempts to reconnect using exponential backoff (starting at 1s, doubling up to 60s).
3. **Queueing:** If the user is offline, messages remain in the database marked `read_status = false` and are sent when they reconnect.

### 2.2 Retry & Delivery Strategy (Celery / Background Workers)
- Notifications are queued in Redis using a task manager (e.g. Celery or FastAPI Background Tasks).
- **Retry Strategy:**
  - Standard emails use exponential backoff (`2^retry * Base_Seconds`).
  - If a worker encounters a permanent delivery failure (e.g. SMTP `550 User Unknown`), it cancels the task and logs the error in the server logs.

### 2.3 Storage and Expiry (Data Retention)
- Old notifications are archived after 30 days.
- A weekly maintenance task cleanses all records in the database marked `archived = true` or where the expiration date has passed (`NOW() > expired_at`).
