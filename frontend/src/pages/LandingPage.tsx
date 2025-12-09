import React from 'react';
import { Activity, Zap, Shield, TrendingUp, ArrowRight, Sparkles, Bot, Globe } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
              <Activity className="w-16 h-16" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-6xl font-bold mb-6 gradient-text">
            NebulaArb
          </h1>
          
          <p className="text-2xl text-gray-300 mb-4">
            Autonomous DeFi Arbitrage on Cosmos
          </p>
          
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Multi-agent AI system that discovers, analyzes, and executes profitable arbitrage opportunities 
            across Cosmos ecosystem DEXs in real-time.
          </p>

          {/* CTA Button */}
          <button
            onClick={onEnterApp}
            className="btn-primary px-8 py-4 text-lg font-semibold flex items-center gap-3 mx-auto hover:scale-105 transform transition-all duration-200 shadow-xl"
          >
            Launch Application
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Connect your Keplr wallet to get started
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
          Powered by Multi-Agent Intelligence
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Scanner Agent */}
          <div className="card p-8 hover:scale-105 transition-transform duration-200">
            <div className="bg-blue-500/20 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Bot className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Scanner Agent</h3>
            <p className="text-gray-400">
              Continuously monitors DEX pools across multiple chains, identifying price discrepancies 
              and arbitrage opportunities in real-time.
            </p>
          </div>

          {/* Risk Agent */}
          <div className="card p-8 hover:scale-105 transition-transform duration-200">
            <div className="bg-purple-500/20 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Risk Agent</h3>
            <p className="text-gray-400">
              Evaluates liquidity depth, slippage, gas costs, and market conditions to ensure 
              only profitable and safe trades are executed.
            </p>
          </div>

          {/* Executor Agent */}
          <div className="card p-8 hover:scale-105 transition-transform duration-200">
            <div className="bg-green-500/20 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Executor Agent</h3>
            <p className="text-gray-400">
              Executes approved arbitrage trades with optimal routing, handling transaction signing 
              and monitoring execution success.
            </p>
          </div>

          {/* Real-time Monitoring */}
          <div className="card p-8 hover:scale-105 transition-transform duration-200">
            <div className="bg-cyan-500/20 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-time Dashboard</h3>
            <p className="text-gray-400">
              Live updates on agent activities, opportunities detected, profit tracking, 
              and execution history with detailed analytics.
            </p>
          </div>

          {/* Cosmos Native */}
          <div className="card p-8 hover:scale-105 transition-transform duration-200">
            <div className="bg-orange-500/20 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-7 h-7 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Cosmos Native</h3>
            <p className="text-gray-400">
              Built on CosmJS for seamless integration with Sei and other Cosmos chains. 
              Connect with Keplr wallet for secure transactions.
            </p>
          </div>

          {/* Autonomous Trading */}
          <div className="card p-8 hover:scale-105 transition-transform duration-200">
            <div className="bg-pink-500/20 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Autonomous or Manual</h3>
            <p className="text-gray-400">
              Choose between fully autonomous trading or require manual approval for each trade. 
              Full control over your trading strategy.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="container mx-auto px-6 py-20">
        <div className="card max-w-4xl mx-auto p-12">
          <h2 className="text-3xl font-bold text-center mb-8 gradient-text">
            Built with Cutting-Edge Technology
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-blue-400 font-semibold text-lg mb-2">CosmJS</div>
              <div className="text-gray-400 text-sm">Cosmos SDK</div>
            </div>
            <div>
              <div className="text-purple-400 font-semibold text-lg mb-2">TypeScript</div>
              <div className="text-gray-400 text-sm">Type Safety</div>
            </div>
            <div>
              <div className="text-green-400 font-semibold text-lg mb-2">React</div>
              <div className="text-gray-400 text-sm">Modern UI</div>
            </div>
            <div>
              <div className="text-orange-400 font-semibold text-lg mb-2">Socket.IO</div>
              <div className="text-gray-400 text-sm">Real-time Data</div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-6">
              Powered by <span className="text-blue-400 font-semibold">IQAI ADK-TS</span> Architecture
            </p>
            <button
              onClick={onEnterApp}
              className="btn-primary px-6 py-3 font-semibold flex items-center gap-2 mx-auto"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-slate-800">
        <div className="text-center text-gray-500 text-sm">
          <p>NebulaArb - Autonomous DeFi Arbitrage System</p>
          <p className="mt-2">Sei Testnet (atlantic-2) • For Educational Purposes</p>
        </div>
      </footer>
    </div>
  );
}
