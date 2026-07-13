# Database Tables

## Roles
- id
- name

## Teams
- id
- name

## Users
- id
- name
- email
- password
- role_id
- team_id
- created_at
- updated_at

## Decision Categories
- id
- name
- description

## Decisions
- id
- title
- problem_statement
- category_id
- status
- created_by
- created_at
- updated_at

## Alternatives
- id
- decision_id
- description

## Risk Assessments
- id
- decision_id
- risk_level
- mitigation_plan

## Comments
- id
- decision_id
- user_id
- comment

## Discussion Threads
- id
- decision_id
- title

## Approvals
- id
- decision_id
- approver_id
- status

## Notifications
- id
- user_id
- message
- is_read

## Documents
- id
- decision_id
- file_name

## Audit Logs
- id
- user_id
- action
- timestamp