CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role_id INTEGER REFERENCES roles(id),
    team_id INTEGER REFERENCES teams(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE decision_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE decisions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    problem_statement TEXT,
    category_id INTEGER REFERENCES decision_categories(id),
    created_by INTEGER REFERENCES users(id),
    status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);