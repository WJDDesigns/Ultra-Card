# Ultra Card Pro Lifetime: Announcement Playbook

Use this after the plugin is uploaded, `/pricing/` shows three tiers, and grandfathering is applied.

**Links to paste everywhere**
- Pricing: https://ultracard.io/pricing/
- Lifetime product: https://ultracard.io/product/ultra-card-pro-lifetime/
- Pro (monthly/yearly): https://ultracard.io/product/ultra-card-pro/
- Dashboard (loyalty price): https://ultracard.io/dashboard/
- Modules: https://ultracard.io/modules/

**One-line pitch**
> Pro once. $99. For the life of Ultra Card, and every dollar you’ve already paid counts.

**Three fairness rules (always mention at least #1 and #2)**
1. Loyalty credit: Lifetime costs `$99 − what you’ve paid` (floor $29).
2. Auto Lifetime: hit $99 total paid → convert, billing stops.
3. Launch grandfather: $60+ paid → Lifetime free (already applied if you ran the admin tool).

---

## Step-by-step launch day (do in this order)

### Before you post (30–45 min)

1. Upload `ultra-card-integration.zip` and confirm **Ultra Card → Lifetime** works.
2. Dry-run + Apply grandfathering.
3. Hard-refresh https://ultracard.io/pricing/: Monthly / Yearly / Lifetime visible.
4. Hard-refresh the Pro product page: Lifetime appears in Billing Cycle.
5. Test as yourself: cart shows loyalty credit (negative fee) if you’ve paid before.
6. Pin a Discord `#announcements` (or equivalent) channel ready.
7. Have this doc open; copy the blocks below rather than rewriting on the fly.

### Hour 0: Own community first

1. Discord announcement (primary).
2. Discord short follow-up in general / support: “Questions about credit? Log into your dashboard.”
3. Optional: sticky a FAQ reply under the announcement.

### Hour 1–2: Existing customers

1. Email **yearly renewers Oct–Jan** (highest urgency: 46 people, ~$2,070).
2. Email **all active Pro** (shorter blast).
3. Optional: WooCommerce note / dashboard banner if you use one.

### Hour 2–6: Public HA community

1. Reddit r/homeassistant (honest, not salesy: see tone notes).
2. Reddit r/homeassistant if rules allow self-promo; otherwise r/HomeAssistantCommunity or your usual thread style.
3. GitHub Discussion / release note if you ship a card release same week (optional).
4. Personal / WJD social (X, Facebook HA groups): short + link.

### Day 2–7: Follow-through

1. Reply to every credit / “is this forever?” question with the exact wording below.
2. Mid-week Discord bump: one proof (screenshot of pricing or “loyalty credit at checkout”).
3. Soft DM / email only to Oct renewers who haven’t opened mail (don’t spam).

---

## Tone rules (HA audience)

- Lead with **fairness to existing subscribers**, not “limited time scam energy.”
- Say **“for the life of Ultra Card”**, not “forever forever.”
- Free tier stays free: say it once so you don’t get IFTTT flashbacks.
- Don’t dunk on Mushroom/Bubble: position as payoff for people who want Pro modules + cloud.
- Acknowledge subscriptions were polarizing; Lifetime is the answer to that feedback.

---

## 1. Discord: main announcement

```
🚀 Ultra Card Pro Lifetime is live

A lot of you asked for a one-time option. Here it is.

• Monthly: $4.99/mo
• Yearly: $45/yr (save ~25%)
• Lifetime: $99 once, for the life of Ultra Card

Fairness for people already on Pro:
• Every Pro payment you’ve made is loyalty credit toward Lifetime (you’ll pay $99 minus what you’ve already paid, minimum $29)
• When your total paid hits $99, you convert to Lifetime automatically and billing stops
• Early supporters who already paid $60+ are grandfathered

See all three plans: https://ultracard.io/pricing/
Go Lifetime: https://ultracard.io/product/ultra-card-pro-lifetime/

Log in → Dashboard to see your personal Lifetime price.
Free modules stay free. Pro is for the flagship modules, cloud backups, and snapshots.
```

### Discord: short follow-up (same day, different channel)

```
Lifetime FAQ in one line: log into ultracard.io → Dashboard. Your loyalty credit and “Go Lifetime for $X” are there. Pricing page: https://ultracard.io/pricing/
```

### Discord: sticky FAQ reply (post under announcement)

```
FAQ

Q: Is Lifetime really forever?
A: For the life of the Ultra Card product, meaning Pro features for as long as Ultra Card is offered.

Q: I already pay yearly ($45). What do I pay for Lifetime?
A: $54 ($99 − $45 credit). Checkout applies the credit automatically when you’re logged in.

Q: I’m on monthly. Does each $4.99 count?
A: Yes. Every completed Pro payment counts. At $99 total, you auto-convert and we cancel the subscription.

Q: Does free Ultra Card change?
A: No. Free modules stay free via HACS.

Q: I was grandfathered / got Lifetime free, do I need to do anything?
A: No. Refresh your dashboard; you should show as Lifetime. Subscriptions are cancelled if you had one.
```

---

## 2. Email: yearly renewers (Oct–Jan): send first

**Subject options** (pick one)
- Renew Ultra Card Pro, or go Lifetime for $54
- Your Pro renewal is coming: Lifetime is available
- One more year, or own it: Lifetime for existing members

**Body**

```
Hi {first_name},

Your Ultra Card Pro yearly plan renews on {renewal_date} for $45.

You now have a third option: Ultra Card Pro Lifetime. $99 once, for the life of Ultra Card.

Because you’ve already paid $45, your loyalty credit brings Lifetime to ${due} at checkout (usually $54). Same Pro features. No more yearly renewals.

• See plans: https://ultracard.io/pricing/
• Go Lifetime: https://ultracard.io/product/ultra-card-pro-lifetime/
• Or renew as usual: https://ultracard.io/my-account/subscriptions/

Log into your dashboard anytime to see your personal Lifetime price.

Thanks for supporting Ultra Card,
Wayne / WJD Designs
```

**Merge fields**
- `{due}` = `99 − cumulative_paid` (floor 29). Most yearly = **54**.
- `{renewal_date}` from Woo next payment.

---

## 3. Email: all active Pro (broader)

**Subject**
- Ultra Card Pro Lifetime is here: your payments count

**Body**

```
Hi {first_name},

Ultra Card Pro Lifetime is live: $99 once, for the life of Ultra Card.

If you’re already on monthly or yearly, you don’t start from zero.
• Loyalty credit = what you’ve already paid (Lifetime due is $99 minus that, min $29)
• Hit $99 total paid and you convert automatically and billing stops

Monthly and yearly stay available.

Pricing: https://ultracard.io/pricing/
Lifetime: https://ultracard.io/product/ultra-card-pro-lifetime/
Your price: https://ultracard.io/dashboard/

Thanks for being Pro,
Wayne
```

---

## 4. Reddit: r/homeassistant

**Title options**
- Ultra Card now has a Lifetime Pro option ($99): existing payments count as credit
- Feedback heard: Ultra Card Pro Lifetime is live (one-time, loyalty credit for current subs)

**Body**

```
Hey all,

When Ultra Card Pro launched, a lot of feedback (here and elsewhere) was that a subscription felt wrong for a dashboard card, even with a free tier. Fair.

I’ve added a Lifetime option:

• Free: still free via HACS (core modules)
• Pro Monthly: $4.99
• Pro Yearly: $45
• Pro Lifetime: $99 once, for the life of Ultra Card

For people already subscribed:
- Prior Pro payments are loyalty credit toward Lifetime
- At $99 cumulative paid, accounts auto-convert to Lifetime and billing stops

Details / comparison: https://ultracard.io/pricing/

Happy to answer questions. Not trying to hard-sell. I wanted the pricing model to match how a lot of this community prefers to pay.
```

**Reply you’ll need ready**

```
Lifetime wording is “for the life of Ultra Card” (as long as the product is offered), not a legal “infinity regardless of anything.” Cloud backups/snapshots are included in Pro/Lifetime the same as yearly. Free tier is unchanged.
```

---

## 5. Short social (X / Facebook / HA groups)

```
Ultra Card Pro Lifetime is live. $99 once.

Monthly & yearly still there. Existing Pro payments count as credit toward Lifetime. Auto-converts at $99 paid.

https://ultracard.io/pricing/
```

**Image suggestion (make in Canva, 1200×630)**
- Dark background matching ultracard.io
- Big text: `$99 Lifetime`
- Sub: `For the life of Ultra Card`
- Three small pills: `$4.99/mo` · `$45/yr` · `$99 once`
- Footer URL: ultracard.io/pricing

---

## 6. GitHub / README blurb (optional same week)

```
### Pro pricing
- Monthly $4.99 · Yearly $45 · Lifetime $99 (for the life of Ultra Card)
- Prior Pro payments count toward Lifetime; see https://ultracard.io/pricing/
```

---

## 7. In-app / site microcopy (already partly built)

Use these if you post a temporary site banner or Discord embed title:

| Place | Copy |
|-------|------|
| Banner | Lifetime is here: $99 · your Pro payments count |
| Button | See Lifetime price |
| Checkout trust line | Logged-in members: loyalty credit applied at checkout |
| Cancelled sub note | Upgraded to Lifetime: no further renewals |

---

## 8. Objection → answer cheat sheet

| They say | You say |
|----------|---------|
| “$99 is a lot for a card” | Free tier stays free. Lifetime is optional for Pro modules + cloud. Yearly is $45 if you want to try a year first. |
| “Subscriptions again?” | Lifetime is the one-time path. Monthly/yearly remain for people who want them. |
| “What if Ultra Card dies?” | Lifetime means for the life of the product. Local free modules keep working via HACS either way. |
| “I paid $45 last month” | That $45 is credit. Lifetime due is $54 at checkout when logged in. |
| “Will you raise Lifetime later?” | Current list is $99. Grandfather / credit rules protect what people already paid. |
| “Is this AppSumo bait?” | No flash volume cap marketing. Standing rule: every payment counts toward owning it. |

---

## 9. 7-day content calendar

| Day | Action |
|-----|--------|
| 0 | Discord + renewer emails + Reddit |
| 1 | Reply wave; post 1 checkout screenshot in Discord |
| 2 | Short social bump |
| 3 | “How credit works” Discord mini-thread (3 bullets) |
| 5 | Soft email only to Oct renewers who didn’t click |
| 7 | Stats check: Lifetime orders, credit redemptions, churn on monthly |

---

## 10. Success metrics (first 2 weeks)

- Lifetime orders (gross and after credit)
- Yearly → Lifetime conversions (especially Oct–Nov renewals)
- Monthly → Lifetime conversions
- Grandfather count
- Support tickets: credit not applying (usually = not logged in at checkout)
- Reddit/Discord sentiment: “fair” vs “cash grab”

---

## Pre-flight checklist (print this)

- [ ] Plugin 1.3.50+ uploaded
- [ ] `/pricing/` shows 3 tiers
- [ ] Lifetime product purchasable
- [ ] Logged-in cart shows loyalty credit
- [ ] Grandfather dry-run + apply done
- [ ] Discord announcement posted
- [ ] Renewer emails sent
- [ ] Active Pro email sent
- [ ] Reddit posted + you are available to reply for 2 hours
- [ ] Launch doc + this playbook saved
