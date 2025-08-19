#!/bin/bash
# STRIPE WEBHOOK SETUP NAVIGATION COMMANDS
# The extension IS connected - run these commands!

cd /home/terry/Desktop/give-me-a-clue

echo "📍 Step 1: Navigate to Webhooks page"
echo "Go to: https://dashboard.stripe.com/webhooks"
echo "Or click Developers → Webhooks in Stripe menu"
read -p "Press Enter when on Webhooks page..."

echo "📍 Step 2: Click Add Endpoint"
node navigate-stripe.js highlight 'button:contains("Add endpoint")' green
node navigate-stripe.js click 'button:contains("Add endpoint")'
read -p "Press Enter when on Create Webhook page..."

echo "📍 Step 3: Clear any selected events"
# Uncheck wrong events if selected
node navigate-stripe.js click 'input[value="v2.core.account_person.deleted"]'
node navigate-stripe.js click 'input[value="v2.core.account_person.updated"]'
node navigate-stripe.js click 'input[value="v2.core.account_person.created"]'

echo "📍 Step 4: Select the RIGHT events"
# Select checkout.session.completed
node navigate-stripe.js type 'input[type="search"]' "checkout.session.completed"
sleep 1
node navigate-stripe.js click 'input[value="checkout.session.completed"]'

# Select payment_intent.succeeded
node navigate-stripe.js clear
node navigate-stripe.js type 'input[type="search"]' "payment_intent.succeeded"
sleep 1
node navigate-stripe.js click 'input[value="payment_intent.succeeded"]'

# Select payment_intent.payment_failed
node navigate-stripe.js clear
node navigate-stripe.js type 'input[type="search"]' "payment_intent.payment_failed"
sleep 1
node navigate-stripe.js click 'input[value="payment_intent.payment_failed"]'

echo "✅ Events selected! Now:"
echo "1. Click Continue"
echo "2. Enter URL: https://tinyolearn.vercel.app/api/webhook"
echo "3. Copy the webhook secret (whsec_...)"
echo "4. Add to Vercel environment variables"