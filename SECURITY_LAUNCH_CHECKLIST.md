# Templify Security Launch Checklist

Use this before soft launch and repeat after every permission or vendor change.

## Secrets And Accounts

- [ ] No secrets are committed to GitHub.
- [ ] No secrets are stored in Google Drive, screenshots, docs, tickets, or chat exports.
- [ ] `.env.local` stays local and Vercel env vars are managed in Vercel only.
- [ ] Supabase, Stripe, Vercel, domain registrar, Make, and business email accounts have 2FA enabled.
- [ ] A separate technical owner email exists for infrastructure accounts.
- [ ] The owner list for Supabase, Stripe, Vercel, domain, Make, email, and GitHub is documented internally.

## Supabase

- [ ] Admin access is controlled by `admin_allowlist` and reviewed before launch.
- [ ] `profiles.role` is only changed by admin-controlled flows.
- [ ] RLS is reviewed for `profiles`, `admin_allowlist`, `products`, `categories`, `orders`, `order_items`, `library_items`, `content_pages`, `faq_items`, `testimonials`, `site_sections`, and `analytics_events`.
- [ ] `product-files` bucket is private.
- [ ] `product-covers` bucket is not used for private paid files.
- [ ] Product downloads use signed URLs with a short TTL.
- [ ] Database backups are enabled and restore has been tested.
- [ ] Product file backups exist outside the app runtime.
- [ ] Supabase production `Site URL` and `Redirect URLs` point to the real production and preview origins.

## Stripe

- [ ] `STRIPE_SECRET_KEY` is configured only in server environments.
- [ ] `STRIPE_WEBHOOK_SECRET` is configured in Vercel and local development.
- [ ] Webhook endpoint verifies signatures.
- [ ] `checkout.session.completed` fulfillment is idempotent.
- [ ] Test purchase, webhook retry, success-page refresh, and duplicate purchase are tested.

## Vercel And Runtime

- [ ] `NEXT_PUBLIC_SITE_URL` points to the production origin.
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` are present.
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` are present.
- [ ] Optional analytics IDs are added only when consent-aware script loading is wired.
- [ ] `npm run lint`, `npm run typecheck`, and `npm run build` pass before deployment.
