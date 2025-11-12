// Shared types for MyDataVault

export interface User {
  address: string;
  name?: string;
  email?: string;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface DataEntry {
  id: string;
  owner: string;
  ipfsHash: string;
  dataType: DataType;
  encrypted: boolean;
  metadata: Record<string, any>;
  timestamp: Date;
  size: number;
  originalName: string;
  mimeType: string;
}

export enum DataType {
  HEALTH = 'health',
  FINANCE = 'finance',
  SOCIAL = 'social',
  EDUCATION = 'education',
  PERSONAL = 'personal',
  PROFESSIONAL = 'professional',
  OTHER = 'other'
}

export interface AccessRule {
  id: string;
  dataId: string;
  grantee: string;
  permissionType: PermissionType;
  expiry?: Date;
  oneTime: boolean;
  used: boolean;
  grantedBy: string;
  grantedAt: Date;
}

export enum PermissionType {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin'
}

export interface UploadRequest {
  file: File;
  dataType: DataType;
  encrypt: boolean;
  encryptionKey?: string;
  metadata?: Record<string, any>;
}

export interface UploadResponse {
  success: boolean;
  ipfsHash: string;
  size: number;
  encrypted: boolean;
  dataId: string;
  transactionHash?: string;
}

export interface AccessRequest {
  dataId: string;
  granteeAddress: string;
  permissionType: PermissionType;
  expiry?: Date;
  oneTime: boolean;
}

export interface Web2Integration {
  id: string;
  name: string;
  type: 'oauth' | 'api';
  provider: string;
  scopes: string[];
  connected: boolean;
  lastSync?: Date;
}

export interface CrossChainRequest {
  sourceChain: string;
  targetChain: string;
  dataType: DataType;
  userAddress: string;
  xcmMessage: any;
}

export interface ZKProofRequest {
  dataId: string;
  proofType: 'income' | 'credit_score' | 'age' | 'identity';
  parameters: Record<string, any>;
  publicInputs: string[];
}

export interface ZKProofResponse {
  success: boolean;
  proof: string;
  publicInputs: string[];
  verified: boolean;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface HealthData {
  bloodPressure?: { systolic: number; diastolic: number };
  heartRate?: number;
  weight?: number;
  height?: number;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  lastCheckup?: Date;
}

export interface FinancialData {
  income?: number;
  creditScore?: number;
  bankAccounts?: string[];
  investments?: string[];
  liabilities?: string[];
  netWorth?: number;
}

export interface SocialData {
  platforms: string[];
  followers: number;
  engagement: number;
  posts: number;
  verified: boolean;
}

export interface ChainInfo {
  name: string;
  rpc: string;
  nativeToken: string;
  chainId: string;
  parachainId?: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}