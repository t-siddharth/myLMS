-- Learner Intelligence System V1 schema
-- Generated from _workspace/Learner Intelligence System architecture and ERD.pdf.

CREATE TABLE IF NOT EXISTS user_layer (
  user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER CHECK (age IS NULL OR age >= 0),
  education_level TEXT,
  transition_type TEXT,
  current_status TEXT,
  goals TEXT,
  constraints TEXT,
  interests TEXT,
  cv_reference TEXT,
  transcript_reference TEXT,
  mbti_test_result TEXT,
  personality_test_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS instructor_layer (
  instructor_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  course_id INTEGER NOT NULL UNIQUE,
  course_name TEXT NOT NULL,
  syllabus TEXT,
  modules TEXT,
  assessments TEXT,
  attendance TEXT,
  student_materials TEXT,
  competencies_taught TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_layer (
  admin_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  teacher_reviews TEXT,
  data_tracking_costs TEXT,
  effectiveness_indicators TEXT,
  outcomes TEXT,
  salary_or_career_outcomes TEXT,
  satisfaction_metrics TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_layer (
  document_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES user_layer(user_id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES instructor_layer(course_id) ON DELETE SET NULL,
  admin_id INTEGER REFERENCES admin_layer(admin_id) ON DELETE SET NULL,
  neurocognitive_profile TEXT,
  linguistic_analysis TEXT,
  learning_notes TEXT,
  mbti_test TEXT,
  personality_test_summary TEXT,
  assessment_results TEXT,
  mistake_analysis TEXT,
  behavioral_data TEXT,
  engagement_patterns TEXT,
  learner_reflections TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS output_llm_layer (
  output_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES user_layer(user_id) ON DELETE CASCADE,
  document_id INTEGER REFERENCES data_layer(document_id) ON DELETE SET NULL,
  entry_type TEXT,
  title TEXT,
  summary TEXT,
  learner_profile_summary TEXT,
  lesson_or_topic TEXT,
  why_it_matters TEXT,
  top_3_course_paths TEXT,
  recommended_competencies TEXT,
  system_relevance TEXT,
  implementation_implications TEXT,
  confidence_score NUMERIC(5,4) CHECK (
    confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)
  ),
  connections_to_prior_knowledge TEXT,
  user_selected_path TEXT,
  user_feedback TEXT,
  override_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_layer_user_id ON data_layer(user_id);
CREATE INDEX IF NOT EXISTS idx_data_layer_course_id ON data_layer(course_id);
CREATE INDEX IF NOT EXISTS idx_data_layer_admin_id ON data_layer(admin_id);
CREATE INDEX IF NOT EXISTS idx_output_llm_layer_user_id ON output_llm_layer(user_id);
CREATE INDEX IF NOT EXISTS idx_output_llm_layer_document_id ON output_llm_layer(document_id);
