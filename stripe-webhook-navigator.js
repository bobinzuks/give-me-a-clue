#!/usr/bin/env node

// Complete Stripe Webhook Navigation Script
const WebSocket = require('ws');

class StripeWebhookNavigator {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.currentStep = 0;
    this.maxRetries = 3;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('ws://localhost:8765');
      
      this.ws.on('open', () => {
        console.log('✅ Connected to browser extension');
        this.isConnected = true;
        resolve();
      });
      
      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(message);
        } catch (err) {
          console.log('📨 Raw message:', data.toString());
        }
      });
      
      this.ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
        reject(error);
      });
      
      this.ws.on('close', () => {
        console.log('🔌 Connection closed');
        this.isConnected = false;
      });
    });
  }

  handleMessage(message) {
    if (message.type === 'script_result') {
      console.log('📋 Script result:', message.success ? '✅' : '❌');
      if (message.result) {
        console.log('   Result:', message.result);
      }
      if (message.error) {
        console.log('   Error:', message.error);
      }
    } else if (message.type === 'action_result') {
      console.log('🎯 Action result:', message.success ? '✅' : '❌', message.action);
      if (message.elementInfo) {
        console.log('   Element:', message.elementInfo);
      }
    }
  }

  async sendCommand(command) {
    if (!this.isConnected) {
      throw new Error('Not connected to browser');
    }
    
    return new Promise((resolve) => {
      this.ws.send(JSON.stringify(command));
      setTimeout(resolve, 500);
    });
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Step 1: Check if we're on the right page
  async checkCurrentPage() {
    console.log('🔍 Step 1: Checking current page...');
    
    await this.sendCommand({
      action: 'custom_script',
      script: `
        const currentUrl = window.location.href;
        const isWebhooksPage = currentUrl.includes('webhook') || currentUrl.includes('developers');
        const isDashboard = currentUrl.includes('dashboard.stripe.com');
        
        console.log('Current URL:', currentUrl);
        console.log('Is webhooks page:', isWebhooksPage);
        console.log('Is Stripe dashboard:', isDashboard);
        
        const result = {
          url: currentUrl,
          isWebhooksPage,
          isDashboard,
          title: document.title
        };
        
        result;
      `
    });
    
    await this.delay(1000);
  }

  // Step 2: Navigate to webhooks if needed
  async navigateToWebhooks() {
    console.log('🧭 Step 2: Navigating to webhooks section...');
    
    // Look for webhooks navigation
    const webhookNavSelectors = [
      'a[href*="webhook"]',
      'a[href*="developers"]',
      '[data-testid*="webhook"]',
      'nav a:contains("Webhooks")',
      'nav a:contains("Developers")'
    ];
    
    for (const selector of webhookNavSelectors) {
      console.log(`   Trying navigation selector: ${selector}`);
      
      await this.sendCommand({
        action: 'custom_script',
        script: `
          const elements = document.querySelectorAll('${selector.replace(/'/g, "\\'")}');
          console.log('Found navigation elements:', elements.length);
          
          for (let el of elements) {
            console.log('Nav element:', el.textContent, el.href);
            if (el.href && (el.href.includes('webhook') || el.href.includes('developers'))) {
              el.click();
              return true;
            }
          }
          return false;
        `
      });
      
      await this.delay(2000);
    }
    
    // Alternative: Direct navigation
    await this.sendCommand({
      action: 'custom_script',
      script: `
        console.log('Attempting direct navigation to webhooks...');
        window.location.href = 'https://dashboard.stripe.com/webhooks';
        return 'navigation_attempted';
      `
    });
    
    await this.delay(3000);
  }

  // Step 3: Find and click the "Add endpoint" or "Create" button
  async findAndClickAddButton() {
    console.log('🎯 Step 3: Finding and clicking Add/Create button...');
    
    const buttonSelectors = [
      // Specific Stripe webhook button selectors
      '[data-testid*="add-endpoint"]',
      '[data-testid*="create-endpoint"]',
      '[data-testid*="add-webhook"]',
      '[data-testid*="create-webhook"]',
      '[data-testid*="new-endpoint"]',
      
      // Text-based selectors
      'button:contains("Add endpoint")',
      'button:contains("Create endpoint")',
      'button:contains("Add webhook")',
      'button:contains("Create webhook")',
      '[role="button"]:contains("Add endpoint")',
      '[role="button"]:contains("Create endpoint")',
      'a:contains("Add endpoint")',
      'a:contains("Create endpoint")',
      
      // Generic add/create buttons
      'button:contains("Add")',
      'button:contains("Create")',
      'button:contains("New")',
      '[role="button"]:contains("Add")',
      '[role="button"]:contains("Create")',
      '[role="button"]:contains("New")',
      
      // Icon buttons (plus signs)
      'button svg[viewBox="0 0 12 12"]',
      'button svg[viewBox="0 0 16 16"]',
      'button [class*="plus"]',
      'button [data-testid*="plus"]',
      
      // Stripe Button components
      '.Button:contains("Add")',
      '.Button:contains("Create")',
      '.Button[role="button"]',
      
      // Floating action buttons
      '[class*="fab"]',
      '[class*="floating"]',
      '[class*="action-button"]'
    ];
    
    let buttonFound = false;
    
    for (const selector of buttonSelectors) {
      if (buttonFound) break;
      
      console.log(`   Trying button selector: ${selector}`);
      
      // First, check if elements exist
      await this.sendCommand({
        action: 'custom_script',
        script: `
          const elements = document.querySelectorAll('${selector.replace(/'/g, "\\'")}');
          console.log('Found elements for "${selector}":', elements.length);
          
          if (elements.length > 0) {
            elements.forEach((el, i) => {
              console.log('Element', i, ':', {
                tag: el.tagName,
                text: el.textContent?.substring(0, 50),
                class: el.className?.substring(0, 50),
                role: el.getAttribute('role'),
                testid: el.getAttribute('data-testid'),
                href: el.href
              });
              
              // Highlight the element
              el.style.outline = '3px solid red';
              el.style.outlineOffset = '2px';
            });
          }
          
          return elements.length;
        `
      });
      
      await this.delay(1000);
      
      // Try enhanced click on the selector
      await this.sendCommand({
        action: 'enhanced_click',
        selector: selector
      });
      
      await this.delay(2000);
      
      // Check if we successfully navigated to webhook creation page
      const success = await this.sendCommand({
        action: 'custom_script',
        script: `
          const currentUrl = window.location.href;
          const hasModal = document.querySelector('[role="dialog"], .modal, [class*="Modal"]');
          const isCreatePage = currentUrl.includes('create') || currentUrl.includes('new');
          const hasForm = document.querySelector('form, [role="form"]');
          
          const success = hasModal || isCreatePage || hasForm;
          
          console.log('Click success check:', {
            currentUrl,
            hasModal: !!hasModal,
            isCreatePage,
            hasForm: !!hasForm,
            success
          });
          
          return success;
        `
      });
      
      if (success) {
        console.log(`✅ Successfully found and clicked button with selector: ${selector}`);
        buttonFound = true;
        break;
      }
    }
    
    return buttonFound;
  }

  // Step 4: Fill in webhook form
  async fillWebhookForm(webhookUrl = 'https://your-app.com/webhook', events = ['payment_intent.succeeded']) {
    console.log('📝 Step 4: Filling webhook form...');
    
    // Look for URL input field
    const urlSelectors = [
      'input[name*="url"]',
      'input[placeholder*="url"]',
      'input[placeholder*="endpoint"]',
      'input[type="url"]',
      '[data-testid*="url"]',
      '[data-testid*="endpoint"]'
    ];
    
    for (const selector of urlSelectors) {
      console.log(`   Trying URL input selector: ${selector}`);
      
      await this.sendCommand({
        action: 'type',
        selector: selector,
        text: webhookUrl
      });
      
      await this.delay(500);
    }
    
    // Look for event selection
    console.log('   Looking for event selection...');
    
    await this.sendCommand({
      action: 'custom_script',
      script: `
        // Look for checkboxes or select elements for events
        const eventElements = document.querySelectorAll(
          'input[type="checkbox"], select, [role="checkbox"], [role="listbox"]'
        );
        
        console.log('Found event selection elements:', eventElements.length);
        
        eventElements.forEach((el, i) => {
          console.log('Event element', i, ':', {
            type: el.type,
            name: el.name,
            value: el.value,
            text: el.textContent?.substring(0, 50)
          });
        });
        
        // Try to select payment_intent.succeeded
        const paymentIntentElements = Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent && el.textContent.includes('payment_intent.succeeded')
        );
        
        console.log('Payment intent elements:', paymentIntentElements.length);
        
        paymentIntentElements.forEach(el => {
          if (el.type === 'checkbox' || el.getAttribute('role') === 'checkbox') {
            el.click();
            console.log('Clicked payment intent checkbox');
          }
        });
        
        return {
          eventElements: eventElements.length,
          paymentIntentElements: paymentIntentElements.length
        };
      `
    });
    
    await this.delay(2000);
  }

  // Step 5: Submit the form
  async submitForm() {
    console.log('🚀 Step 5: Submitting form...');
    
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:contains("Create")',
      'button:contains("Add")',
      'button:contains("Save")',
      '[role="button"]:contains("Create")',
      '[role="button"]:contains("Add")',
      '[role="button"]:contains("Save")',
      '.Button:contains("Create")',
      '.Button:contains("Add")',
      '.Button:contains("Save")',
      '[data-testid*="submit"]',
      '[data-testid*="create"]',
      '[data-testid*="save"]'
    ];
    
    for (const selector of submitSelectors) {
      console.log(`   Trying submit selector: ${selector}`);
      
      await this.sendCommand({
        action: 'enhanced_click',
        selector: selector
      });
      
      await this.delay(1000);
      
      // Check if form was submitted successfully
      const success = await this.sendCommand({
        action: 'custom_script',
        script: `
          const currentUrl = window.location.href;
          const hasSuccessMessage = document.querySelector('[class*="success"], [class*="Success"]');
          const isListPage = currentUrl.includes('webhooks') && !currentUrl.includes('create');
          
          const success = hasSuccessMessage || isListPage;
          
          console.log('Submit success check:', {
            currentUrl,
            hasSuccessMessage: !!hasSuccessMessage,
            isListPage,
            success
          });
          
          return success;
        `
      });
      
      if (success) {
        console.log(`✅ Form submitted successfully with selector: ${selector}`);
        return true;
      }
    }
    
    return false;
  }

  // Main navigation flow
  async navigateToWebhookCreation(webhookUrl, events) {
    console.log('🚀 Starting Stripe Webhook Navigation');
    console.log('===================================\n');
    
    try {
      // Step 1: Check current page
      await this.checkCurrentPage();
      
      // Step 2: Navigate to webhooks if needed
      await this.navigateToWebhooks();
      
      // Step 3: Find and click Add button
      const buttonFound = await this.findAndClickAddButton();
      
      if (buttonFound) {
        // Step 4: Fill form if provided
        if (webhookUrl) {
          await this.fillWebhookForm(webhookUrl, events);
          
          // Step 5: Submit form
          await this.submitForm();
        }
        
        console.log('\n✅ Webhook navigation completed successfully!');
      } else {
        console.log('\n❌ Could not find Add/Create button');
        console.log('You may need to manually click the button or check if you have permissions');
      }
      
    } catch (error) {
      console.error('❌ Navigation error:', error.message);
    }
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Command line usage
async function main() {
  const navigator = new StripeWebhookNavigator();
  
  try {
    await navigator.connect();
    
    // Get command line arguments
    const webhookUrl = process.argv[2] || 'https://your-app.com/webhook';
    const events = process.argv[3] ? process.argv[3].split(',') : ['payment_intent.succeeded'];
    
    console.log('📋 Configuration:');
    console.log('   Webhook URL:', webhookUrl);
    console.log('   Events:', events.join(', '));
    console.log('');
    
    await navigator.navigateToWebhookCreation(webhookUrl, events);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await navigator.delay(3000);
    await navigator.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { StripeWebhookNavigator };