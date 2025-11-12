import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import FileUpload from '../components/FileUpload';
import { 
  FileText, 
  Shield, 
  Share2, 
  Download, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Grid,
  List,
  Upload
} from 'lucide-react';
import { DataEntry, DataType } from '../../shared/types';

const DataManager: React.FC = () => {
  const { 
    dataEntries, 
    addDataEntry, 
    removeDataEntry,
    setSelectedDataEntry,
    addNotification 
  } = useStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<DataType | 'all'>('all');
  const [showUpload, setShowUpload] = useState(false);

  const filteredEntries = dataEntries.filter(entry => {
    const matchesSearch = entry.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.dataType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || entry.dataType === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleUploadComplete = (result: any) => {
    const newEntry: DataEntry = {
      id: `data-${Date.now()}`,
      owner: 'current-user', // This should come from the authenticated user
      ipfsHash: result.ipfsHash,
      dataType: result.dataType || DataType.PERSONAL,
      encrypted: result.encrypted,
      metadata: result.metadata || {},
      timestamp: new Date(),
      size: result.size,
      originalName: result.originalName,
      mimeType: result.mimeType,
    };

    addDataEntry(newEntry);
    setShowUpload(false);
    
    addNotification({
      type: 'success',
      title: 'File Uploaded',
      message: `${result.originalName} has been securely stored in your vault`,
      read: false
    });
  };

  const handleUploadError = (error: string) => {
    addNotification({
      type: 'error',
      title: 'Upload Failed',
      message: error,
      read: false
    });
  };

  const handleDelete = (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      removeDataEntry(entryId);
      addNotification({
        type: 'info',
        title: 'File Deleted',
        message: 'File has been removed from your vault',
        read: false
      });
    }
  };

  const handleView = (entry: DataEntry) => {
    setSelectedDataEntry(entry);
    // In a real app, this would open a modal or navigate to a detail view
    window.open(`/api/ipfs/${entry.ipfsHash}`, '_blank');
  };

  const getDataTypeIcon = (type: DataType) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case DataType.HEALTH:
        return <Shield className={iconClass} />;
      case DataType.FINANCE:
        return <FileText className={iconClass} />;
      case DataType.SOCIAL:
        return <Share2 className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  const getDataTypeColor = (type: DataType) => {
    switch (type) {
      case DataType.HEALTH:
        return 'text-red-600 bg-red-100';
      case DataType.FINANCE:
        return 'text-green-600 bg-green-100';
      case DataType.SOCIAL:
        return 'text-blue-600 bg-blue-100';
      case DataType.EDUCATION:
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Manager</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and organize your personal data securely
              </p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Upload File
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as DataType | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                {Object.values(DataType).map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* File Grid/List */}
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
            <p className="text-gray-600 mb-4">
              Upload your first file to start building your personal data vault
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First File
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${getDataTypeColor(entry.dataType)}`}>
                      {getDataTypeIcon(entry.dataType)}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900 truncate">
                        {entry.originalName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {(entry.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {entry.encrypted && (
                    <Shield className="h-5 w-5 text-green-600" />
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{entry.dataType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uploaded:</span>
                    <span className="font-medium">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IPFS Hash:</span>
                    <span className="font-medium font-mono text-xs">
                      {entry.ipfsHash.slice(0, 8)}...{entry.ipfsHash.slice(-6)}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(entry)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upload File</h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FileText className="h-6 w-6" />
                </button>
              </div>
              <FileUpload
                onUploadComplete={handleUploadComplete}
                onError={handleUploadError}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManager;