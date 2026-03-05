-- ----------------------------------------------------
-- DEPLOYMENT DB: SCAN HISTORY TABLE
-- Tracks the real history of Apify scraper runs
-- ----------------------------------------------------

CREATE TABLE IF NOT EXISTS public.scan_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword TEXT NOT NULL,
    country TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'facebook',
    status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed
    ads_extracted INTEGER DEFAULT 0,
    apify_run_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read (since this is an MVP without complex auth yet, but assuming auth in real app)
CREATE POLICY "Allow read access to anyone" 
    ON public.scan_history FOR SELECT 
    USING (true);

-- Allow service role / backend insertions
CREATE POLICY "Allow insert access to authenticated users" 
    ON public.scan_history FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow update access to authenticated users" 
    ON public.scan_history FOR UPDATE 
    USING (true);

-- Optional: Create an index for faster queries on recent history
CREATE INDEX IF NOT EXISTS scan_history_created_at_idx ON public.scan_history(created_at DESC);
