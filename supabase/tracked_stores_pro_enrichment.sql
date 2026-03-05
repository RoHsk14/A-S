-- Migration: Add Enrichment Data Columns to tracked_stores
-- Execute this script in your Supabase SQL Editor

ALTER TABLE public.tracked_stores
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'À déterminer',
ADD COLUMN IF NOT EXISTS monthly_traffic INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tech_stack JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_analyzed_at TIMESTAMPTZ;

-- Commentary: 
-- platform: e.g., 'Shopify', 'YouCan', 'WooCommerce'
-- monthly_traffic: Estimated monthly visitors (SimilarWeb)
-- tech_stack: Array of identified technologies (Wappalyzer)
-- trust_score: 1-5 rating based on various metrics
