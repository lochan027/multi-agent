/**
 * Netlify Serverless Function - Agent Status
 * Returns the status of all agents in the system
 */

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const agentStatuses = {
  ScannerAgent: {
    name: 'ScannerAgent',
    status: 'idle',
    lastActivity: Date.now(),
    tasksProcessed: 0,
  },
  RiskAgent: {
    name: 'RiskAgent',
    status: 'idle',
    lastActivity: Date.now(),
    tasksProcessed: 0,
  },
  ExecutorAgent: {
    name: 'ExecutorAgent',
    status: 'idle',
    lastActivity: Date.now(),
    tasksProcessed: 0,
  },
};

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
    // Update last activity for active agents (simulate)
    const now = Date.now();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(Object.values(agentStatuses)),
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};

export { handler };
