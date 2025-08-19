#!/bin/bash
# GUIDED STRIPE WEBHOOK SETUP
# This will highlight and help you select the right events

cd /home/terry/Desktop/give-me-a-clue

echo "🎯 GUIDED STRIPE WEBHOOK SETUP"
echo "==============================="
echo ""

echo "📍 Step 1: Highlighting the search box..."
node send-command.js highlight 'input[type="search"]' green
sleep 2

echo "📍 Step 2: Typing first event name..."
node send-command.js type 'input[type="search"]' "checkout.session.completed"
sleep 2

echo "📍 Step 3: Highlighting the checkbox for checkout.session.completed..."
node send-command.js highlight 'label:has(input[value="checkout.session.completed"])' green
node send-command.js highlight 'input[value="checkout.session.completed"]' green
sleep 2

echo "📍 Step 4: Clicking the checkbox..."
node send-command.js click 'input[value="checkout.session.completed"]'
sleep 3

echo "📍 Step 5: Clearing search and adding second event..."
node send-command.js clear
node send-command.js click 'input[type="search"]'
node send-command.js type 'input[type="search"]' "payment_intent.succeeded"
sleep 2

echo "📍 Step 6: Clicking payment_intent.succeeded..."
node send-command.js click 'input[value="payment_intent.succeeded"]'
sleep 3

echo "📍 Step 7: Adding third event..."
node send-command.js clear
node send-command.js click 'input[type="search"]'
node send-command.js type 'input[type="search"]' "payment_intent.payment_failed"
sleep 2

echo "📍 Step 8: Clicking payment_intent.payment_failed..."
node send-command.js click 'input[value="payment_intent.payment_failed"]'
sleep 2

echo "📍 Step 9: Highlighting the Continue button..."
node send-command.js highlight 'button:has-text("Continue")' yellow
node send-command.js highlight 'button[type="submit"]' yellow
sleep 2

echo ""
echo "✅ EVENTS SELECTED!"
echo ""
echo "Now you need to:"
echo "1. Click the Continue button (highlighted in yellow)"
echo "2. Enter URL: https://tinyolearn.vercel.app/api/webhook"
echo "3. Copy the webhook secret (whsec_...)"
echo "4. Add to Vercel environment variables"
echo ""
echo "This guided navigation tool can be used for:"
echo "- Form filling"
echo "- Testing workflows"
echo "- Documentation"
echo "- Training"
echo "- Accessibility"