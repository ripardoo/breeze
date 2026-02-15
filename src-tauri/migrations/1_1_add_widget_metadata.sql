-- Add widget type and metadata columns to persist widget configuration
ALTER TABLE widgets ADD COLUMN type TEXT NOT NULL DEFAULT 'link';
ALTER TABLE widgets ADD COLUMN title TEXT;
ALTER TABLE widgets ADD COLUMN data TEXT;
