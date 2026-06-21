create type review_status as enum ('pending', 'approved', 'rejected');

create table if not exists product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  title text not null default '',
  body text not null,
  status review_status not null default 'pending',
  is_verified_purchase boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (product_id, user_id)
);

create index if not exists product_reviews_product_idx on product_reviews(product_id, status);
create index if not exists product_reviews_user_idx on product_reviews(user_id);

alter table product_reviews enable row level security;

drop policy if exists "Approved reviews readable by everyone" on product_reviews;
create policy "Approved reviews readable by everyone" on product_reviews
  for select using (status = 'approved');

drop policy if exists "Users can read their own reviews" on product_reviews;
create policy "Users can read their own reviews" on product_reviews
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert reviews for owned products" on product_reviews;
create policy "Users can insert reviews for owned products" on product_reviews
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from library_items
      where library_items.user_id = auth.uid()
        and library_items.product_id = product_reviews.product_id
    )
  );

drop policy if exists "Users can update their own pending reviews" on product_reviews;
create policy "Users can update their own pending reviews" on product_reviews
  for update using (auth.uid() = user_id and status in ('pending', 'rejected'))
  with check (auth.uid() = user_id);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'unknown',
  consent boolean not null default true,
  user_id uuid references profiles(id) on delete set null,
  resend_contact_id text,
  unsubscribed_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists newsletter_subscribers_email_idx on newsletter_subscribers(email);

alter table newsletter_subscribers enable row level security;
-- No public RLS — newsletter writes go through service role on the server.

create type blog_post_status as enum ('draft', 'published', 'archived');

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  cover_path text,
  status blog_post_status not null default 'draft',
  published_at timestamp with time zone,
  reading_minutes integer not null default 5,
  related_product_ids uuid[] not null default '{}',
  tags text[] not null default '{}',
  author_id uuid references profiles(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists blog_posts_status_idx on blog_posts(status, published_at desc);
create index if not exists blog_posts_slug_idx on blog_posts(slug);

alter table blog_posts enable row level security;

drop policy if exists "Published blog posts readable by everyone" on blog_posts;
create policy "Published blog posts readable by everyone" on blog_posts
  for select using (status = 'published');
;
