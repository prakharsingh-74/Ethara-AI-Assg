-- Run this in your Supabase SQL Editor to create the tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    tasks UUID[] DEFAULT '{}', -- array of task IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE tasks (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    priority TEXT DEFAULT 'normal',
    stage TEXT DEFAULT 'todo',
    description TEXT,
    is_trashed BOOLEAN DEFAULT FALSE,
    assets TEXT[] DEFAULT '{}',
    links TEXT[] DEFAULT '{}',
    team UUID[] DEFAULT '{}', -- array of user IDs
    activities JSONB DEFAULT '[]', -- JSON array for activities
    subtasks JSONB DEFAULT '[]', -- JSON array for subtasks
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notices Table
CREATE TABLE notices (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT,
    task UUID REFERENCES tasks(_id) ON DELETE CASCADE,
    team UUID[] DEFAULT '{}', -- array of user IDs
    is_read UUID[] DEFAULT '{}', -- array of user IDs who read it
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: We are using JSONB and Arrays for some columns to match your NoSQL MongoDB structure as closely as possible, making the code migration smoother!
