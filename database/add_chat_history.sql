-- Add chat history table for learning
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    context_data JSONB,
    feedback INTEGER DEFAULT NULL, -- 1=good, -1=bad, NULL=no feedback
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_history_created_at ON chat_history(created_at);