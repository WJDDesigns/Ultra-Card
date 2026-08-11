# Cutover: Native Add-Preset + Member Dashboard (plugin 1.3.5)

## Upload
1. Upload / replace `ultra-card-integration.zip` (v1.3.5) on ultracard.io.
2. Confirm Plugins list shows **Ultra Card Integration 1.3.5**.

## WordPress pages
1. **Add Preset** (`/add-preset/`)
   - Keep the page published with slug `add-preset`.
   - Remove the Gravity Forms shortcode from the page body (the plugin template replaces the whole page).
2. **Dashboard** (`/dashboard/`)
   - Keep slug `dashboard`.
   - Confirm menu / account links still point to `/dashboard/`.

## Smoke test
- Logged out → `/add-preset/` and `/dashboard/` redirect to login.
- Dashboard has clear top/bottom spacing under the site header.
- **Subscription & billing**: plan details, next/last payment, payment method, manage / payment methods / billing address / cancel links.
- **Invoices & payments** table with View links for each order.
- Submit preset → appears under My Presets.

## Cache
Purge page cache / CDN for `/add-preset/`, `/dashboard/`, and related REST routes.
