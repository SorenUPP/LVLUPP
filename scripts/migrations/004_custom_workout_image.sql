-- 004_custom_workout_image.sql
-- Give each custom training day a wallpaper so it doesn't render as the
-- blank placeholder. One photo is picked at random on creation (app side);
-- this backfills any rows that predate the column.
--
-- Apply with:  node scripts/migrate.mjs

begin;

alter table public.custom_workouts add column if not exists image text;

update public.custom_workouts
set image = (
  array[
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&h=600&fit=crop&auto=format'
  ]
)[1 + floor(random() * 11)]
where image is null;

commit;
