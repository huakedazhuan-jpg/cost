# Shared Expense PWA Design

Date: 2026-06-16

## Goal

Build a private PWA for two people to record shared household expenses from iPhone and Android. The app should be installable to the phone home screen, require minimal setup, and calculate monthly settlement suggestions without tracking actual transfers.

## Product Scope

The first version only records shared living expenses. It does not track personal spending.

Two users share one ledger. The app does not use email/password login. On first use, a user enters a shared ledger key, then chooses their identity on the device. The selected identity is stored locally and used as both the creator and payer for new expenses by default.

Each expense contains:

- Amount
- Category
- Date
- Optional note
- Creator identity, stored automatically
- Payer identity, defaulting to creator
- Split mode, defaulting to 50/50

Special split modes are available from a secondary control:

- One person pays and bears the full expense
- Custom split ratio or amount

The app calculates each natural month independently. A new month starts from zero. Prior month balances remain visible in history but do not carry into the next month.

## Non-Goals

- No App Store or Google Play release in the first version
- No account/password login
- No personal expense tracking
- No actual repayment or settlement record
- No offline expense creation
- No push notifications
- No receipt image upload

## Technical Approach

Use `React + Vite + TypeScript` for the frontend and Supabase for backend data storage.

The frontend is a mobile-first PWA. Users on iOS can add it to the home screen from Safari. Android users can add it from Chrome or another PWA-capable browser.

Supabase provides Postgres storage. Because the app does not use normal user accounts, direct anonymous table access should be blocked. The frontend should call Supabase Edge Functions or RPC endpoints that validate the shared ledger key before reading or writing ledger data. The Supabase service role key must only exist server-side.

## App Flow

1. User opens the PWA.
2. If no ledger key is stored locally, the app asks for the shared ledger key.
3. If no identity is stored locally, the app asks the user to choose one of the two ledger members.
4. The home page shows current month total spending and recent expenses.
5. The user adds expenses with a short form.
6. The statistics/month page shows total spending, category breakdown, and who should compensate whom for the selected month.

## UI Structure

The app has a small bottom navigation:

- Home
- Details
- Statistics
- Settings

Home shows:

- Current month total shared spending
- Number of current month expense records
- Primary add-expense button
- Recent shared expenses

Add expense shows:

- Amount input
- Category selector
- Date picker, defaulting to today
- Optional note
- Collapsed advanced split settings

Details shows:

- Expense list for the selected month
- Edit and delete actions
- Category/date filtering if needed after the core version works

Statistics shows:

- Month selector
- Total spending
- Category totals
- Payment contribution by person
- Monthly settlement suggestion

Settings shows:

- Current ledger
- Current identity
- Switch identity
- Change ledger key
- PWA install guidance

## Data Model

`ledgers`

- `id`
- `name`
- `access_key_hash`
- `created_at`

`ledger_members`

- `id`
- `ledger_id`
- `member_key`, such as `me` or `partner`
- `display_name`
- `created_at`

`categories`

- `id`
- `ledger_id`, nullable for built-in categories
- `name`
- `sort_order`
- `is_active`

`expenses`

- `id`
- `ledger_id`
- `amount_cents`
- `category_id`
- `spent_on`
- `note`
- `created_by_member_id`
- `paid_by_member_id`
- `split_mode`, one of `equal`, `single`, `custom`
- `created_at`
- `updated_at`

`expense_splits`

- `id`
- `expense_id`
- `member_id`
- `share_cents`

For default 50/50 expenses, split rows may be generated at write time so calculations stay simple and auditable. Store money as integer cents to avoid floating point errors.

Default category keys:

- `dining`
- `groceries_daily`
- `rent_utilities`
- `transport`
- `entertainment`
- `medical`
- `travel`
- `other`

The UI should map these stable keys to Chinese display labels.

## Monthly Balance Calculation

For a selected month:

1. Load expenses where `spent_on` is within that natural month.
2. Sum each member's paid amount from `paid_by_member_id`.
3. Sum each member's owed amount from `expense_splits.share_cents`.
4. Calculate `net = paid_cents - owed_cents`.
5. If one member's net is positive and the other's is negative, the negative member should compensate the positive member by the absolute value.

Example:

- Total spending: 1000
- Default split: 500 each
- Person A paid 800
- Person B paid 200
- A net: +300
- B net: -300
- Statistics shows: B should pay A 300

The calculation never carries balances across months.

## Data Access And Security

The shared ledger key is the private access credential for the ledger. It should be long and unguessable.

Client behavior:

- Store ledger key locally on the device after entry.
- Store selected member identity locally.
- Send the ledger key to backend functions over HTTPS when reading or writing data.
- Never show the full key in normal UI after setup.

Backend behavior:

- Store only a hash of the ledger key.
- Validate the supplied key before every ledger operation.
- Deny direct anonymous table access with Row Level Security.
- Use Edge Functions or RPC wrappers to scope every operation to the validated ledger.

This is weaker than account-based auth but acceptable for a private two-person app if the key is kept private.

## Error Handling

- No network: the app may show already-loaded data, but create/update/delete actions fail with a clear "network required" message.
- Wrong ledger key: show "ledger not found or key incorrect" without revealing which part failed.
- No selected identity: block entry into the main app until the user chooses an identity.
- Invalid amount: require a positive value with at most two decimal places.
- Invalid date: use a valid calendar date; date controls determine month ownership.
- Delete/edit: allow both in the first version, with confirmation before deletion.
- Concurrent edits: rely on Supabase writes as source of truth and refresh month data after mutations.

## Testing Plan

Unit tests:

- Equal split balance calculation
- Single-person responsibility
- Custom split
- Cross-month isolation
- Integer cent conversion and currency formatting
- Invalid amount rejection

Integration tests:

- Correct ledger key can read/write the ledger
- Wrong ledger key cannot read/write the ledger
- Expense creation persists creator, payer, and generated split rows
- Month statistics match expected totals

PWA checks:

- Manifest exists
- Icons exist
- App works on mobile viewport
- Refresh preserves local ledger key and selected identity

Manual end-to-end checks:

- Two devices choose different identities
- Each device adds an expense
- Both devices see the same monthly totals
- Statistics shows the same settlement suggestion on both devices

## Implementation Notes

Start with a single ledger and two configured members. Do not generalize to arbitrary groups in the first version.

Keep the first version narrow: reliable data entry, clear monthly totals, and correct settlement math matter more than charts or extra settings.
