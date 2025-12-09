/**
 * Netlify Serverless Function - Agent Status
 * Returns the status of all agents in the system
 */

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { agentStates, systemState, simulateActivity } from './shared-state';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
      body: JSON.stringify(Object.values(agentStates)),
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};

export { handler };
