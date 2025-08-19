# 🚀 Stripe Webhook Setup Helper

## ✅ Current Status
- WebSocket server is running on port 8765
- Navigation scripts are ready

## 📋 Manual Steps Needed in Firefox

### 1. Load the Extension
1. Open Firefox
2. Type `about:debugging` in the address bar
3. Click "This Firefox" 
4. Click "Load Temporary Add-on"
5. Navigate to `/home/terry/Desktop/give-me-a-clue/firefox-extension/`
6. Select `manifest.json`

### 2. Connect Extension to Server
1. You should see a new icon in Firefox toolbar (CC icon)
2. Click the icon
3. Click "Connect to Claude Code"
4. Status should show "Connected"

### 3. Navigate to Stripe Webhook Page
Go to: https://dashboard.stripe.com/workbench/webhooks/create

## 🎯 Events to Select

You need to select EXACTLY these 3 events:

### ✅ Required Events:
1. **checkout.session.completed** (MOST IMPORTANT)
2. **payment_intent.succeeded**
3. **payment_intent.payment_failed**

### ❌ Remove These (if selected):
- v2.core.account_person.deleted
- v2.core.account_person.updated
- v2.core.account_person.created
- v2.core.account_link.returned

## 🔧 How to Select Events

1. Click "Selected events" (not "All events")
2. In the search box, type: `checkout.session`
3. Check the box for `checkout.session.completed`
4. Clear search, type: `payment_intent.succeeded`
5. Check that box
6. Clear search, type: `payment_intent.payment_failed`  
7. Check that box
8. You should have 3 events selected
9. Click "Continue"

## 📝 Configure Endpoint

On the next page:
- **Endpoint URL**: `https://tinyolearn.vercel.app/api/webhook`
- **Description**: TinyOLearn Payment Webhook

## 🔑 Get Your Webhook Secret

After creating the endpoint:
1. You'll see "Signing secret" 
2. Click "Reveal"
3. Copy the entire string (starts with `whsec_`)

## 🚀 Add to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your TinyOLearn project
3. Go to Settings → Environment Variables
4. Add new variable:
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_xxxxx` (paste your secret)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

## ✅ Test Your Setup

Once added to Vercel:
1. Go to your live site
2. Navigate to Pricing page
3. Click "Buy Credits"
4. Should redirect to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`

## 🎉 Success!
Your TinyOLearn payment system is now fully configured!