-- CherishX Experiences Database Schema
-- Run this SQL in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Create experiences table
create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category text not null,
  subcategory text,
  short_desc text,
  description text,
  base_price numeric(10,2),
  images text[], -- array of image URLs
  thumbnail_url text,
  template_type text default 'standard' check (template_type in ('standard', 'special')),
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- Create indexes for better performance
create index idx_experiences_category on public.experiences(category);
create index idx_experiences_subcategory on public.experiences(subcategory);
create index idx_experiences_slug on public.experiences(slug);
create index idx_experiences_is_featured on public.experiences(is_featured);
create index idx_experiences_template_type on public.experiences(template_type);
create index idx_experiences_created_at on public.experiences(created_at desc);

-- Create a function to automatically generate slugs
create or replace function generate_slug(input_title text)
returns text as $$
begin
  return lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
end;
$$ language plpgsql;

-- Create a trigger to automatically generate slugs on insert/update
create or replace function set_slug_from_title()
returns trigger as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := generate_slug(new.title);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trigger_set_slug
  before insert or update on public.experiences
  for each row
  execute function set_slug_from_title();

-- Enable Row Level Security (RLS)
alter table public.experiences enable row level security;

-- Create policies for public read access
create policy "Experiences are viewable by everyone" on public.experiences
  for select using (true);

-- Create policy for service role to insert/update/delete
create policy "Service role can manage experiences" on public.experiences
  for all using (auth.role() = 'service_role');

-- Grant necessary permissions
grant usage on schema public to anon, authenticated, service_role;
grant select on public.experiences to anon, authenticated;
grant all on public.experiences to service_role;

-- Create a view for featured experiences
create view public.featured_experiences as
select * from public.experiences
where is_featured = true
order by created_at desc;

-- Grant access to the view
grant select on public.featured_experiences to anon, authenticated;

-- Create a function to search experiences
create or replace function search_experiences(search_term text)
returns setof public.experiences as $$
begin
  return query
  select * from public.experiences
  where 
    title ilike '%' || search_term || '%' or
    description ilike '%' || search_term || '%' or
    short_desc ilike '%' || search_term || '%'
  order by created_at desc;
end;
$$ language plpgsql;

-- Grant execute permission on the search function
grant execute on function search_experiences(text) to anon, authenticated;

-- Normalized Orders schema
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;

create table public.orders (
  id uuid primary key default gen_random_uuid(), -- order_id
  user_id uuid not null references users(id) on delete cascade,
  payment_id text,
  payment_method text not null,
  status text not null default 'confirmed',
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  pincode text not null,
  state text not null,
  total_amount numeric(10,2) not null,
  created_at timestamptz default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  experience_id uuid not null references experiences(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10,2) not null,
  selected_date date,
  selected_time text,
  addons jsonb default '[]'::jsonb
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_experience_id on public.order_items(experience_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Users can manage own orders" on public.orders;
create policy "Users can manage own orders" on public.orders
  for all using (auth.role() = 'service_role' or auth.uid()::text = user_id::text);

drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (auth.role() = 'service_role' or auth.uid()::text = o.user_id::text)
    )
  );

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.orders to service_role;
grant select, insert, update, delete on public.order_items to service_role;
grant select, insert, update on public.orders to authenticated;
grant select on public.order_items to authenticated;