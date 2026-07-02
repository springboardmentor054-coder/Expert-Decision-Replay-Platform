# Coding Standards & Guidelines - EDRP

* **File Name:** `coding_standards.md`
* **Folder Location:** `docs/development/`
* **Purpose:** Define styling guides, programming standards, SOLID principles enforcement, and quality assurance workflows for developers.

---

## 1. Programming Language Guidelines

### 1.1 Python Standards (Backend)
- **Compliance:** Adhere strictly to **PEP 8** style guidelines.
- **Type Hinting:** Mandatory on all function signatures and properties (e.g., `def fetch_user(email: str) -> Optional[User]:`). Use static check verification (`mypy`).
- **Docstrings:** Required for all service functions, endpoints, and helpers. Follow **Google Docstring Style Guide**:
  ```python
  def calculate_evaluation_score(alternative_id: UUID) -> float:
      """Calculates the weighted evaluation score of an alternative.

      Args:
          alternative_id: The unique identifier of the target alternative.

      Returns:
          A float representing the calculated average weighted score.
      """
  ```

### 1.2 FastAPI Standards (Backend)
- **Dependencies Injection:** Use `Depends()` for database sessions, authentication, and permission filters.
- **Payload Validation:** Validate inputs/outputs using Pydantic v2 schemas (`app/schemas/`). Never return raw database models directly.
- **Exception Handling:** Raise `HTTPException` with specific error codes. Avoid returning raw error objects.

### 1.3 TypeScript Standards (Frontend)
- **Strict Typing:** Enforce `strict: true` in `tsconfig.json`. Banned usage of the `any` type; always use explicit interfaces or generic wrappers.
- **Component Definitions:** Define React components as functional declarations with typed props:
  ```typescript
  interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }

  export const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => { ... }
  ```

### 1.4 React Standards (Frontend)
- **Functional Components:** Use functional components and Hooks. No class components.
- **TanStack Query encapsulation:** Do not fetch data directly inside components using useEffect. Wrap API calls in custom hooks (e.g., `useGetDecisions`) inside the feature directory.

---

## 2. Comprehensive Naming Conventions

| Category | Convention | Pattern / Rules | Example |
| :--- | :--- | :--- | :--- |
| **Folder Naming** | Snake Case (Backend)<br>Kebab Case (Frontend) | lowercase, separated by dashes/underscores | `decision_records`<br>`decision-timeline` |
| **File Naming** | Snake Case (Backend)<br>Pascal/Kebab (Frontend) | Components use PascalCase. Utils use camelCase. | `user_service.py`<br>`DecisionCard.tsx` |
| **API Endpoints** | Kebab Case | lowercase nouns, pluralized resource roots | `/api/v1/decision-records` |
| **DTO / Schemas** | Pascal Case | Suffix with action type (In, Out, Create) | `DecisionCreateRequest` |
| **Database Tables**| Snake Case | Pluralized name matching domain entity | `discussion_comments` |
| **Variables** | Snake Case (Backend)<br>Camel Case (Frontend) | Descriptive, avoid single letters | `current_user`<br>`currentUser` |
| **Functions** | Snake Case (Backend)<br>Camel Case (Frontend) | Verb prefix describing the operation | `verify_token()`_`validatePayload()` |
| **Classes** | Pascal Case | Capitalized, nouns | `DecisionRepository` |
| **Enums** | Pascal Case | UPPERCASE keys, PascalCase names | `DecisionStatus.APPROVED` |

---

## 3. Formatting & Linting

### 3.1 Backend Tooling
- **Formatter:** **Black** (configured with default line length `88`).
- **Import Sorter:** **isort** for alphabetical import sorting.
- **Linter:** **Flake8** / **Ruff** for lint rules enforcement.

### 3.2 Frontend Tooling
- **Formatter:** **Prettier** (configured with trailing commas, single quotes, double spaces, line length `100`).
- **Linter:** **ESLint** with standard TypeScript and React hooks configurations.

---

## 4. SOLID & Clean Code Rules

* **Single Responsibility (SRP):** A class or service should perform exactly one task. Keep database logic, business rules, routing, and notifications in separate packages.
* **Open/Closed (OCP):** Modules should be open for extension but closed for modification. Leverage generic patterns like the `base_repo` to support new tables without modifying repo interfaces.
* **Liskov Substitution (LSP):** Subclasses must be swappable for their base classes without breaking behavior.
* **Interface Segregation (ISP):** Clients must not be forced to depend on methods they do not use. Declare minimal, clean interfaces.
* **Dependency Inversion (DIP):** Depend on abstractions, not concretes. In backend services, instantiate repositories dynamically or inject interfaces.

### Clean Code Best Practices
- **Small Functions:** Functions must be under 30 lines. If a function is longer, split it into smaller logical sub-functions.
- **Limit Parameters:** Limit function signatures to a maximum of 3 arguments. For larger parameters, wrap them in a configuration class or a Pydantic schema.
- **No Magic Numbers:** Define constants or configuration settings (e.g. `TOKEN_EXPIRY_MINUTES = 15`) instead of using raw literals in logic.
