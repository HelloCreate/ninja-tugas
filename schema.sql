CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    course TEXT NOT NULL,
    description TEXT,
    difficulty INTEGER DEFAULT 1,
    estimated_hours INTEGER DEFAULT 1,
    priority TEXT NOT NULL,
    status TEXT DEFAULT 'todo',
    due_date TEXT NOT NULL,
    attachment_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
