-- Add country column to the ads table to support Market Preferences filtering
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS country text;

-- Disable the old favorites table
DROP TABLE IF EXISTS favorites CASCADE;

-- Create the new spy_list table
CREATE TABLE IF NOT EXISTS public.spy_list (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, ad_id)
);

-- Enable RLS
ALTER TABLE public.spy_list ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can only see their own spy list items." 
ON public.spy_list FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own spy list items." 
ON public.spy_list FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spy list items." 
ON public.spy_list FOR DELETE 
USING (auth.uid() = user_id);

-- Create User Profiles table for Market Preferences
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    market_preferences JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can only see their own profile." 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile." 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, market_preferences)
  VALUES (new.id, '[]'::jsonb);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
