# 🎯 STRIPE WEBHOOK - MANUAL STEPS

## ⚠️ IMPORTANT: You have the WRONG events selected!

Your URL shows these v2 events (WRONG):
- ❌ v2.core.account_person.deleted
- ❌ v2.core.account_person.updated  
- ❌ v2.core.account_person.created
- ❌ v2.core.account_link.returned

## ✅ Step 1: Clear Current Selection

1. Look for "Selected events" showing a number
2. Click on it
3. **UNCHECK ALL** the v2.core events
4. Or click "Clear all" if available

## ✅ Step 2: Search & Select the RIGHT Events

### Event 1: checkout.session.completed
1. In the search box, type: `checkout.session.completed`
2. CHECK the box next to it
3. Clear the search box

### Event 2: payment_intent.succeeded
1. Type: `payment_intent.succeeded`
2. CHECK the box next to it
3. Clear the search box

### Event 3: payment_intent.payment_failed
1. Type: `payment_intent.payment_failed`
2. CHECK the box next to it

## ✅ Step 3: Verify Selection

You should now have **3 events selected** (not 4, not 0, exactly 3)

## ✅ Step 4: Click Continue

The Continue button should be at the bottom of the page

## ✅ Step 5: Configure Endpoint

On the next page, enter:
- **Endpoint URL**: 
  ```
  https://tinyolearn.vercel.app/api/webhook
  ```
- **Description**: TinyOLearn Payment Webhook

## ✅ Step 6: Get Your Secret

After creating:
1. Look for "Signing secret"
2. Click "Reveal" or the eye icon
3. Copy the entire string starting with `whsec_`

Example format:
```
whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

## ✅ Step 7: Add to Vercel

1. Go to: https://vercel.com/dashboard
2. Click on your TinyOLearn project
3. Go to Settings → Environment Variables
4. Click "Add New"
5. Add:
   - **Key**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: [paste your whsec_ string]
   - **Environment**: ✅ Production ✅ Preview ✅ Development
6. Click "Save"

## 🎉 DONE!

Your payment system will now work!

## 🧪 Test It

1. Go to your live site (tinyolearn.vercel.app)
2. Click on Pricing
3. Click "Buy Credits"
4. Should redirect to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`

---

## 🆘 If You're Stuck

The THREE events you need are:
```
checkout.session.completed
payment_intent.succeeded
payment_intent.payment_failed
```

NOT any v2.core events!