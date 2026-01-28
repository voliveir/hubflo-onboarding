-- Hubflo University System
-- This script creates the database schema for the University/LMS system
-- Structure: Schools -> Courses -> Sections -> Lectures

-- Schools table (top-level organization)
CREATE TABLE IF NOT EXISTS university_schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table (within schools)
CREATE TABLE IF NOT EXISTS university_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES university_schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    estimated_duration_minutes INTEGER,
    difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sections table (within courses)
CREATE TABLE IF NOT EXISTS university_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES university_courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lectures table (within sections)
CREATE TABLE IF NOT EXISTS university_lectures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES university_sections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('video', 'text', 'quiz', 'download', 'link')),
    content_data JSONB, -- Flexible storage for different content types
    -- For video: { url: string, duration: number, provider: 'youtube' | 'vimeo' | 'tella' | 'custom' }
    -- For text: { content: string, format: 'markdown' | 'html' }
    -- For quiz: { questions: [...] }
    -- For download: { file_url: string, file_name: string, file_size: number }
    -- For link: { url: string, title: string, description: string }
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quizzes table (standalone quizzes or linked to lectures)
CREATE TABLE IF NOT EXISTS university_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lecture_id UUID REFERENCES university_lectures(id) ON DELETE SET NULL,
    course_id UUID REFERENCES university_courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70, -- Percentage required to pass
    time_limit_minutes INTEGER, -- Optional time limit
    questions JSONB NOT NULL, -- Array of question objects
    -- Question structure: { id: string, type: 'multiple_choice' | 'true_false' | 'short_answer', question: string, options?: [...], correct_answer: string | number, points: number }
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client progress tracking
CREATE TABLE IF NOT EXISTS university_client_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES university_courses(id) ON DELETE CASCADE,
    lecture_id UUID REFERENCES university_lectures(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, lecture_id)
);

-- Quiz attempts and results
CREATE TABLE IF NOT EXISTS university_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES university_quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    passed BOOLEAN NOT NULL,
    answers JSONB NOT NULL, -- Store user's answers
    time_taken_minutes INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course completion certificates
CREATE TABLE IF NOT EXISTS university_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES university_courses(id) ON DELETE CASCADE,
    certificate_url TEXT, -- URL to generated certificate PDF/image
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, course_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_university_courses_school_id ON university_courses(school_id);
CREATE INDEX IF NOT EXISTS idx_university_sections_course_id ON university_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_university_lectures_section_id ON university_lectures(section_id);
CREATE INDEX IF NOT EXISTS idx_university_quizzes_lecture_id ON university_quizzes(lecture_id);
CREATE INDEX IF NOT EXISTS idx_university_quizzes_course_id ON university_quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_university_progress_client_id ON university_client_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_university_progress_course_id ON university_client_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_university_progress_lecture_id ON university_client_progress(lecture_id);
CREATE INDEX IF NOT EXISTS idx_university_quiz_attempts_client_id ON university_quiz_attempts(client_id);
CREATE INDEX IF NOT EXISTS idx_university_quiz_attempts_quiz_id ON university_quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_university_certificates_client_id ON university_certificates(client_id);
CREATE INDEX IF NOT EXISTS idx_university_certificates_course_id ON university_certificates(course_id);

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_university_schools_updated_at BEFORE UPDATE ON university_schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_university_courses_updated_at BEFORE UPDATE ON university_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_university_sections_updated_at BEFORE UPDATE ON university_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_university_lectures_updated_at BEFORE UPDATE ON university_lectures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_university_quizzes_updated_at BEFORE UPDATE ON university_quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_university_progress_updated_at BEFORE UPDATE ON university_client_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
