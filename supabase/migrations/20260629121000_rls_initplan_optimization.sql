-- RLS performance: wrap auth.uid() / is_admin() in scalar subqueries so the
-- planner evaluates them once per statement (initplan) instead of once per row.
-- Resolves Supabase lint 0003_auth_rls_initplan. Policy logic is unchanged —
-- only the evaluation strategy differs. Definitions mirror the live policies
-- exactly (captured from pg_policies) with the calls wrapped in (select ...).

-- profiles -----------------------------------------------------------------
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (((select auth.uid()) = id) or (select public.is_admin()));

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update to authenticated
  using (((select auth.uid()) = id) or (select public.is_admin()))
  with check (((select auth.uid()) = id) or (select public.is_admin()));

-- orders -------------------------------------------------------------------
drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin" on public.orders
  for select to authenticated
  using (((select auth.uid()) = user_id) or (select public.is_admin()));

-- order_items --------------------------------------------------------------
drop policy if exists "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin" on public.order_items
  for select to authenticated
  using (
    (select public.is_admin())
    or (exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = (select auth.uid())
    ))
  );

-- library_items ------------------------------------------------------------
drop policy if exists "library_items_select_own_or_admin" on public.library_items;
create policy "library_items_select_own_or_admin" on public.library_items
  for select to authenticated
  using (((select auth.uid()) = user_id) or (select public.is_admin()));

-- product_reviews ----------------------------------------------------------
drop policy if exists "Users can read their own reviews" on public.product_reviews;
create policy "Users can read their own reviews" on public.product_reviews
  for select to public
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert reviews for owned products" on public.product_reviews;
create policy "Users can insert reviews for owned products" on public.product_reviews
  for insert to public
  with check (
    ((select auth.uid()) = user_id)
    and (exists (
      select 1 from public.library_items
      where library_items.user_id = (select auth.uid())
        and library_items.product_id = product_reviews.product_id
    ))
  );

drop policy if exists "Users can update their own pending reviews" on public.product_reviews;
create policy "Users can update their own pending reviews" on public.product_reviews
  for update to public
  using (
    ((select auth.uid()) = user_id)
    and (status = any (array['pending'::review_status, 'rejected'::review_status]))
  )
  with check ((select auth.uid()) = user_id);

-- wishlist_items -----------------------------------------------------------
drop policy if exists "Users read their own wishlist" on public.wishlist_items;
create policy "Users read their own wishlist" on public.wishlist_items
  for select to public
  using ((select auth.uid()) = user_id);

drop policy if exists "Users add to their own wishlist" on public.wishlist_items;
create policy "Users add to their own wishlist" on public.wishlist_items
  for insert to public
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users remove their own wishlist" on public.wishlist_items;
create policy "Users remove their own wishlist" on public.wishlist_items
  for delete to public
  using ((select auth.uid()) = user_id);

-- push_subscriptions -------------------------------------------------------
drop policy if exists "Push subscriptions are user-owned" on public.push_subscriptions;
create policy "Push subscriptions are user-owned" on public.push_subscriptions
  for all to public
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- gift_codes ---------------------------------------------------------------
drop policy if exists "Gift codes — purchaser self-read" on public.gift_codes;
create policy "Gift codes — purchaser self-read" on public.gift_codes
  for select to public
  using (
    purchaser_email = (
      select profiles.email from public.profiles
      where profiles.id = (select auth.uid())
    )
  );

-- planner_instances --------------------------------------------------------
drop policy if exists "planner_instances_select_own" on public.planner_instances;
create policy "planner_instances_select_own" on public.planner_instances
  for select to authenticated
  using (((select auth.uid()) = user_id) or (select public.is_admin()));

drop policy if exists "planner_instances_insert_own" on public.planner_instances;
create policy "planner_instances_insert_own" on public.planner_instances
  for insert to authenticated
  with check (
    ((select auth.uid()) = user_id)
    and (exists (
      select 1 from public.library_items
      where library_items.user_id = (select auth.uid())
        and library_items.product_id = planner_instances.product_id
    ))
  );

drop policy if exists "planner_instances_update_own" on public.planner_instances;
create policy "planner_instances_update_own" on public.planner_instances
  for update to authenticated
  using (((select auth.uid()) = user_id) or (select public.is_admin()))
  with check (((select auth.uid()) = user_id) or (select public.is_admin()));

drop policy if exists "planner_instances_delete_own" on public.planner_instances;
create policy "planner_instances_delete_own" on public.planner_instances
  for delete to authenticated
  using (((select auth.uid()) = user_id) or (select public.is_admin()));

-- tester_feedback ----------------------------------------------------------
drop policy if exists "tester_feedback_select_own_or_admin" on public.tester_feedback;
create policy "tester_feedback_select_own_or_admin" on public.tester_feedback
  for select to authenticated
  using (((select auth.uid()) = user_id) or (select public.is_admin()));

drop policy if exists "tester_feedback_insert_own" on public.tester_feedback;
create policy "tester_feedback_insert_own" on public.tester_feedback
  for insert to authenticated
  with check (
    ((select auth.uid()) = user_id)
    and (exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_tester = true
    ))
  );
