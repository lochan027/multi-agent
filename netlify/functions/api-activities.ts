/**
 * Netlify Serverless Function - Activity Log
 * Returns recent system activities
 */

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { activityLog, addActivity, systemState } from './shared-state';

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
    // If activity log is empty, add some initial activities
    if (activityLog.length === 0) {
      addActivity('System', 'System initialized', 'Multi-agent arbitrage system ready', 'info');
      
      if (systemState.running) {
        addActivity('ScannerAgent', 'Agent activated', 'Scanner agent is now monitoring markets', 'success');
        addActivity('RiskAgent', 'Agent activated', 'Risk assessment agent is ready', 'success');
        addActivity('ExecutorAgent', 'Agent activated', 'Execution agent standing by', 'success');
      }
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(activityLog.slice(0, 30)), // Return last 30 activities
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};

export { handler };
