# 🚨 CRITICAL: Fix Supabase Password Reset Email Template

## The Problem
Your password reset emails are not including the necessary tokens because the email template is using the wrong variable.

## ✅ IMMEDIATE FIX REQUIRED

**Go to your Supabase Dashboard and follow these exact steps:**

### Step 1: Access Email Templates
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Email Templates**

### Step 2: Select the Correct Template
4. Click on **"Reset Password"** template (NOT "Confirm signup")

### Step 3: Replace the Template Content
5. **Delete all existing content** in the template
6. **Replace with this exact template:**

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

### Step 4: Verify URL Configuration
7. Go to **Authentication** → **URL Configuration**
8. Set **Site URL** to: `https://bucolic-gingersnap-b526ad.netlify.app`
9. Add to **Redirect URLs**:
   - `https://bucolic-gingersnap-b526ad.netlify.app/reset-password`
   - `http://localhost:5173/reset-password` (for development)

### Step 5: Save and Test
10. **Save** the email template
11. **Save** the URL configuration
12. Test the password reset flow again

## 🔑 Key Points:

- **`{{ .RedirectTo }}`** = Correct variable for password reset emails
- **`{{ .ConfirmationURL }}`** = Wrong variable (only for email confirmations)
- The template MUST be saved in the **"Reset Password"** section
- URL configuration MUST include your deployed domain

## 🧪 After Making Changes:

1. Request a new password reset from your deployed site
2. Check the email - the link should now contain proper tokens like:
   ```
   https://bucolic-gingersnap-b526ad.netlify.app/reset-password?access_token=...&refresh_token=...&type=recovery
   ```
3. The reset flow should work correctly

## ⚠️ Common Mistakes to Avoid:

- Don't edit the "Confirm signup" template by mistake
- Don't use `{{ .ConfirmationURL }}` in password reset emails
- Don't forget to add your deployed URL to the redirect URLs
- Don't forget to save both the template AND URL configuration

This fix will resolve the "Invalid Reset Link" error you're experiencing!