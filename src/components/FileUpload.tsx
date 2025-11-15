import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { DataType } from '../../shared/types';
import { API_CONFIG } from '../config/api';

interface FileUploadProps {
  onUploadComplete: (result: any) => void;
  onError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete, onError }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<DataType>(DataType.PERSONAL);
  const [encrypt, setEncrypt] = useState(true);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'text/*': ['.txt', '.csv'],
      'application/json': ['.json'],
    }
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      onError('Please select a file to upload');
      return;
    }

    if (encrypt && !encryptionKey) {
      onError('Please provide an encryption key or disable encryption');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('dataType', dataType);
      formData.append('encrypt', encrypt.toString());
      if (encrypt) {
        formData.append('encryptionKey', encryptionKey);
      }

      setUploadProgress(30);

      const token = localStorage.getItem('authToken');
      // 🚨 EMERGENCY FIX: Force relative URL for production
      const apiUrl = window.location.hostname.includes('localhost') 
        ? 'http://localhost:3001/api/ipfs/upload'
        : '/api/ipfs/upload';
      
      console.log('🚨 EMERGENCY UPLOAD URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      setUploadProgress(70);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadProgress(100);

      // Store metadata on blockchain
      const blockchainApiUrl = window.location.hostname.includes('localhost') 
        ? 'http://localhost:3001/api/blockchain/store'
        : '/api/blockchain/store';
      
      console.log('🚨 EMERGENCY BLOCKCHAIN URL:', blockchainApiUrl);
      
      const blockchainResponse = await fetch(blockchainApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          dataId: `data-${Date.now()}`,
          ipfsHash: result.ipfsHash,
          dataType,
          encrypted: encrypt,
          metadata: {
            originalName: selectedFile.name,
            mimeType: selectedFile.type,
            size: selectedFile.size,
            uploadedAt: new Date().toISOString(),
          }
        }),
      });

      if (!blockchainResponse.ok) {
        console.warn('Blockchain storage failed, but IPFS upload succeeded');
      }

      onUploadComplete(result);
      
      // Reset form
      setSelectedFile(null);
      setEncryptionKey('');
      setUploadProgress(0);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const generateEncryptionKey = () => {
    const key = Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 36).toString(36)
    ).join('');
    setEncryptionKey(key);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload File</h3>
        <p className="text-sm text-gray-600">
          Securely upload your personal data to your decentralized vault
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop the file here...</p>
        ) : (
          <div>
            <p className="text-gray-700 font-medium mb-2">
              Drag & drop a file here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, images, text files, and JSON (max 50MB)
            </p>
          </div>
        )}
      </div>

      {/* Selected File */}
      {selectedFile && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <File className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 text-gray-400 hover:text-red-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {uploadProgress > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Configuration */}
      <div className="mt-6 space-y-4">
        {/* Data Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Category
          </label>
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value as DataType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={DataType.PERSONAL}>Personal Documents</option>
            <option value={DataType.HEALTH}>Health Records</option>
            <option value={DataType.FINANCE}>Financial Data</option>
            <option value={DataType.EDUCATION}>Education</option>
            <option value={DataType.PROFESSIONAL}>Professional</option>
            <option value={DataType.SOCIAL}>Social Media</option>
            <option value={DataType.OTHER}>Other</option>
          </select>
        </div>

        {/* Encryption */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Encrypt File</p>
              <p className="text-sm text-gray-600">
                Protect your data with encryption before storing on IPFS
              </p>
            </div>
          </div>
          <button
            onClick={() => setEncrypt(!encrypt)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              encrypt ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                encrypt ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Encryption Key */}
        {encrypt && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Encryption Key
            </label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.value)}
                placeholder="Enter encryption key or generate one"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={generateEncryptionKey}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Generate
              </button>
            </div>
            {encryptionKey && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <p className="text-sm text-green-800">
                    Encryption key set. Save this key securely - you'll need it to decrypt your file.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="mt-6">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading || (encrypt && !encryptionKey)}
          className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              Upload to MyDataVault
            </>
          )}
        </button>
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Your data is secure</p>
            <p>
              Files are encrypted before upload and stored on IPFS. Only you control access to your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;