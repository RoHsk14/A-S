-- Create Tracked Stores table for the "My Stores" feature
CREATE TABLE IF NOT EXISTS public.tracked_stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store_domain TEXT NOT NULL,
    page_name TEXT, -- To link with Facebook page names if available
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, store_domain)
);

-- Enable Row Level Security
ALTER TABLE public.tracked_stores ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can only see their own tracked stores." 
ON public.tracked_stores FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracked stores." 
ON public.tracked_stores FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracked stores." 
ON public.tracked_stores FOR DELETE 
USING (auth.uid() = user_id);
