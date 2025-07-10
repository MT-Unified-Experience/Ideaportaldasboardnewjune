# ✅ Email Template is Correct - Now Check URL Configuration

Your email template is perfect! The issue might be in the URL configuration.

## 🔍 Next Steps to Fix the Reset Link

### Step 1: Check URL Configuration in Supabase
1. In your Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Verify these settings:

**Site URL:**
```
https://bucolic-gingersnap-b526ad.netlify.app
```

**Redirect URLs (add both):**
```
https://bucolic-gingersnap-b526ad.netlify.app/reset-password
http://localhost:5173/reset-password
```

### Step 2: Check CORS Settings
1. Go to **Settings** → **API**
2. In **CORS allowed origins**, make sure you have:
```
https://bucolic-gingersnap-b526ad.netlify.app
http://localhost:5173
```

### Step 3: Test the Flow
1. **Clear your browser cache and cookies** for your site
2. Go to your deployed site: `https://bucolic-gingersnap-b526ad.netlify.app`
3. Try the password reset flow again
4. Check the email - the link should now include tokens like:
   ```
   https://bucolic-gingersnap-b526ad.netlify.app/reset-password?access_token=...&refresh_token=...&type=recovery
   ```

### Step 4: If Still Not Working
If the reset link still doesn't have tokens, try this:

1. **Wait 5-10 minutes** after saving the URL configuration (Supabase sometimes takes time to propagate changes)
2. **Test from an incognito/private browser window**
3. **Check your email spam folder** to make sure you're getting the latest email

## 🚨 Common Issues:

- **Caching**: Supabase might be serving cached email templates
- **Propagation delay**: URL configuration changes can take a few minutes
- **Browser cache**: Your browser might be caching the old reset page

## 🔧 If Problem Persists:

The email template is correct, so the issue is likely in:
1. URL configuration not saved properly
2. CORS settings
3. Caching issues
4. Supabase propagation delay

Try the steps above and let me know if you're still seeing the issue!