import React, { useState } from 'react';
import { TrendingUp, BarChart3, Zap, Wifi, WifiOff } from 'lucide-react';
import { WalletButton } from './components/WalletButton';
import { AgentStatusCard } from './components/AgentStatusCard';
import { OpportunityCard } from './components/OpportunityCard';
import { ControlPanel } from './components/ControlPanel';
import { SettingsModal, SystemSettings } from './components/SettingsModal';
import { ApprovalModal } from './components/ApprovalModal';
import { LandingPage } from './pages/LandingPage';
import { useWallet } from './hooks/useWalletEth';
import { useAgentData } from './hooks/useAgentDataNetlify';
import type { ArbitrageOpportunity } from './types';

// Suppress wallet connection errors in console
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    // Suppress MetaMask/wallet related errors
    const errorString = args.join(' ');
    if (errorString.includes('wallet') || 
        errorString.includes('ethereum') || 
        errorString.includes('MetaMask') ||
        args[0]?.code === 403) {
      return;
    }
    originalError.apply(console, args);
  };
}

function App() {
  const wallet = useWallet();
  const { 
    agents: agentStatuses, 
    opportunities: rawOpportunities,
    activities,
    systemRunning, 
    systemStats: stats, 
    systemSettings: settingsFromBackend,
    connected,
    startSystem,
    stopSystem,
    updateSettings: updateBackendSettings,
    approveOpportunity,
    rejectOpportunity
  } = useAgentData();
  
  // Map Netlify API opportunities to ArbitrageOpportunity format
  const opportunities: ArbitrageOpportunity[] = React.useMemo(() => {
    return rawOpportunities.map(opp => {
      const [symbolA, symbolB] = opp.tokenPair.split('/');
      return {
        id: opp.id,
        tokenPair: {
          tokenA: { symbol: symbolA || opp.tokenA, address: opp.tokenA },
          tokenB: { symbol: symbolB || opp.tokenB, address: opp.tokenB }
        },
        buyPrice: opp.buyPrice,
        sellPrice: opp.sellPrice,
        potentialProfit: opp.profitUSD,
        profitUSD: opp.profitUSD,
        riskScore: opp.riskScore,
        timestamp: opp.timestamp,
        status: opp.status as any
      };
    });
  }, [rawOpportunities]);
  
  const [showLanding, setShowLanding] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [pendingApproval, setPendingApproval] = useState<{
    opportunity: any;
    expectedProfit: number;
  } | null>(null);
  const [settings, setSettings] = useState<SystemSettings>({
    scanInterval: 30,
    minProfitUSD: 1.0,
    maxSlippage: 1.0,
    requireApproval: true,
  });

  // Sync settings from backend
  React.useEffect(() => {
    if (settingsFromBackend) {
      setSettings(settingsFromBackend);
    }
  }, [settingsFromBackend]);

  // Debug: Log wallet state
  React.useEffect(() => {
    console.log('App - Wallet state updated:', {
      connected: wallet.connected,
      address: wallet.address,
      balance: wallet.balance,
      chainId: wallet.chainId
    });
    console.log('App - Wallet connected check:', wallet.connected && !!wallet.address);
  }, [wallet]);

  // Check for opportunities that need approval
  React.useEffect(() => {
    const needsApproval = opportunities.find(opp => opp.status === 'pending_approval');
    if (needsApproval && !showApprovalModal) {
      setPendingApproval({
        opportunity: needsApproval,
        expectedProfit: needsApproval.profitUSD || 0
      });
      setShowApprovalModal(true);
    }
  }, [opportunities, showApprovalModal]);

  const handleApproveOpportunity = async () => {
    if (!pendingApproval) return;

    try {
      await approveOpportunity(pendingApproval.opportunity.id);
      console.log('Trade approved');
    } catch (error) {
      console.error('Error approving trade:', error);
    } finally {
      setShowApprovalModal(false);
      setPendingApproval(null);
    }
  };

  const handleRejectOpportunity = async () => {
    if (!pendingApproval) return;

    try {
      await rejectOpportunity(pendingApproval.opportunity.id);
      console.log('Trade rejected');
    } catch (error) {
      console.error('Error rejecting trade:', error);
    } finally {
      setShowApprovalModal(false);
      setPendingApproval(null);
    }
  };

  const handleEnterApp = () => {
    setShowLanding(false);
  };

  const handleStartSystem = async () => {
    await startSystem();
  };

  const handleStopSystem = async () => {
    await stopSystem();
  };

  const handleSaveSettings = async (newSettings: SystemSettings) => {
    setSettings(newSettings);
    await updateBackendSettings(newSettings);
  };

  if (showLanding) {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {showApprovalModal && pendingApproval && (
        <ApprovalModal
          opportunity={pendingApproval.opportunity}
          expectedProfit={pendingApproval.expectedProfit}
          onApprove={handleApproveOpportunity}
          onReject={handleRejectOpportunity}
          onClose={() => {
            setShowApprovalModal(false);
            setPendingApproval(null);
          }}
        />
      )}

      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setShowLanding(true)}
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">
                  NebulaArb
                </h1>
                <p className="text-xs text-gray-400">Autonomous DeFi Arbitrage</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {connected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Backend Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">Backend Offline</span>
                  </>
                )}
              </div>
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Control Panel */}
        <ControlPanel
          isRunning={systemRunning}
          onStart={handleStartSystem}
          onStop={handleStopSystem}
          onOpenSettings={() => setShowSettings(true)}
          walletConnected={true}
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Scans</h3>
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold">{stats.totalScans}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Opportunities</h3>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold">{stats.opportunitiesDetected}</p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.opportunitiesApproved} approved
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Success Rate</h3>
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold">{(stats.successRate * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.executionsSuccessful}/{stats.executionsAttempted} successful
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Total Profit</h3>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">
              ${stats.totalProfit.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Agent Status */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Agent Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {agentStatuses.map((agent) => (
              <AgentStatusCard key={agent.name} agent={agent} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Opportunities */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Opportunities</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {opportunities.length === 0 ? (
                <div className="card p-8 text-center text-gray-400">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No opportunities detected yet</p>
                  <p className="text-sm mt-1">Waiting for scans...</p>
                </div>
              ) : (
                opportunities.map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))
              )}
            </div>
          </div>

          {/* Activity Log and System Info */}
          <div className="space-y-8">
            {/* Activity Log */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Activity Log</h2>
              <div className="card p-4 max-h-[350px] overflow-y-auto">
                {!activities || activities.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No activity yet</p>
                    <p className="text-sm mt-1">Start the system to see agent activities</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="border-l-2 border-slate-700 pl-4 pb-3 last:pb-0"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            activity.status === 'success' ? 'bg-green-500/20 text-green-400' :
                            activity.status === 'error' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {activity.agent}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="font-semibold text-sm">{activity.action}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* System Info */}
            <div>
              <h2 className="text-2xl font-bold mb-4">System Info</h2>
              <div className="card p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status</span>
                    <span className={systemRunning ? "text-green-400 font-semibold" : "text-gray-400"}>
                      {systemRunning ? '● Running' : '○ Stopped'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Backend</span>
                    <span className={connected ? "text-green-400" : "text-red-400"}>
                      {connected ? '● Connected' : '○ Offline'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Network</span>
                    <span className="text-blue-400">Ethereum Mainnet</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Uptime</span>
                    <span className="text-white">{Math.floor(stats.uptime / 60)}m {stats.uptime % 60}s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!connected && (
          <div className="fixed bottom-6 right-6 card p-4 bg-yellow-500/10 border-yellow-500/30 max-w-sm">
            <div className="flex items-start gap-3">
              <WifiOff className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-400 mb-1">Backend Offline</h3>
                <p className="text-sm text-gray-300">
                  Backend API is not responding. Please check your deployment.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
