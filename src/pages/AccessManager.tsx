import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Users, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit, 
  Trash2,
  Key,
  Calendar,
  AlertCircle,
  Eye
} from 'lucide-react';
import { AccessRule, PermissionType } from '../../shared/types';

const AccessManager: React.FC = () => {
  const { 
    dataEntries, 
    accessRules, 
    addAccessRule, 
    updateAccessRule, 
    removeAccessRule,
    addNotification 
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AccessRule | null>(null);
  const [formData, setFormData] = useState({
    dataId: '',
    granteeAddress: '',
    permissionType: PermissionType.READ,
    expiry: '',
    oneTime: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dataId || !formData.granteeAddress) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please fill in all required fields',
        read: false
      });
      return;
    }

    const newRule: AccessRule = {
      id: editingRule?.id || `rule-${Date.now()}`,
      dataId: formData.dataId,
      grantee: formData.granteeAddress,
      permissionType: formData.permissionType,
      expiry: formData.expiry ? new Date(formData.expiry) : undefined,
      oneTime: formData.oneTime,
      used: false,
      grantedBy: 'current-user', // This should come from the authenticated user
      grantedAt: editingRule?.grantedAt || new Date()
    };

    if (editingRule) {
      updateAccessRule(editingRule.id, newRule);
      addNotification({
        type: 'success',
        title: 'Access Rule Updated',
        message: 'The access rule has been successfully updated',
        read: false
      });
    } else {
      addAccessRule(newRule);
      addNotification({
        type: 'success',
        title: 'Access Granted',
        message: `Access granted to ${formData.granteeAddress.slice(0, 6)}...${formData.granteeAddress.slice(-4)}`,
        read: false
      });
    }

    setShowAddModal(false);
    setEditingRule(null);
    setFormData({
      dataId: '',
      granteeAddress: '',
      permissionType: PermissionType.READ,
      expiry: '',
      oneTime: false
    });
  };

  const handleEdit = (rule: AccessRule) => {
    setEditingRule(rule);
    setFormData({
      dataId: rule.dataId,
      granteeAddress: rule.grantee,
      permissionType: rule.permissionType,
      expiry: rule.expiry ? rule.expiry.toISOString().slice(0, 16) : '',
      oneTime: rule.oneTime
    });
    setShowAddModal(true);
  };

  const handleDelete = (ruleId: string) => {
    if (window.confirm('Are you sure you want to revoke this access?')) {
      removeAccessRule(ruleId);
      addNotification({
        type: 'info',
        title: 'Access Revoked',
        message: 'The access rule has been removed',
        read: false
      });
    }
  };

  const isRuleExpired = (rule: AccessRule) => {
    return rule.expiry && new Date(rule.expiry) < new Date();
  };

  const isRuleUsed = (rule: AccessRule) => {
    return rule.oneTime && rule.used;
  };

  const getPermissionIcon = (type: PermissionType) => {
    switch (type) {
      case PermissionType.READ:
        return <Eye className="h-4 w-4" />;
      case PermissionType.WRITE:
        return <Edit className="h-4 w-4" />;
      case PermissionType.ADMIN:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getPermissionColor = (type: PermissionType) => {
    switch (type) {
      case PermissionType.READ:
        return 'text-blue-600 bg-blue-100';
      case PermissionType.WRITE:
        return 'text-green-600 bg-green-100';
      case PermissionType.ADMIN:
        return 'text-red-600 bg-red-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Access Manager</h1>
              <p className="text-sm text-gray-600 mt-1">
                Control who can access your data and manage permissions
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Grant Access
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Access Rules</p>
                <p className="text-2xl font-bold text-gray-900">{accessRules.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accessRules.filter(rule => !isRuleExpired(rule) && !isRuleUsed(rule)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired Rules</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accessRules.filter(rule => isRuleExpired(rule)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Access Rules List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Access Rules</h2>
          </div>

          {accessRules.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No access rules yet</h3>
              <p className="text-gray-600 mb-4">
                Grant access to your data by creating your first access rule
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Access Rule
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {accessRules.map((rule) => (
                <div key={rule.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPermissionColor(rule.permissionType)}`}>
                          {getPermissionIcon(rule.permissionType)}
                          <span className="ml-1 capitalize">{rule.permissionType}</span>
                        </span>
                        {rule.oneTime && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Key className="h-3 w-3 mr-1" />
                            One-time
                          </span>
                        )}
                        {isRuleExpired(rule) && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Expired
                          </span>
                        )}
                        {isRuleUsed(rule) && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Used
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          Grantee: {rule.grantee.slice(0, 8)}...{rule.grantee.slice(-6)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Data: {rule.dataId}
                        </p>
                        {rule.expiry && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Expires: {new Date(rule.expiry).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Granted: {new Date(rule.grantedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingRule ? 'Edit Access Rule' : 'Grant Access'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRule(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Data
                  </label>
                  <select
                    value={formData.dataId}
                    onChange={(e) => setFormData({ ...formData, dataId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Choose a data entry...</option>
                    {dataEntries.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.originalName} ({entry.dataType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grantee Address
                  </label>
                  <input
                    type="text"
                    value={formData.granteeAddress}
                    onChange={(e) => setFormData({ ...formData, granteeAddress: e.target.value })}
                    placeholder="Enter Polkadot address..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permission Type
                  </label>
                  <select
                    value={formData.permissionType}
                    onChange={(e) => setFormData({ ...formData, permissionType: e.target.value as PermissionType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={PermissionType.READ}>Read Only</option>
                    <option value={PermissionType.WRITE}>Read & Write</option>
                    <option value={PermissionType.ADMIN}>Full Access</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="oneTime"
                    checked={formData.oneTime}
                    onChange={(e) => setFormData({ ...formData, oneTime: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="oneTime" className="ml-2 block text-sm text-gray-700">
                    One-time access (expires after first use)
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingRule(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingRule ? 'Update' : 'Grant Access'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessManager;