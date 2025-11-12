import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { useWallet } from '../hooks/useWallet';
import { 
  Wallet, 
  Upload, 
  Shield, 
  Share2, 
  Database, 
  Activity,
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    user, 
    dataEntries, 
    accessRules, 
    notifications, 
    isLoading,
    setLoading,
    addNotification 
  } = useStore();
  
  const { 
    isConnected, 
    selectedAccount, 
    connectWallet, 
    authenticateWithBackend 
  } = useWallet();

  const [stats, setStats] = useState({
    totalFiles: 0,
    encryptedFiles: 0,
    activeShares: 0,
    storageUsed: 0
  });

  useEffect(() => {
    if (dataEntries.length > 0) {
      setStats({
        totalFiles: dataEntries.length,
        encryptedFiles: dataEntries.filter(entry => entry.encrypted).length,
        activeShares: accessRules.filter(rule => !rule.used).length,
        storageUsed: dataEntries.reduce((total, entry) => total + entry.size, 0)
      });
    }
  }, [dataEntries, accessRules]);

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      await connectWallet();
      
      if (selectedAccount) {
        await authenticateWithBackend();
        addNotification({
          type: 'success',
          title: 'Wallet Connected',
          message: `Connected with ${selectedAccount.address.slice(0, 6)}...${selectedAccount.address.slice(-4)}`,
          read: false
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: error instanceof Error ? error.message : 'Failed to connect wallet',
        read: false
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: number;
    color: string;
  }> = ({ title, value, icon, trend, color }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <p className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to MyDataVault
              </h2>
              <p className="text-gray-600 mb-8">
                Connect your Polkadot wallet to start managing your personal data securely.
                Take control of your digital identity with blockchain-powered privacy.
              </p>
              <button
                onClick={handleConnectWallet}
                disabled={isLoading}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Wallet className="h-5 w-5 mr-2" />
                {isLoading ? 'Connecting...' : 'Connect Your Wallet'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Files"
                value={stats.totalFiles}
                icon={<FileText className="h-6 w-6 text-white" />}
                color="bg-blue-500"
                trend={12}
              />
              <StatCard
                title="Encrypted Files"
                value={stats.encryptedFiles}
                icon={<Shield className="h-6 w-6 text-white" />}
                color="bg-green-500"
                trend={8}
              />
              <StatCard
                title="Active Shares"
                value={stats.activeShares}
                icon={<Share2 className="h-6 w-6 text-white" />}
                color="bg-purple-500"
                trend={-2}
              />
              <StatCard
                title="Storage Used"
                value={`${(stats.storageUsed / 1024 / 1024).toFixed(1)} MB`}
                icon={<Database className="h-6 w-6 text-white" />}
                color="bg-orange-500"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Upload File</span>
                  <span className="text-xs text-gray-500">Secure storage</span>
                </button>
                
                <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                  <Share2 className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Share Data</span>
                  <span className="text-xs text-gray-500">Grant access</span>
                </button>
                
                <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                  <TrendingUp className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Cross-Chain</span>
                  <span className="text-xs text-gray-500">Import data</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Your data vault activity will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className={`p-2 rounded-full ${
                        notification.type === 'success' ? 'bg-green-100' :
                        notification.type === 'error' ? 'bg-red-100' :
                        notification.type === 'warning' ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }`}>
                        {notification.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                         notification.type === 'error' ? <AlertCircle className="h-4 w-4 text-red-600" /> :
                         <Activity className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;