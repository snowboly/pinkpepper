# Login Email Code Design

## Goal

Replace the current magic-link fallback on the login page with a typed email-code flow, while keeping password login unchanged and leaving signup untouched in this pass.

## Scope

In scope:

- Keep email + password login exactly as it works today
- Replace the secondary "Send magic link" login option with "Send email code"
- Add an in-page code verification step on the login page
- Preserve the existing `next` redirect behavior after successful login
- Keep signup on its current flow for now

Out of scope:

- Changing signup to email-code entry
- Removing password login
- Building a custom authentication backend outside Supabase
- Reworking auth callback handling beyond what is needed for compatibility

## Current State

The login page currently supports:

- password login via `supabase.auth.signInWithPassword(...)`
- magic-link login via `supabase.auth.signInWithOtp(...)`

The codebase already supports OTP verification through Supabase. The auth callback path handles `verifyOtp(...)` with `type: "email"` as well as legacy magic-link flows, so the auth platform is already compatible with typed-code verification.

## Recommended Approach

Use Supabase to send the login OTP email, then verify the typed code directly from the login page.

Why this approach:

- Minimal auth-surface change
- No custom OTP storage or email delivery logic
- Avoids the device/browser continuity problems of magic links
- Preserves current password login and redirect behavior

## User Experience

### Password login

This remains the primary path and is unchanged:

1. User enters email and password
2. User clicks `Log In`
3. On success, user is redirected to the validated `next` path

### Email-code login

This replaces the current magic-link fallback:

1. User enters email
2. User clicks `Send email code`
3. UI switches into a verification state
4. User enters the emailed code
5. User clicks `Verify code`
6. On success, user is redirected to the validated `next` path

The verification state should also provide:

- `Resend code`
- `Use a different email`

## UI Changes

File:

- `src/app/login/page.tsx`

Replace the existing magic-link UI and state with a two-step OTP UI.

### New UI states

Initial state:

- Password form visible
- Secondary action button labeled `Send email code`

Code-sent state:

- Show a code input field
- Show `Verify code`
- Show `Resend code`
- Show `Use a different email`
- Keep the email visible so the user knows where the code was sent

### Copy updates

Replace link-based messaging such as:

- "Magic link sent"
- "Your login link has expired or already been used"

With code-based messaging such as:

- "Email code sent"
- "Enter the code we sent to your email"
- "The code is invalid or expired"

## Technical Design

### Send code

Use:

- `supabase.auth.signInWithOtp({ email })`

This triggers Supabase to send the login OTP email.

The login page should:

- validate that an email is present before sending
- clear stale errors/messages before sending
- set a local `codeSent` state only after a successful request

### Verify code

Use:

- `supabase.auth.verifyOtp({ email, token, type: "email" })`

Verification should happen directly on the login page. On success:

- rely on Supabase client auth/session handling
- redirect the user to the validated `next` path

### State model

The login page should add local state for:

- `code`
- `codeLoading`
- `resendLoading`
- `codeSent`

Existing password-login state should remain separate from OTP-login state so the flows do not overwrite each other's errors or loading indicators.

## Error Handling

The UI must handle these cases cleanly:

- user clicks `Send email code` without entering an email
- Supabase send-code request fails
- user enters an invalid code
- code is expired
- resend fails
- user switches email after code was already sent

Behavioral rules:

- password and OTP errors should not leak into each other
- changing the email should reset OTP state
- resending should not duplicate success banners in a confusing way
- redirect handling must continue to reject unsafe `next` values

## Compatibility

No login backend route changes are expected for this pass.

Existing callback-based auth handling should remain in place for:

- signup flow
- legacy link-based auth paths that may still exist in old emails or templates

This keeps the login change isolated and reduces regression risk.

## Testing Plan

Add or update tests to cover:

1. Password login path remains unchanged
2. Sending an email code transitions the page into verification mode
3. Successful code verification redirects to `next`
4. Invalid or expired code shows a clear error
5. Resend keeps the user in verification mode and updates messaging correctly
6. Changing email resets code-entry state

## Risks

### Risk: Supabase OTP behavior differs from current expectation

Mitigation:

- verify exact client-side behavior against the existing Supabase client setup
- add focused tests around the login page flow

### Risk: mixed auth states create confusing UI

Mitigation:

- keep password and OTP state isolated
- reset OTP state when the user changes email or exits verification mode

### Risk: inconsistent login vs signup UX

Mitigation:

- explicitly accept this as a scoped first pass
- revisit signup only after login flow is working and validated

## Rollout Recommendation

Implement this as a login-only change first. Do not couple it to signup or broader auth refactors.
