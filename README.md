# MyDataVault: Decentralized Personal Data Hub

A user-centric decentralized application (dApp) built on Polkadot that empowers users to own, aggregate, and securely share their personal data across Web2 and Web3 services.

## 🚀 Features

- **🔐 Data Ownership**: Users maintain complete control over their personal data
- **🌐 Cross-Chain Integration**: Seamlessly transfer data between Polkadot parachains
- **🛡️ Privacy Protection**: Advanced encryption and optional zero-knowledge proofs
- **📁 IPFS Storage**: Decentralized file storage with encryption
- **👥 Access Control**: Granular permission management for data sharing
- **🔗 Web2 Bridge**: Import data from traditional platforms (health, finance, social)
- **💼 Wallet Integration**: Connect with Talisman, SubWallet, and other Polkadot wallets

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js + TypeScript
- **Blockchain**: Astar Network (Polkadot Parachain) + Ink! Smart Contracts
- **Storage**: IPFS for file storage, on-chain for metadata
- **Privacy**: ZK-SNARKs integration (planned)
- **Authentication**: Polkadot wallet-based auth

### Project Structure

```
mydatavault/
├── src/                    # Frontend React application
│   ├── components/          # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Application pages
│   ├── store/              # Zustand state management
│   └── hooks/              # Custom hooks including wallet integration
├── api/                    # Express.js backend
│   ├── server.ts           # Main server file
│   └── routes/             # API routes
├── contracts/              # Ink! smart contracts
│   └── src/
│       ├── data_registry.rs    # Data storage and access control
│       └── lib.rs              # Contract exports
├── shared/                 # Shared types and utilities
│   └── types/              # TypeScript type definitions
├── scripts/                # Utility scripts
└── supabase/               # Database configuration (future)
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- pnpm package manager
- Rust toolchain (for smart contracts)
- Polkadot.js extension

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mydatavault
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Start both frontend and backend
   pnpm run dev

   # Or start them separately
   pnpm run client:dev  # Frontend only
   pnpm run server:dev  # Backend only
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API Health Check: http://localhost:3001/health

## 📖 Usage Guide

### 1. Connect Your Wallet

1. Install a Polkadot wallet extension (Talisman or SubWallet recommended)
2. Visit the application at http://localhost:5173
3. Click "Connect Wallet" and authorize the connection
4. Sign the authentication message

### 2. Upload Data

1. Navigate to the Data Manager
2. Click "Upload File" or drag & drop files
3. Select data category (Health, Finance, Personal, etc.)
4. Choose encryption options
5. Set access permissions
6. Confirm upload to IPFS and blockchain

### 3. Manage Access

1. Go to Access Manager
2. Create new access rules for specific users
3. Set permission types (Read, Write, Admin)
4. Configure time limits or one-time access
5. Grant or revoke permissions as needed

### 4. Cross-Chain Operations

1. Use the Cross-Chain Bridge
2. Select source and target parachains
3. Choose data to transfer
4. Confirm the XCM transaction

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173

# IPFS Configuration
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https
IPFS_AUTH=your-infura-auth

# Polkadot Configuration
POLKADOT_WS_URL=wss://shibuya-rpc.dwellir.com

# Encryption
ENCRYPTION_KEY=your-encryption-key
```

### Smart Contracts

The smart contracts are written in Ink! (Rust) and include:

- **DataRegistry**: Manages data entries and IPFS hashes
- **AccessController**: Handles permission management
- **PrivacyManager**: ZK-proof verification (planned)

To deploy contracts:

```bash
cd contracts
cargo contract build
cargo contract deploy
```

## 🧪 Testing

### Frontend Tests
```bash
pnpm run test
```

### Backend Tests
```bash
pnpm run test:api
```

### Smart Contract Tests
```bash
cd contracts
cargo test
```

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
vercel --prod
```

### Backend Deployment (Railway)
```bash
railway up
```

### Smart Contract Deployment
Deploy to Astar Network mainnet following the official documentation.

## 🔒 Security

- All data is encrypted before IPFS upload
- Access control enforced on-chain
- Wallet-based authentication
- Regular security audits recommended
- Use production-grade secrets management

## 🌟 Roadmap

### Phase 1 (Completed)
- ✅ Basic project structure
- ✅ Wallet integration
- ✅ IPFS file storage
- ✅ Basic access control
- ✅ Data management UI

### Phase 2 (In Progress)
- 🔄 ZK-SNARKs integration
- 🔄 Cross-chain data portability
- 🔄 Web2 API integrations
- 🔄 Advanced privacy features

### Phase 3 (Planned)
- 📋 Mobile application
- 📋 Advanced analytics
- 📋 Enterprise features
- 📋 Multi-chain support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Polkadot ecosystem and community
- Astar Network for parachain infrastructure
- IPFS for decentralized storage
- The open-source community

## 📞 Support

For support, please:
- Check the documentation
- Search existing issues
- Create a new issue with detailed information
- Join our community discussions

---

**MyDataVault** - Taking control of your digital identity, one block at a time.