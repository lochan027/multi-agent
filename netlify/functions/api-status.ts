/**
 * Netlify Serverless Function - Get System Status
 * Returns current system status and statistics
 */

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { systemState, simulateActivity, addActivity } from './shared-state';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod === 'GET') {
    // Simulate activity if system is running
    if (systemState.running) {
      simulateActivity();
    }
    
    // Calculate uptime
    systemState.stats.uptime = Math.floor((Date.now() - systemState.startTime) / 1000);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        running: systemState.running,
        stats: systemState.stats,
        settings: systemState.settings,
      }),
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      
      // Update system state or settings
      if (body.action === 'start') {
        systemState.running = true;
        addActivity('System', 'System started', 'Multi-agent arbitrage system activated', 'success');
      } else if (body.action === 'stop') {
        systemState.running = false;
        addActivity('System', 'System stopped', 'Multi-agent arbitrage system deactivated', 'info');
      } else if (body.settings) {
        systemState.settings = { ...systemState.settings, ...body.settings };
        addActivity('System', 'Settings updated', 'System configuration changed', 'info');
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, running: systemState.running }),
      };
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request body' }),
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};

export { handler };
