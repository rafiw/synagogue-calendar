# 🔄 GitHub Backup Setup Guide

## ⚠️ Important: This is Optional!

**The app works perfectly without GitHub backup.** You only need this if you want to:

- ✅ Sync settings across multiple devices (tablets, phones, displays)
- ✅ Backup your configuration safely in the cloud
- ✅ Update settings from any device and sync everywhere automatically

If you're only using one device, you can skip this entirely!

---

## 📋 What You'll Need

- GitHub account (free)
- 10 minutes of time
- The synagogue calendar app

---

## 🚀 Step-by-Step Setup

### Step 1: Create a GitHub Account

If you don't have a GitHub account:

1. Go to [https://github.com](https://github.com)
2. Click **Sign up**
3. Follow the registration process (it's free!)
4. Verify your email address

### Step 2: Create a Private Gist

A Gist is a simple way to store snippets of data on GitHub.

1. **Go to GitHub Gist**
   - Visit [https://gist.github.com](https://gist.github.com)
   - Make sure you're logged in

2. **Fill in the Gist Details**

   **Gist description:**

   ```
   Synagogue Calendar Settings
   ```

   **Filename:**

   ```
   synagogue-settings.json
   ```

   **File contents:**

   ```json
   {}
   ```

   _(Just two curly braces - this creates an empty JSON object)_

3. **Create Secret Gist**
   - **IMPORTANT:** Click **"Create secret gist"** (not public!)
   - Secret gists are private and only accessible to you

![Create Gist](./images/gist1.png)

### Step 3: Copy the Gist ID

After creating your gist, look at the URL in your browser:

```
https://gist.github.com/yourusername/abc123def456789
                                      ^^^^^^^^^^^^^^^^
                                      This is your Gist ID
```

**Copy the Gist ID** (the long alphanumeric string after your username)

Example: If the URL is `https://gist.github.com/johndoe/1a2b3c4d5e6f7g8h9i0j`  
Your Gist ID is: `1a2b3c4d5e6f7g8h9i0j`

### Step 4: Generate a Personal Access Token

GitHub tokens are like passwords that give specific permissions.

1. **Go to Token Settings**
   - Visit [https://github.com/settings/tokens](https://github.com/settings/tokens)

2. **Generate New Token**
   - Click **"Generate new token"**
   - Choose **"Generate new token (classic)"**

3. **Configure the Token**

   **Note (token name):**

   ```
   Synagogue Calendar App
   ```

   **Expiration:**
   - Choose **"No expiration"** (recommended)
   - Or set a long expiration if you prefer

   **Select scopes:**
   - ✅ Check **gist** (Full control of gists)
   - ⚠️ Don't check anything else (for security)

![Token Scopes](./images/token-scopes.png)

4. **Generate Token**
   - Scroll to bottom and click **"Generate token"**
   - **IMPORTANT:** Copy the token immediately!
   - You won't be able to see it again!

   The token looks like:

   ```
   ghp_abc123def456ghi789jkl012mno345pqr678
   ```

5. **Save the Token**
   - Paste it somewhere safe (like a password manager)
   - Or paste it directly into the app settings

### Step 5: Configure the App

Now enter the information into the Synagogue Calendar app:

1. **Open the App Settings**
   - Tap the Settings icon
   - Go to General Settings

2. **Find the GitHub Gist Section**

3. **Enter Your Details:**

   **Gist URL Part:**

   ```
   1a2b3c4d5e6f7g8h9i0j
   ```

   _(Your Gist ID from Step 3)_

   **File Name:**

   ```
   synagogue-settings.json
   ```

   _(Must match exactly what you named it in Step 2)_

   **Gist Key:**

   ```
   ghp_abc123def456ghi789jkl012mno345pqr678
   ```

   _(Your token from Step 4)_

4. **Save Settings**
   - Tap "Save"
   - The app will test the connection
   - You should see a success message!

![App Settings](./images/app-gist-settings.png)

---

## 🎉 You're Done!

Your settings will now automatically:

- ✅ Backup to GitHub when you make changes
- ✅ Sync to other devices using the same Gist
- ✅ Restore if you reinstall the app

---

## 🔄 Setting Up on Additional Devices

To sync another device:

1. Install the Synagogue Calendar app
2. Go to Settings → General
3. Enter the **same** Gist ID, filename, and token
4. Save settings
5. All settings will sync automatically!

---

## 🔧 Troubleshooting

### "Failed to connect to Gist"

**Check these:**

- ✅ Gist ID is correct (no spaces or typos)
- ✅ Filename matches exactly: `synagogue-settings.json`
- ✅ Token is valid and has `gist` permission
- ✅ Gist is "secret" (private), not public
- ✅ You have internet connection

**Solution:**

1. Go to your Gist on GitHub
2. Check the URL for the correct ID
3. Verify the filename is spelled correctly
4. Try generating a new token if needed

### "Permission denied"

**This means:**

- Token doesn't have `gist` permission
- Token has expired
- Token was deleted

**Solution:**

1. Generate a new token (Step 4)
2. Make sure to check the `gist` permission
3. Set expiration to "No expiration"
4. Update the app with the new token

### Settings not syncing between devices

**Check:**

- ✅ Both devices use the same Gist ID
- ✅ Both devices have internet connection
- ✅ Try manually refreshing settings

**Solution:**

1. Open settings on one device
2. Make a small change and save
3. Wait a few seconds
4. Open settings on other device
5. Pull down to refresh

### Can't see my Gist

**Check:**

- ✅ You're logged into the correct GitHub account
- ✅ Gist wasn't accidentally deleted
- ✅ View all your gists at [https://gist.github.com](https://gist.github.com)

---

## 🔒 Security Best Practices

### Keep Your Token Safe

- ❌ Don't share your token with anyone
- ❌ Don't post it publicly
- ❌ Don't commit it to git
- ✅ Store it securely (password manager)
- ✅ Use a unique token per app
- ✅ Revoke tokens you're not using

### Revoke a Token

If your token is compromised:

1. Go to [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. Find the token
3. Click **Delete**
4. Generate a new token
5. Update the app with new token

### Keep Your Gist Private

- Always use "secret" gists (not public)
- Secret gists are still accessible via direct URL
- Don't share the Gist URL publicly

---

## 📊 What Data is Stored?

The Gist stores all your app settings:

- Synagogue name and location
- Zmanim calculation settings
- Classes and schedules
- Messages and announcements
- Memorial entries
- Prayer schedules
- Background and appearance settings

**What's NOT stored:**

- No personal identifying information
- No financial data
- No passwords (except the Gist token itself)

---

## 🎯 Advanced Tips

### Backup Your Backup

1. Go to your Gist on GitHub
2. Click "Raw"
3. Copy all the JSON
4. Save to a file on your computer
5. Now you have a local backup!

### View Your Settings

To see what's stored:

1. Go to your Gist: `https://gist.github.com/yourusername/YOUR_GIST_ID`
2. You'll see all your settings in JSON format
3. You can even edit directly on GitHub!

---

## ❓ FAQ

**Q: Is GitHub Gist free?**  
A: Yes! GitHub Gists are completely free.

**Q: How many devices can I sync?**  
A: Unlimited! Use the same Gist on as many devices as you want.

**Q: What happens if I delete the Gist?**  
A: Your local settings remain, but syncing stops working. Create a new Gist to continue syncing.

**Q: Can I use a public Gist?**  
A: Not recommended. While it works, anyone with the URL can see your settings.

**Q: Does this work offline?**  
A: The app works offline, but syncing requires internet connection.

**Q: Can I share my Gist with another synagogue?**  
A: Yes! Give them your Gist ID and token, and they can use the same settings. Or they can fork your Gist.

---

## 🆘 Still Need Help?

If you're stuck:

1. Check the [troubleshooting section](#-troubleshooting) above
2. Watch the help images in Settings → Help
3. Open an issue on [GitHub](https://github.com/rafiw/synagogue-calendar/issues)
4. Include:
   - What step you're on
   - What error message you see
   - Screenshots if possible

---

## 📸 Visual Guide

The app includes a built-in visual guide:

1. Open the app
2. Go to Settings → General
3. Tap "Setup Help"
4. Follow the step-by-step images

---

[⬅️ Back to Main README](../README.md)
