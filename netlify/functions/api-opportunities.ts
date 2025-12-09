/**
 * Netlify Serverless Function - Get Arbitrage Opportunities
 * Returns current arbitrage opportunities detected by the scanner
 */

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { opportunities, systemState, simulateActivity } from './shared-state';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    // Simulate activity if system is running
    if (systemState.running) {
      simulateActivity();
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(opportunities.slice(0, 20)),
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      
      if (body.action === 'approve' && body.opportunityId) {
        const idx = opportunities.findIndex(o => o.id === body.opportunityId);
        if (idx !== -1) {
          opportunities[idx].status = 'approved';
          systemState.stats.opportunitiesApproved++;
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, opportunityId: body.opportunityId }),
        };
      }

      if (body.action === 'reject' && body.opportunityId) {
        const idx = opportunities.findIndex(o => o.id === body.opportunityId);
        if (idx !== -1) {
          opportunities[idx].status = 'rejected';
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, opportunityId: body.opportunityId }),
        };
      }

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid action' }),
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
