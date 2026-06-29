-- Security + performance hardening pass (audit 2026-06-29).
-- All statements are additive / idempotent. Reversible: re-create dropped
-- indexes from their definitions below if ever needed.

-- 1) Pin search_path on the only trigger function that was missing it.
--    Flagged by the Supabase linter (0011_function_search_path_mutable).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- 2) Reduce attack surface on SECURITY DEFINER *trigger* functions: they are
--    only ever invoked by triggers (which run with the definer's rights), so
--    no client role needs EXECUTE. Postgres also rejects calling a trigger
--    function directly, but revoking keeps them off the exposed RPC surface
--    (lints 0028/0029). NOTE: public.is_admin() is intentionally NOT revoked —
--    it is referenced inside RLS policies and must stay executable.
revoke all on function public.handle_auth_user_changed() from public, anon, authenticated;
revoke all on function public.protect_profile_privileged_fields() from public, anon, authenticated;
revoke all on function public.sync_roles_from_allowlist() from public, anon, authenticated;

-- 3) Covering indexes for foreign keys (lint 0001_unindexed_foreign_keys).
--    Speeds up joins and cascades; cheap on a catalogue this size.
create index if not exists blog_posts_author_id_idx
  on public.blog_posts (author_id);
create index if not exists coupon_redemptions_order_id_idx
  on public.coupon_redemptions (order_id);
create index if not exists gift_codes_redeemed_order_id_idx
  on public.gift_codes (redeemed_order_id);
create index if not exists library_items_order_id_idx
  on public.library_items (order_id);
create index if not exists library_items_product_id_idx
  on public.library_items (product_id);
create index if not exists newsletter_subscribers_user_id_idx
  on public.newsletter_subscribers (user_id);
create index if not exists planner_instances_product_id_idx
  on public.planner_instances (product_id);
create index if not exists product_reviews_order_id_idx
  on public.product_reviews (order_id);
create index if not exists review_request_sends_product_id_idx
  on public.review_request_sends (product_id);
create index if not exists wishlist_items_product_id_idx
  on public.wishlist_items (product_id);

-- 4) Drop byte-identical duplicate indexes (lint duplicate_index). The kept
--    index has the same definition, so query plans are unaffected.
--    kept: analytics_events_event_created_idx  (event_name, created_at DESC)
--    kept: analytics_events_visitor_created_idx (visitor_id, created_at DESC)
drop index if exists public.analytics_events_name_idx;
drop index if exists public.analytics_events_visitor_idx;
