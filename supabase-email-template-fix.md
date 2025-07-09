# Fix Supabase Password Reset Email Template

## Current Issue
Your email template is using `{{ .ConfirmationURL }}` which is for email confirmations, not password resets.

## Correct Email Template

Replace your current email template with this:

```html
<h2>Reset Password</h2>

<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .RedirectTo }}">Reset Password</a></p>
```

## Steps to Fix:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Select **Reset Password** template (not Confirm signup)
4. Replace the content with the template above
5. Save the changes

## Alternative Full Template (Optional)

If you want a more complete template:

```html
<h2>Reset Password</h2>

<p>Hello,</p>

<p>You have requested to reset your password for your Mitratech Idea Portal Dashboard account.</p>

<p>Follow this link to reset your password:</p>
<p><a href="{{ .RedirectTo }}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>

<p>If you didn't request this password reset, you can safely ignore this email.</p>

<p>This link will expire in 1 hour for security reasons.</p>

<p>Best regards,<br>
Mitratech Team</p>
```

## Key Points:
- Use `{{ .RedirectTo }}` for password reset emails
- Use `{{ .ConfirmationURL }}` only for email confirmation emails
- Make sure you're editing the "Reset Password" template, not the "Confirm signup" template