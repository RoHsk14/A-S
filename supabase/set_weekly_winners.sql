-- 1. On réinitialise d'abord tout (au cas où il y en aurait déjà)
UPDATE public.ads 
SET is_winner_of_the_week = false, 
    winner_week_date = NULL;

-- 2. On sélectionne les 20 publicités "actives" les plus récentes et on les marque comme gagnantes
UPDATE public.ads
SET 
    is_winner_of_the_week = true,
    winner_week_date = NOW()
WHERE id IN (
    SELECT id 
    FROM public.ads 
    WHERE is_active = true
    ORDER BY started_at DESC
    LIMIT 20
);
