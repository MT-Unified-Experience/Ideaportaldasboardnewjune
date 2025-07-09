# Fix Supabase Password Reset Email Template

## 🚨 CRITICAL FIX NEEDED

Your email template is using `{{ .ConfirmationURL }}` which is for **email confirmations**, not **password resets**.

## ✅ Correct Email Template

**Go to Supabase Dashboard → Authentication → Email Templates → Reset Password**

Replace your current template with:

```html
<h2>Reset Password</h2>

<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .RedirectTo }}">Reset Password</a></p>
```

## 🔧 Step-by-Step Fix:

1. **Open Supabase Dashboard**
2. **Go to Authentication → Email Templates**
3. **Select "Reset Password"** (NOT "Confirm signup")
4. **Replace the entire content** with the template above
5. **Save the changes**
6. **Test the flow again**

## 📧 Enhanced Template (Optional)

For a better user experience:

```html
<h2>Reset Your Password</h2>

<p>Hello,</p>

<p>You requested to reset your password for your Mitratech Idea Portal Dashboard account.</p>

<p>Click the button below to reset your password:</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .RedirectTo }}" 
     style="background-color: #3b82f6; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            display: inline-block;
            font-weight: 500;">
    Reset Password
  </a>
</p>

<p>If you didn't request this password reset, you can safely ignore this email.</p>

<p><small>This link will expire in 1 hour for security reasons.</small></p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

<p><small>Best regards,<br>Mitratech Team</small></p>
```

## ⚠️ Important Notes:

- **`{{ .RedirectTo }}`** = For password reset emails
- **`{{ .ConfirmationURL }}`** = For email confirmation emails only
- Make sure you're editing the **"Reset Password"** template
- The template must be saved in Supabase Dashboard

## 🧪 After Making Changes:

1. Request a new password reset
2. Check the email you receive
3. The link should now contain the proper tokens
4. The reset flow should work correctly

This is the most likely cause of your "Invalid Reset Link" error!