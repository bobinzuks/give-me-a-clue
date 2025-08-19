#!/usr/bin/env node

// Direct Stripe Webhook Event Selector Script
// Copy and paste this into the browser console on Stripe's webhook page

console.log('🚀 Stripe Webhook Event Selector');
console.log('==================================');

// The events we need for TinyOLearn
const requiredEvents = [
  'checkout.session.completed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed'
];

// Function to select events
function selectTinyOLearnEvents() {
  // First, uncheck all events
  document.querySelectorAll('input[type="checkbox"][name*="event"]').forEach(cb => {
    cb.checked = false;
  });
  
  let selected = 0;
  
  // Select our required events
  requiredEvents.forEach(eventName => {
    // Try different selector strategies
    const checkbox = 
      document.querySelector(`input[value="${eventName}"]`) ||
      document.querySelector(`input[id*="${eventName}"]`) ||
      document.querySelector(`label:contains("${eventName}") input[type="checkbox"]`);
    
    if (checkbox) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✅ Selected: ${eventName}`);
      selected++;
    } else {
      console.log(`❌ Could not find: ${eventName}`);
      console.log(`   Try searching for "${eventName}" in the search box`);
    }
  });
  
  console.log(`\n📊 Selected ${selected}/${requiredEvents.length} events`);
  
  if (selected === requiredEvents.length) {
    console.log('✅ All events selected! Click Continue to proceed.');
  } else {
    console.log('⚠️ Some events could not be found automatically.');
    console.log('Please search and select them manually.');
  }
}

// Run the selector
selectTinyOLearnEvents();

// Also output instructions
console.log('\n📝 Next Steps:');
console.log('1. Verify 3 events are selected');
console.log('2. Click "Continue"');
console.log('3. Enter endpoint URL: https://tinyolearn.vercel.app/api/webhook');
console.log('4. Copy the webhook secret (starts with whsec_)');
console.log('5. Add to Vercel environment variables');