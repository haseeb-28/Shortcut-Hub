# Appwrite Password Recovery — Manual Setup Guide

This guide assumes **zero prior Appwrite knowledge**. It walks through every click needed to
make "Forgot Password" actually send an email and work end to end. The app's code side is
already done — this document covers only the configuration that has to happen inside the
Appwrite Cloud console (things no amount of code can do for you, because they involve your own
domain, email provider, and account settings).

There are two things to configure, and both are required — the feature won't work with only one:

1. A **Recovery URL** — tells Appwrite which page in your app the reset link should point to.
2. An **SMTP provider** — tells Appwrite how to actually send the email. Appwrite Cloud does
   **not** send email on your behalf by default.

---

## Step 1 — Open the right place in the Appwrite Console

1. Go to **[cloud.appwrite.io](https://cloud.appwrite.io)** and log in.
2. Click into your **Shortcut Hub** project (the same one from the main README setup).
3. In the left sidebar, click **Auth**.
4. At the top of the Auth page, click the **Settings** tab.

You should now be looking at the same "Auth methods" page where you turned on Email/Password
earlier. The two things below both live on this page, in different sections — keep scrolling
down as you go through Steps 2 and 3.

For reference, the path you just took is:

```
Project
  ↓
Auth
  ↓
Settings
```

---

## Step 2 — Configure the Recovery URL

### What it is

The Recovery URL is the page in *your app* (not Appwrite's) where someone lands after clicking
the link in their recovery email. Appwrite appends two things to whatever URL you give it —
`?userId=...&secret=...` — so the final link people click looks like:

```
http://localhost:3000/reset-password?userId=abc123&secret=xyz789
```

That's exactly the page this app already built at `/reset-password` — it reads those two
parameters and completes the recovery.

### Why it's needed

Without this set correctly, Appwrite either won't know where to send people, or will send them
to the wrong place (e.g. still pointing at `localhost` after you deploy to Vercel) — which is by
far the most common cause of "the reset link doesn't work."

### How to set it

1. Still on **Auth → Settings**, scroll down to a section called **Security** (or
   **Recovery** — the exact label has moved around across Appwrite versions, but it's the
   section with a **Recovery URL** or **Password recovery** field).
2. You'll see a field to enter a URL. Enter, depending on where you're testing:

   **While developing locally:**
   ```
   http://localhost:3000/reset-password
   ```

   **Once deployed to Vercel:**
   ```
   https://your-domain.com/reset-password
   ```
   (replace `your-domain.com` with your actual Vercel URL, e.g. `shortcut-hub.vercel.app`)

3. Click **Update** / **Save** for that section.

> **You will likely need to change this value when you move from local development to
> production**, and change it back if you switch to testing locally again. If you forget to
> update it after deploying, recovery emails sent from the *live* site will still link to
> `localhost`, which won't be reachable for anyone but you on your own machine.

### Common mistakes

- **Trailing slash mismatch** — `https://your-domain.com/reset-password/` (with a trailing
  slash) vs. without one. Match exactly what your app actually serves; this app's route is
  `/reset-password` with no trailing slash.
- **`http` vs `https`** — production must be `https`; Vercel serves everything over `https` by
  default, so use `https://` once deployed.
- **Forgetting to update after deploying** — see the warning above.
- **Pointing at the wrong path** — it must be `/reset-password`, not `/login` or the site root;
  that's the page that actually reads `userId`/`secret` and completes the recovery.

### How to verify it

After saving, send yourself a test recovery email (see Step 4 for the full flow) and check that
the link inside actually starts with the URL you just entered, followed by `?userId=` and
`&secret=`.

---

## Step 3 — Configure Email Delivery (SMTP)

### Why this step exists

**Appwrite Cloud does not send emails on your behalf out of the box.** Without an SMTP provider
configured, clicking "Send Reset Link" in the app will appear to succeed (the app always shows a
generic success message — see the main README's Forgot Password section for why) but **no email
will ever actually arrive**, because Appwrite has nowhere to send it from.

This guide uses **Brevo** (formerly Sendinblue) as the recommended provider — it has a free tier
(300 emails/day), a straightforward signup, and works well for a personal app like this one. Any
SMTP provider works the same way once you have its credentials; the Appwrite-side steps are
identical regardless of which one you pick.

### 3a. Create a Brevo account

1. Go to **[brevo.com](https://www.brevo.com)**.
2. Click **Sign up free**.
3. Enter your email, a password, and basic account details (company name can be anything, e.g.
   "Personal").
4. Verify your email address — check your inbox for a confirmation link from Brevo and click it.

### 3b. Verify a sender email

Before Brevo will let you send mail *from* an address, you have to prove you control it.

1. Once logged into Brevo, go to **Senders, Domains & Dedicated IPs** (usually under a gear/
   settings icon, or a "Senders" link in the left menu).
2. Click **Senders** → **Add a sender**.
3. Enter:
   - **Sender name** — what recipients see, e.g. `Shortcut Hub`
   - **Sender email** — the address you want recovery emails to come from, e.g. your own Gmail
     address, or an address at a domain you own
4. Click **Save**. Brevo sends a verification email to that address.
5. Open that inbox, find the email from Brevo, and click the verification link inside it.
6. Back in Brevo, the sender should now show a green "Verified" status.

> If you don't own a custom domain, using your personal email address as the sender is fine for
> a personal project like this — you just need to be able to receive and click that one
> verification email.

### 3c. Get your SMTP credentials

1. In Brevo, go to **SMTP & API** (often under the same Senders/settings area, or search "SMTP"
   in Brevo's search bar).
2. Click the **SMTP** tab (not "API Keys" — Appwrite needs SMTP credentials specifically, not an
   API key).
3. You'll see a block of connection details. Note these down — you'll enter them into Appwrite
   in the next section:

   | Field | Typical Brevo value |
   |---|---|
   | **SMTP Server / Host** | `smtp-relay.brevo.com` |
   | **Port** | `587` |
   | **Login / Username** | your Brevo account email (shown on this page) |
   | **Password** | a generated SMTP key — click **Generate a new SMTP key** if you don't see one, then copy it immediately (it's shown only once) |

4. Save the SMTP key somewhere safe temporarily (a password manager, or a scratch note you'll
   delete after the next step) — you cannot view it again later, only regenerate a new one.

### 3d. Enter the SMTP settings into Appwrite

1. Back in the Appwrite Console, still on **Auth → Settings**, scroll to the **SMTP** section
   (sometimes labeled **Custom SMTP** or **Email settings**).
2. Toggle **Enable custom SMTP** (or similar) **on** — without this toggle, Appwrite ignores
   whatever you fill in below and falls back to not sending mail at all.
3. Fill in each field using the Brevo values from Step 3c:

   | Appwrite field | What to enter |
   |---|---|
   | **Sender Name** | `Shortcut Hub` (or whatever you used as the Brevo sender name) |
   | **Sender Email** | the exact email address you verified in Step 3b |
   | **Reply-To Email** *(if shown)* | same as Sender Email, or leave blank |
   | **Host** | `smtp-relay.brevo.com` |
   | **Port** | `587` |
   | **Username** | your Brevo account email |
   | **Password** | the SMTP key you generated in Step 3c |
   | **Encryption** | **TLS** (Brevo's port 587 uses STARTTLS; choose TLS if SSL/TLS is the only choice offered) |

4. Click **Update** / **Save**.

### 3e. Send a test email

Most Appwrite Console versions have a **Send test email** button right in this SMTP section —
use it first, before testing through the actual app:

1. Click **Send a test email** (or similarly labeled button) in the SMTP section.
2. Enter an email address you can check.
3. Click **Send**.
4. Check that inbox (and its spam/junk folder) within a minute or two.

If the test email arrives, SMTP is correctly configured and you're done with Step 3. If it
doesn't, see the Troubleshooting table below before moving on.

### Common SMTP errors and fixes

| Error / Symptom | Fix |
|---|---|
| "Authentication failed" | Double-check the Username is your full Brevo account email, and the Password is the SMTP key (not your Brevo login password — they're different) |
| "Connection refused" / timeout | Confirm Port is `587` and Encryption is set to TLS, not SSL/none |
| Test email never arrives | Check spam/junk; confirm the Sender Email is the one you verified in 3b (Brevo will silently reject mail from unverified senders) |
| "Sender not verified" | Go back to Brevo → Senders and confirm the sender shows a green "Verified" badge — resend the verification email if it's still pending |

---

## Step 4 — Test the Complete Recovery Flow

Once both Step 2 and Step 3 are done, test the whole thing end to end:

1. **Register a user** (if you don't already have one) — either through your app's normal
   sign-up, or via Appwrite Console → Auth → Users → Create user.
2. **Log out** of the app if you're signed in.
3. On the login page, click **Forgot password?**
4. Enter that user's email address and click **Send Reset Link**.
5. You should see: *"If an account exists for this email, a password recovery email has been
   sent."*
6. **Check that inbox** (and spam/junk folder) — the email should arrive within a minute or two,
   sent from the Sender Name/Email you configured in Step 3d.
7. **Open the email** and click the recovery link inside it.
8. You should land on `/reset-password` in your app, with a form for a new password.
9. **Enter a new password** (8+ characters), confirm it, and submit.
10. You should see **"Password Updated Successfully"**, then get redirected to `/login`
    automatically after a couple of seconds.
11. **Log in** with the new password to confirm it actually took effect.

If every step above works, the feature is fully configured and production-ready.

---

## Step 5 — Troubleshooting

| Problem | Likely cause | How to fix |
|---|---|---|
| **Recovery email not received** | SMTP not configured or not enabled | Revisit Step 3 — confirm the "Enable custom SMTP" toggle is on and a test email sends successfully |
| **Recovery email not received** (SMTP works otherwise) | Sender email not verified in Brevo | Go to Brevo → Senders, confirm a green "Verified" badge next to the sender email used in Appwrite's SMTP settings |
| **Recovery email lands in spam** | Sending domain has no SPF/DKIM records, or is a personal Gmail-style address | For a personal project this is usually harmless (just check spam once); for anything more serious, verify a custom domain in Brevo instead of a personal inbox address |
| **"This link is no longer valid" immediately after clicking** | Recovery URL in Appwrite doesn't match `/reset-password` exactly, so the link Appwrite generated doesn't actually reach the page correctly | Recheck Step 2 — exact scheme (`http`/`https`), domain, and path, no trailing slash |
| **Recovery link expired** | Appwrite recovery links expire after a set time (commonly ~1 hour) | This is expected behavior, not a bug — request a new one via **Forgot password?** again |
| **Recovery link already used / reused** | Each recovery secret is single-use by design | Request a new recovery email; the old link can never be reused, even by the same person |
| **SMTP authentication failed** | Wrong Username/Password pair entered in Appwrite | Confirm Username is your Brevo account email and Password is the generated SMTP key, not your Brevo login password (see Step 3c/3d) |
| **Sender not verified (Brevo rejects the send)** | The Sender Email in Appwrite's SMTP settings wasn't verified in Brevo | Go back to Brevo → Senders, verify that exact address, and make sure Appwrite's "Sender Email" field matches it character-for-character |
| **Invalid redirect URL / link points to `localhost` in production** | Recovery URL in Appwrite still set to the local development value after deploying | Update the Recovery URL in Auth → Settings to your production `https://` domain (Step 2) |
| **"Password update failed" after entering a new password** | Recovery link's secret already expired/used between opening the email and submitting the form | Request a fresh recovery email and complete the form promptly this time |
| **Nothing happens when clicking "Send Reset Link"; no success message either** | This would indicate a code-level issue, not a configuration one | Check the browser console for errors; confirm `NEXT_PUBLIC_APPWRITE_*` env vars are set correctly (see main README §9) |

---

Once this is working, no further Appwrite-side maintenance is needed — the Recovery URL and SMTP
settings persist until you deploy to a new domain or rotate your SMTP credentials.
