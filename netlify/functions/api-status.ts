/**
 * Netlify Serverless Function - Get System Status
 * Returns current system status and statistics
 */

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// In-memory state (Note: This resets on cold starts, consider using a database for production)
const systemState = {
  running: false,
  stats: {
    totalScans: 0,
    opportunitiesDetected: 0,
    opportunitiesApproved: 0,
    executionsAttempted: 0,
    executionsSuccessful: 0,
    totalProfit: 0,
    successRate: 0,
    uptime: 0,
  },
  settings: {
    scanInterval: 30,
    minProfitUSD: 1.0,
    maxSlippage: 1.0,
    requireApproval: true,
  },
  startTime: Date.now(),
};

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
      } else if (body.action === 'stop') {
        systemState.running = false;
      } else if (body.settings) {
        systemState.settings = { ...systemState.settings, ...body.settings };
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
