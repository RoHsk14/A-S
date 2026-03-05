-- ----------------------------------------------------
-- DEPLOYMENT DB: ADD UNIQUE CONSTRAINT TO ADS TABLE
-- Required for Apify Scraper ON CONFLICT upsert
-- ----------------------------------------------------

-- We first try to add the constraint. 
-- Note: If there are exact duplicates already in the DB, this might fail.
-- It's usually safe to run on MVP databases.
ALTER TABLE public.ads
ADD CONSTRAINT ads_page_name_ad_copy_key UNIQUE (page_name, ad_copy);
