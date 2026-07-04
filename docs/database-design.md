# Database Design

## Users
- id
- name
- email
- password
- role_id
- team_id
- created_at
- updated_at

## Roles
- id
- role_name

## Teams
- id
- team_name

## Decisions
- id
- title
- problem_statement
- category_id
- status
- created_by
- created_at
- updated_at

## Decision Categories
- id
- category_name

## Alternatives
- id
- decision_id
- title
- description

## Risk Assessments
- id
- decision_id
- risk_level
- mitigation

## Comments
- id
- decision_id
- user_id
- comment
- created_at

## Discussion Threads
- id
- decision_id
- title
- created_by

## Approvals
- id
- decision_id
- reviewer_id
- status
- approved_at

## Notifications
- id
- user_id
- message
- is_read
- created_at

## Documents
- id
- decision_id
- file_name
- file_path
- uploaded_by

## Audit Logs
- id
- user_id
- action
- timestamp

# Relationships

- Role → Users
- Team → Users
- User → Decisions
- Decision Category → Decisions
- Decision → Alternatives
- Decision → Risk Assessments
- Decision → Comments
- Decision → Discussion Threads
- Decision → Approvals
- Decision → Documents
- User → Notifications
- User → Audit Logs