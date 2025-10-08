-- Wishlist and Cart schema (id FKs to users and experiences)
-- Run this whole file in Supabase SQL editor

create extension if not exists "pgcrypto";

-- Drop previous objects (safe re-run)
drop view if exists user_cart cascade;
drop view if exists user_wishlist cascade;
drop table if exists cart cascade;
drop table if exists wishlist cascade;

-- Wishlist table
create table if not exists wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  experience_id uuid not null references experiences(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, experience_id)
);

-- Cart table (stores selected details, persisted server-side)
create table if not exists cart (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  experience_id uuid not null references experiences(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  selected_date date,
  selected_time text,
  addons jsonb default '[]'::jsonb,
  added_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, experience_id)
);

-- Indexes
create index if not exists idx_wishlist_user_id on wishlist(user_id);
create index if not exists idx_wishlist_experience_id on wishlist(experience_id);
create index if not exists idx_wishlist_created_at on wishlist(created_at desc);

create index if not exists idx_cart_user_id on cart(user_id);
create index if not exists idx_cart_experience_id on cart(experience_id);
create index if not exists idx_cart_added_at on cart(added_at desc);

-- updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_wishlist_updated_at on wishlist;
create trigger update_wishlist_updated_at
  before update on wishlist
  for each row
  execute function update_updated_at_column();

drop trigger if exists update_cart_updated_at on cart;
create trigger update_cart_updated_at
  before update on cart
  for each row
  execute function update_updated_at_column();

-- RLS
alter table wishlist enable row level security;
alter table cart enable row level security;

drop policy if exists "Users can view own wishlist" on wishlist;
drop policy if exists "Users can manage own wishlist" on wishlist;
create policy "Users can view own wishlist" on wishlist
  for select using (auth.role() = 'service_role' or auth.uid()::text = user_id::text);
create policy "Users can manage own wishlist" on wishlist
  for all using (auth.role() = 'service_role' or auth.uid()::text = user_id::text);

drop policy if exists "Users can view own cart" on cart;
drop policy if exists "Users can manage own cart" on cart;
create policy "Users can view own cart" on cart
  for select using (auth.role() = 'service_role' or auth.uid()::text = user_id::text);
create policy "Users can manage own cart" on cart
  for all using (auth.role() = 'service_role' or auth.uid()::text = user_id::text);

-- Grants
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on wishlist to service_role;
grant select, insert, update, delete on cart to service_role;
grant select, insert, update, delete on wishlist to authenticated;
grant select, insert, update, delete on cart to authenticated;

-- Views joined to experiences for UI consumption
create view user_wishlist as
select 
  w.id,
  w.user_id,
  w.experience_id,
  w.created_at,
  e.title,
  e.slug,
  e.base_price,
  e.thumbnail_url,
  e.category,
  e.subcategory
from wishlist w
join experiences e on w.experience_id = e.id;

create view user_cart as
select 
  c.id,
  c.user_id,
  c.experience_id,
  c.quantity,
  c.selected_date,
  c.selected_time,
  c.addons,
  c.added_at,
  e.title,
  e.slug,
  e.base_price,
  e.thumbnail_url,
  e.category,
  e.subcategory,
  (c.quantity * coalesce(e.base_price, 0)) as total_price
from cart c
join experiences e on c.experience_id = e.id;

grant select on user_wishlist to anon, authenticated, service_role;
grant select on user_cart to anon, authenticated, service_role;
