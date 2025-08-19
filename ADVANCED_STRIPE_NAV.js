#!/usr/bin/env node

// Advanced Stripe Navigation with Dynamic Detection
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

class StripeNavigator {
  constructor() {
    this.ws = null;
    this.connected = false;
  }

  async connect() {
    return new Promise((resolve) => {
      this.ws = new WebSocket('ws://localhost:8765');
      
      this.ws.on('open', () => {
        this.connected = true;
        console.log('✅ Connected to browser');
        resolve();
      });
      
      this.ws.on('error', (err) => {
        console.error('❌ Connection error:', err.message);
        resolve();
      });
    });
  }

  async send(command) {
    if (!this.connected) await this.connect();
    
    return new Promise((resolve) => {
      console.log(`➡️ ${command.action}: ${command.selector || ''}`);
      this.ws.send(JSON.stringify(command));
      setTimeout(resolve, 1000);
    });
  }

  async detectPage() {
    console.log('\n🔍 Detecting current page...');
    await this.send({ action: 'scrape' });
    await this.send({ action: 'screenshot' });
    
    // Check latest page info
    const dataDir = path.join(__dirname, 'firefox-extension', 'server', 'data');
    const files = fs.readdirSync(dataDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length > 0) {
      const latest = JSON.parse(fs.readFileSync(path.join(dataDir, files[0])));
      console.log(`📄 Current URL: ${latest.url}`);
      return latest.url;
    }
    return null;
  }

  async navigateToWebhooks() {
    const currentUrl = await this.detectPage();
    
    if (currentUrl?.includes('/webhooks/create')) {
      console.log('✅ Already on webhook creation page!');
      return 'create';
    } else if (currentUrl?.includes('/webhooks')) {
      console.log('📍 On webhooks list page');
      return 'list';
    } else {
      console.log('❓ Not on webhooks page');
      return 'unknown';
    }
  }

  async fillWebhookForm() {
    console.log('\n📝 Filling webhook form...\n');
    
    // Try multiple selector strategies
    const strategies = [
      // Strategy 1: Standard form inputs
      {
        url: ['input[name="url"]', 'input[type="url"]', 'input[placeholder*="https"]'],
        desc: ['textarea[name="description"]', 'input[name="description"]']
      },
      // Strategy 2: React/data attributes
      {
        url: ['[data-testid*="url"]', '[data-test*="endpoint"]'],
        desc: ['[data-testid*="description"]']
      },
      // Strategy 3: Aria labels
      {
        url: ['[aria-label*="endpoint"]', '[aria-label*="URL"]'],
        desc: ['[aria-label*="description"]']
      }
    ];
    
    // Try each strategy
    for (const [i, strategy] of strategies.entries()) {
      console.log(`Trying strategy ${i + 1}...`);
      
      for (const selector of strategy.url) {
        await this.send({
          action: 'highlight',
          selector: selector,
          color: 'green'
        });
        
        await this.send({
          action: 'type',
          selector: selector,
          text: 'https://tinyolearn.vercel.app/api/webhook'
        });
      }
      
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  async selectEvents() {
    console.log('\n📋 Selecting events...\n');
    
    const events = [
      'checkout.session.completed',
      'payment_intent.succeeded',
      'payment_intent.payment_failed'
    ];
    
    // First try to open event selector
    const eventSelectors = [
      'button:contains("Select events")',
      '[aria-label*="Select events"]',
      'button:contains("Choose events")',
      '.event-selector'
    ];
    
    for (const selector of eventSelectors) {
      await this.send({ action: 'click', selector });
    }
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Now select each event
    for (const event of events) {
      console.log(`Selecting: ${event}`);
      
      // Search for event
      await this.send({ action: 'click', selector: 'input[type="search"]' });
      await this.send({ action: 'clear' });
      await this.send({ action: 'type', selector: 'input[type="search"]', text: event });
      
      await new Promise(r => setTimeout(r, 1500));
      
      // Multiple ways to click checkbox
      await this.send({ action: 'click', selector: `input[value="${event}"]` });
      await this.send({ action: 'click', selector: `label:contains("${event}")` });
      await this.send({ action: 'click', selector: `[data-testid="${event}"]` });
      
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  async findAndClickButton(buttonTexts) {
    console.log('\n🔘 Finding submit button...\n');
    
    const selectors = [];
    for (const text of buttonTexts) {
      selectors.push(
        `button:contains("${text}")`,
        `a:contains("${text}")`,
        `[aria-label*="${text}"]`,
        `button[type="submit"]:contains("${text}")`
      );
    }
    
    for (const selector of selectors) {
      await this.send({
        action: 'highlight',
        selector: selector,
        color: 'yellow'
      });
    }
  }

  async close() {
    if (this.ws) {
      this.ws.close();
      this.connected = false;
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 ADVANCED STRIPE WEBHOOK SETUP');
  console.log('=================================\n');
  
  const nav = new StripeNavigator();
  
  try {
    await nav.connect();
    
    const pageType = await nav.navigateToWebhooks();
    
    if (pageType === 'list') {
      console.log('\n📍 Looking for "Add endpoint" or "Create" button...');
      await nav.findAndClickButton(['Add endpoint', 'Create', 'New endpoint', 'Add']);
      console.log('\n⏰ Click the highlighted button to go to creation page');
      console.log('Then run this script again!');
    } else if (pageType === 'create') {
      console.log('\n✅ On creation page! Filling form...');
      await nav.fillWebhookForm();
      await nav.selectEvents();
      await nav.findAndClickButton(['Add endpoint', 'Create', 'Save']);
      console.log('\n✅ Form filled! Click the highlighted button to save.');
    } else {
      console.log('\n❓ Please navigate to one of these URLs:');
      console.log('  • https://dashboard.stripe.com/webhooks');
      console.log('  • https://dashboard.stripe.com/test/webhooks');
      console.log('  • https://dashboard.stripe.com/workbench/webhooks');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await nav.close();
  }
}

main();