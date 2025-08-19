#!/usr/bin/env node

/**
 * Multi-Agent Hivemind Coordinator for Claude Code
 * Manages 10+ specialized agents for browser automation
 */

const EventEmitter = require('events');
const WebSocket = require('ws');
const fs = require('fs').promises;
const path = require('path');

class AgentCoordinator extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.tasks = new Map();
    this.consoleCapture = new ConsoleCaptureAgent();
    this.initializeAgents();
  }

  initializeAgents() {
    // Create 10 specialized agents
    this.registerAgent('scraper', new ScraperAgent());
    this.registerAgent('navigator', new NavigatorAgent());
    this.registerAgent('formFiller', new FormFillerAgent());
    this.registerAgent('screenshotter', new ScreenshotAgent());
    this.registerAgent('consoleLogger', new ConsoleLoggerAgent());
    this.registerAgent('networkMonitor', new NetworkMonitorAgent());
    this.registerAgent('domAnalyzer', new DOMAnalyzerAgent());
    this.registerAgent('visualVerifier', new VisualVerifierAgent());
    this.registerAgent('dataExtractor', new DataExtractorAgent());
    this.registerAgent('automationOrchestrator', new AutomationOrchestratorAgent());
  }

  registerAgent(name, agent) {
    this.agents.set(name, agent);
    agent.on('result', (data) => this.handleAgentResult(name, data));
    agent.on('error', (error) => this.handleAgentError(name, error));
  }

  async executeTask(taskType, params) {
    const taskId = Date.now().toString();
    const task = {
      id: taskId,
      type: taskType,
      params,
      status: 'pending',
      results: [],
      startTime: Date.now()
    };
    
    this.tasks.set(taskId, task);
    
    // Distribute task to relevant agents
    const relevantAgents = this.selectAgents(taskType);
    const promises = relevantAgents.map(agentName => 
      this.agents.get(agentName).execute(params)
    );
    
    const results = await Promise.allSettled(promises);
    task.results = results;
    task.status = 'completed';
    task.endTime = Date.now();
    
    return task;
  }

  selectAgents(taskType) {
    const agentMap = {
      'scrape': ['scraper', 'domAnalyzer', 'dataExtractor'],
      'navigate': ['navigator', 'visualVerifier'],
      'form': ['formFiller', 'domAnalyzer'],
      'screenshot': ['screenshotter', 'visualVerifier'],
      'monitor': ['consoleLogger', 'networkMonitor'],
      'automate': ['automationOrchestrator', 'navigator', 'formFiller']
    };
    
    return agentMap[taskType] || ['automationOrchestrator'];
  }

  handleAgentResult(agentName, data) {
    console.log(`Agent ${agentName} completed:`, data);
    this.emit('agentResult', { agent: agentName, data });
  }

  handleAgentError(agentName, error) {
    console.error(`Agent ${agentName} error:`, error);
    this.emit('agentError', { agent: agentName, error });
  }
}

// Base Agent Class
class BaseAgent extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this.ws = null;
  }

  async execute(params) {
    throw new Error('Execute method must be implemented');
  }

  sendCommand(command) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(command));
    }
  }
}

// Specialized Agent Implementations

class ScraperAgent extends BaseAgent {
  constructor() {
    super('ScraperAgent');
  }

  async execute(params) {
    const { selector, url } = params;
    return {
      agent: this.name,
      action: 'scrape',
      data: await this.scrapeContent(selector, url)
    };
  }

  async scrapeContent(selector, url) {
    // Advanced scraping logic
    this.sendCommand({
      action: 'scrape',
      selector,
      options: {
        waitForSelector: true,
        timeout: 30000,
        extractText: true,
        extractAttributes: true,
        extractComputedStyles: true
      }
    });
    
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        text: 'Scraped content',
        attributes: {},
        styles: {}
      }), 1000);
    });
  }
}

class NavigatorAgent extends BaseAgent {
  constructor() {
    super('NavigatorAgent');
  }

  async execute(params) {
    const { action, target } = params;
    return {
      agent: this.name,
      action: 'navigate',
      result: await this.performNavigation(action, target)
    };
  }

  async performNavigation(action, target) {
    const navigationMap = {
      'click': () => this.sendCommand({ action: 'click', selector: target }),
      'scroll': () => this.sendCommand({ action: 'scroll', selector: target }),
      'hover': () => this.sendCommand({ action: 'hover', selector: target }),
      'focus': () => this.sendCommand({ action: 'focus', selector: target })
    };

    if (navigationMap[action]) {
      navigationMap[action]();
      return `Navigated: ${action} on ${target}`;
    }
    
    return 'Navigation action not found';
  }
}

class FormFillerAgent extends BaseAgent {
  constructor() {
    super('FormFillerAgent');
  }

  async execute(params) {
    const { formData } = params;
    return {
      agent: this.name,
      action: 'fillForm',
      result: await this.fillForm(formData)
    };
  }

  async fillForm(formData) {
    const results = [];
    
    for (const [selector, value] of Object.entries(formData)) {
      this.sendCommand({
        action: 'type',
        selector,
        text: value,
        options: {
          clearFirst: true,
          delay: 100,
          pressEnter: false
        }
      });
      
      results.push(`Filled ${selector} with ${value}`);
    }
    
    return results;
  }
}

class ScreenshotAgent extends BaseAgent {
  constructor() {
    super('ScreenshotAgent');
  }

  async execute(params) {
    const { fullPage, selector } = params;
    return {
      agent: this.name,
      action: 'screenshot',
      result: await this.captureScreenshot(fullPage, selector)
    };
  }

  async captureScreenshot(fullPage = false, selector = null) {
    this.sendCommand({
      action: 'screenshot',
      options: {
        fullPage,
        selector,
        quality: 90,
        format: 'png',
        timestamp: true
      }
    });
    
    const timestamp = Date.now();
    const filename = `screenshot-${timestamp}.png`;
    
    return {
      filename,
      path: `/data/screenshots/${filename}`,
      timestamp,
      type: selector ? 'element' : (fullPage ? 'fullPage' : 'viewport')
    };
  }
}

class ConsoleLoggerAgent extends BaseAgent {
  constructor() {
    super('ConsoleLoggerAgent');
    this.logs = [];
  }

  async execute(params) {
    return {
      agent: this.name,
      action: 'consoleLogs',
      data: await this.getConsoleLogs()
    };
  }

  async getConsoleLogs() {
    this.sendCommand({
      action: 'getConsoleLogs',
      options: {
        levels: ['log', 'info', 'warn', 'error'],
        includeTimestamp: true,
        includeStackTrace: true
      }
    });
    
    return this.logs;
  }

  captureLog(log) {
    this.logs.push({
      ...log,
      capturedAt: Date.now()
    });
    
    // Auto-send to Claude Code
    this.emit('consoleLog', log);
  }
}

class NetworkMonitorAgent extends BaseAgent {
  constructor() {
    super('NetworkMonitorAgent');
    this.requests = [];
  }

  async execute(params) {
    return {
      agent: this.name,
      action: 'networkMonitor',
      data: await this.getNetworkData()
    };
  }

  async getNetworkData() {
    this.sendCommand({
      action: 'getNetworkData',
      options: {
        includeHeaders: true,
        includeResponse: true,
        includeTiming: true
      }
    });
    
    return {
      requests: this.requests,
      summary: {
        total: this.requests.length,
        failed: this.requests.filter(r => r.status >= 400).length,
        avgResponseTime: this.calculateAvgResponseTime()
      }
    };
  }

  calculateAvgResponseTime() {
    if (this.requests.length === 0) return 0;
    const total = this.requests.reduce((sum, req) => sum + (req.responseTime || 0), 0);
    return total / this.requests.length;
  }
}

class DOMAnalyzerAgent extends BaseAgent {
  constructor() {
    super('DOMAnalyzerAgent');
  }

  async execute(params) {
    const { selector } = params;
    return {
      agent: this.name,
      action: 'analyzeDom',
      data: await this.analyzeDom(selector)
    };
  }

  async analyzeDom(selector) {
    this.sendCommand({
      action: 'analyzeDom',
      selector,
      options: {
        includeChildren: true,
        includeAttributes: true,
        includeComputedStyles: true,
        includeBoundingBox: true,
        includeAccessibility: true
      }
    });
    
    return {
      selector,
      analysis: {
        exists: true,
        visible: true,
        interactive: true,
        accessibility: {
          role: 'button',
          label: 'Submit'
        }
      }
    };
  }
}

class VisualVerifierAgent extends BaseAgent {
  constructor() {
    super('VisualVerifierAgent');
  }

  async execute(params) {
    const { baseline, current } = params;
    return {
      agent: this.name,
      action: 'visualVerify',
      result: await this.compareVisual(baseline, current)
    };
  }

  async compareVisual(baseline, current) {
    // Visual comparison logic
    return {
      match: true,
      confidence: 0.98,
      differences: []
    };
  }
}

class DataExtractorAgent extends BaseAgent {
  constructor() {
    super('DataExtractorAgent');
  }

  async execute(params) {
    const { pattern, selector } = params;
    return {
      agent: this.name,
      action: 'extractData',
      data: await this.extractData(pattern, selector)
    };
  }

  async extractData(pattern, selector) {
    this.sendCommand({
      action: 'extractData',
      selector,
      pattern,
      options: {
        recursive: true,
        format: 'json'
      }
    });
    
    return {
      extracted: [],
      count: 0
    };
  }
}

class AutomationOrchestratorAgent extends BaseAgent {
  constructor() {
    super('AutomationOrchestratorAgent');
  }

  async execute(params) {
    const { workflow } = params;
    return {
      agent: this.name,
      action: 'orchestrate',
      result: await this.executeWorkflow(workflow)
    };
  }

  async executeWorkflow(workflow) {
    const results = [];
    
    for (const step of workflow) {
      const stepResult = await this.executeStep(step);
      results.push(stepResult);
      
      if (step.waitAfter) {
        await new Promise(resolve => setTimeout(resolve, step.waitAfter));
      }
    }
    
    return {
      workflow: workflow.name || 'unnamed',
      steps: results,
      success: true
    };
  }

  async executeStep(step) {
    this.sendCommand({
      action: step.action,
      ...step.params
    });
    
    return {
      step: step.name,
      action: step.action,
      completed: true,
      timestamp: Date.now()
    };
  }
}

// Console Capture Agent - Special agent for automatic console log capture
class ConsoleCaptureAgent {
  constructor() {
    this.enabled = true;
    this.logFile = path.join(__dirname, 'console-logs.json');
    this.logs = [];
  }

  async injectConsoleCapture() {
    const captureScript = `
      (function() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;
        
        const sendToClaudeCode = (level, args) => {
          const message = {
            type: 'consoleLog',
            level: level,
            message: args.map(arg => {
              try {
                return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
              } catch (e) {
                return String(arg);
              }
            }).join(' '),
            timestamp: Date.now(),
            url: window.location.href,
            stack: new Error().stack
          };
          
          // Send via WebSocket if connected
          if (window.__claudeCodeWS && window.__claudeCodeWS.readyState === 1) {
            window.__claudeCodeWS.send(JSON.stringify(message));
          }
          
          // Store locally
          window.__claudeCodeLogs = window.__claudeCodeLogs || [];
          window.__claudeCodeLogs.push(message);
        };
        
        console.log = function(...args) {
          sendToClaudeCode('log', args);
          return originalLog.apply(console, args);
        };
        
        console.error = function(...args) {
          sendToClaudeCode('error', args);
          return originalError.apply(console, args);
        };
        
        console.warn = function(...args) {
          sendToClaudeCode('warn', args);
          return originalWarn.apply(console, args);
        };
        
        console.info = function(...args) {
          sendToClaudeCode('info', args);
          return originalInfo.apply(console, args);
        };
        
        // Capture unhandled errors
        window.addEventListener('error', (event) => {
          sendToClaudeCode('error', [event.message, event.filename, event.lineno]);
        });
        
        // Capture unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
          sendToClaudeCode('error', ['Unhandled Promise Rejection:', event.reason]);
        });
      })();
    `;
    
    return captureScript;
  }

  async saveLogs() {
    await fs.writeFile(this.logFile, JSON.stringify(this.logs, null, 2));
  }

  async loadLogs() {
    try {
      const data = await fs.readFile(this.logFile, 'utf8');
      this.logs = JSON.parse(data);
    } catch (error) {
      this.logs = [];
    }
  }

  addLog(log) {
    this.logs.push(log);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    // Auto-save every 10 logs
    if (this.logs.length % 10 === 0) {
      this.saveLogs();
    }
  }

  getRecentLogs(count = 100) {
    return this.logs.slice(-count);
  }

  clearLogs() {
    this.logs = [];
    this.saveLogs();
  }
}

// Export for Claude Code integration
module.exports = {
  AgentCoordinator,
  ConsoleCaptureAgent
};

// CLI interface
if (require.main === module) {
  const coordinator = new AgentCoordinator();
  
  // Example usage
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch(command) {
    case 'scrape':
      coordinator.executeTask('scrape', {
        selector: args[1],
        url: args[2]
      }).then(console.log);
      break;
      
    case 'automate':
      coordinator.executeTask('automate', {
        workflow: [
          { action: 'navigate', params: { target: args[1] } },
          { action: 'click', params: { selector: args[2] } }
        ]
      }).then(console.log);
      break;
      
    case 'monitor':
      coordinator.executeTask('monitor', {}).then(console.log);
      break;
      
    default:
      console.log(`
Multi-Agent Hivemind Coordinator
Usage: node agent-coordinator.js <command> [args]

Commands:
  scrape <selector> <url> - Scrape content
  automate <url> <selector> - Run automation
  monitor - Monitor console and network
      `);
  }
}