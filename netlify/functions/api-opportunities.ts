/**
 * Netlify Serverless Function - Get Arbitrage Opportunities
 * Returns current arbitrage opportunities detected by the scanner
 */

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// In-memory opportunities store
const opportunities = new Map<string, any>();

// Ethereum mainnet token pairs for demo/scanning
const ETH_TOKEN_PAIRS = [
  { tokenA: 'WETH', tokenB: 'USDC', profit: 0.0245 },
  { tokenA: 'WETH', tokenB: 'USDT', profit: 0.0189 },
  { tokenA: 'WETH', tokenB: 'DAI', profit: 0.0312 },
  { tokenA: 'WBTC', tokenB: 'USDC', profit: 0.0567 },
  { tokenA: 'LINK', tokenB: 'USDC', profit: 0.0423 },
  { tokenA: 'UNI', tokenB: 'USDC', profit: 0.0334 },
  { tokenA: 'AAVE', tokenB: 'USDC', profit: 0.0289 },
  { tokenA: 'MKR', tokenB: 'USDC', profit: 0.0445 },
];

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
    // Generate mock opportunities for demo
    const mockOpportunities = Array.from(opportunities.values());
    
    // If no opportunities, generate some mock ones
    if (mockOpportunities.length === 0 && Math.random() > 0.3) {
      const pair = ETH_TOKEN_PAIRS[Math.floor(Math.random() * ETH_TOKEN_PAIRS.length)];
      const profitVariation = (Math.random() - 0.5) * 0.01;
      const profit = pair.profit + profitVariation;

      // Generate realistic prices
      const buyPrice = pair.tokenA === 'WETH' ? 3500 + Math.random() * 100 : 
                       pair.tokenA === 'WBTC' ? 95000 + Math.random() * 1000 :
                       10 + Math.random() * 90;
      const sellPrice = buyPrice * (1 + profit);

      const oppId = `opp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const opportunity = {
        id: oppId,
        tokenPair: `${pair.tokenA}/${pair.tokenB}`,
        tokenA: pair.tokenA,
        tokenB: pair.tokenB,
        buyPrice: Number(buyPrice.toFixed(2)),
        sellPrice: Number(sellPrice.toFixed(2)),
        profit: Number((profit * 100).toFixed(3)),
        profitUSD: Number((buyPrice * profit).toFixed(2)),
        estimatedGas: Number((50 + Math.random() * 50).toFixed(2)),
        riskScore: Number((Math.random() * 40 + 20).toFixed(1)),
        status: 'pending_approval',
        timestamp: Date.now(),
        detectedAt: new Date().toISOString(),
      };

      opportunities.set(oppId, opportunity);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(Array.from(opportunities.values())),
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      
      if (body.action === 'approve' && body.opportunityId) {
        const opp = opportunities.get(body.opportunityId);
        if (opp) {
          opp.status = 'approved';
          opp.approvedAt = new Date().toISOString();
          opportunities.set(body.opportunityId, opp);
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, opportunityId: body.opportunityId }),
        };
      }

      if (body.action === 'reject' && body.opportunityId) {
        opportunities.delete(body.opportunityId);
        
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
