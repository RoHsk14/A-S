-- ----------------------------------------------------
-- DEPLOYMENT DB: CLEAN DUPLICATES & ADD CONSTRAINT
-- ----------------------------------------------------

-- 1. Supprime les doublons parfaits (page_name, ad_copy) en gardant uniquement le plus récent (plus grand ID ou timestamp)
DELETE FROM public.ads a
USING public.ads b
WHERE
    a.page_name = b.page_name 
    AND a.ad_copy = b.ad_copy 
    AND a.created_at < b.created_at;

-- 2. Une fois les doublons supprimés, on applique la contrainte d'unicité
ALTER TABLE public.ads
ADD CONSTRAINT ads_page_name_ad_copy_key UNIQUE (page_name, ad_copy);
