import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Shield, 
  Upload, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

const CrossChainBridge: React.FC = () => {
  const [selectedSourceChain, setSelectedSourceChain] = useState('');
  const [selectedTargetChain, setSelectedTargetChain] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  const availableChains = [
    { id: 'astar', name: 'Astar Network', rpc: 'wss://rpc.astar.network', nativeToken: 'ASTR' },
    { id: 'acala', name: 'Acala', rpc: 'wss://rpc.acala.network', nativeToken: 'ACA' },
    { id: 'moonbeam', name: 'Moonbeam', rpc: 'wss://rpc.moonbeam.network', nativeToken: 'GLMR' },
    { id: 'phala', name: 'Phala Network', rpc: 'wss://rpc.phala.network', nativeToken: 'PHA' },
  ];

  const handleTransfer = async () => {
    if (!selectedSourceChain || !selectedTargetChain) {
      return;
    }

    setIsTransferring(true);
    setTransferStatus('pending');

    try {
      // Simulate cross-chain transfer
      await new Promise(resolve => setTimeout(resolve, 3000));
      setTransferStatus('success');
    } catch (error) {
      setTransferStatus('error');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Cross-Chain Bridge</h1>
            <p className="text-sm text-gray-600 mt-1">
              Transfer and sync your data across different Polkadot parachains
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Banner */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Cross-chain transfers are in beta</h3>
              <p className="text-sm text-yellow-700 mt-1">
                This feature is currently under development. Test with small amounts of data first.
              </p>
            </div>
          </div>
        </div>

        {/* Transfer Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Transfer Data</h2>
          
          <div className="space-y-6">
            {/* Source Chain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Chain
              </label>
              <select
                value={selectedSourceChain}
                onChange={(e) => setSelectedSourceChain(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select source chain...</option>
                {availableChains.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name} ({chain.nativeToken})
                  </option>
                ))}
              </select>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowLeftRight className="h-6 w-6 text-gray-400" />
            </div>

            {/* Target Chain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Chain
              </label>
              <select
                value={selectedTargetChain}
                onChange={(e) => setSelectedTargetChain(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select target chain...</option>
                {availableChains
                  .filter(chain => chain.id !== selectedSourceChain)
                  .map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name} ({chain.nativeToken})
                    </option>
                  ))}
              </select>
            </div>

            {/* Transfer Button */}
            <button
              onClick={handleTransfer}
              disabled={!selectedSourceChain || !selectedTargetChain || isTransferring}
              className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTransferring ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  <ArrowLeftRight className="h-5 w-5 mr-2" />
                  Transfer Data
                </>
              )}
            </button>
          </div>
        </div>

        {/* Transfer Status */}
        {transferStatus !== 'idle' && (
          <div className={`p-4 rounded-lg ${
            transferStatus === 'success' ? 'bg-green-50 border border-green-200' :
            transferStatus === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center">
              {transferStatus === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              ) : transferStatus === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              ) : (
                <Clock className="h-5 w-5 text-blue-600 mr-3 animate-spin" />
              )}
              <div>
                <p className={`font-medium ${
                  transferStatus === 'success' ? 'text-green-800' :
                  transferStatus === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {transferStatus === 'success' ? 'Transfer Complete' :
                   transferStatus === 'error' ? 'Transfer Failed' :
                   'Transfer in Progress'}
                </p>
                <p className={`text-sm ${
                  transferStatus === 'success' ? 'text-green-700' :
                  transferStatus === 'error' ? 'text-red-700' :
                  'text-blue-700'
                }`}>
                  {transferStatus === 'success' ? 'Your data has been successfully transferred across chains.' :
                   transferStatus === 'error' ? 'There was an error transferring your data. Please try again.' :
                   'Please wait while we process your cross-chain transfer...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Supported Chains */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Chains</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableChains.map((chain) => (
              <div key={chain.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{chain.name}</h4>
                  <p className="text-sm text-gray-600">Native token: {chain.nativeToken}</p>
                </div>
                <a
                  href={chain.rpc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossChainBridge;