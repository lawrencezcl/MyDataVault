# MyDataVault Technical Architecture Document

## 1. System Overview

MyDataVault is a decentralized personal data hub built on Polkadot that empowers users to own, aggregate, and securely share their personal data across Web2 and Web3 services. The system leverages Polkadot's cross-chain interoperability, privacy tools, and decentralized infrastructure.

## 2. Architecture Components

### 2.1 Frontend Layer
- **Technology**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Headless UI
- **State Management**: Zustand
- **Wallet Integration**: Polkadot.js + Talisman/SubWallet
- **Key Features**:
  - User dashboard with data inventory
  - File upload interface with IPFS integration
  - Access control management UI
  - Cross-chain data viewer
  - Web2 service integration forms

### 2.2 Backend Layer (Express.js)
- **Technology**: Node.js + Express + TypeScript
- **Key Services**:
  - IPFS integration service
  - Web2 API bridge (OAuth2 implementations)
  - ZK-proof verification service
  - Cross-chain data aggregation
- **Authentication**: Polkadot wallet-based auth

### 2.3 Blockchain Layer
- **Primary Chain**: Astar Network (Polkadot Parachain)
- **Smart Contracts**: Ink! (Rust)
- **Key Contracts**:
  - `DataRegistry`: Stores IPFS hashes and metadata
  - `AccessController`: Manages user-defined access rules
  - `PrivacyManager`: Handles ZK-proof verification

### 2.4 Storage Layer
- **Primary Storage**: IPFS for large files
- **Metadata Storage**: On-chain (Astar) for data hashes and access rules
- **Backup**: Pinata or Infura for IPFS persistence

### 2.5 Privacy Layer
- **ZK-SNARKs**: Integration with Phala Network or Aztec
- **Privacy Modes**:
  - Public: Social profiles, public data
  - Private: Medical records, financial data
  - ZK-Proven: Income verification, credit scores

## 3. Data Flow Architecture

### 3.1 Data Upload Flow
1. User uploads file via frontend
2. File encrypted and stored on IPFS
3. IPFS hash stored on Astar blockchain
4. Access rules defined and stored in AccessController contract

### 3.2 Data Access Flow
1. Requestor requests access to specific data
2. AccessController verifies permissions
3. If authorized, IPFS hash retrieved from DataRegistry
4. File decrypted and delivered to requestor

### 3.3 Cross-Chain Data Flow
1. User requests data from parachain
2. XCM message sent to target parachain
3. Data retrieved and verified
4. Data stored in user's vault with source attribution

## 4. Security Architecture

### 4.1 Authentication
- Polkadot wallet-based authentication
- Session management with JWT tokens
- Multi-signature support for high-value data

### 4.2 Data Encryption
- Client-side encryption before IPFS upload
- AES-256 encryption with user-controlled keys
- Key derivation using Polkadot account

### 4.3 Access Control
- Time-bound permissions
- One-time access tokens
- Revocable permissions
- Role-based access control

## 5. Integration Architecture

### 5.1 Web2 Integrations
- OAuth2 flows for major platforms:
  - Google Health API
  - Banking APIs (Plaid integration)
  - Social media APIs
- Data normalization and validation
- User consent management

### 5.2 Web3 Integrations
- Polkadot parachain connectivity
- XCM protocol implementation
- Cross-chain data verification
- DeFi protocol integrations

## 6. Scalability Considerations

### 6.1 Performance
- IPFS gateway optimization
- Caching layer for frequently accessed data
- CDN integration for global access

### 6.2 Cost Optimization
- Batch operations for multiple data uploads
- IPFS pinning service optimization
- Gas fee optimization for smart contracts

## 7. Development Roadmap

### Phase 1 (Weeks 1-2): Foundation
- Project setup and infrastructure
- Basic smart contracts deployment
- Frontend skeleton with wallet integration

### Phase 2 (Weeks 3-4): Core Features
- IPFS integration and file upload
- Basic access control implementation
- Data inventory management

### Phase 3 (Weeks 5-6): Advanced Features
- Privacy and ZK-proof integration
- Cross-chain data portability
- Web2 bridge implementation

### Phase 4 (Weeks 7-8): Polish & Deploy
- Comprehensive testing
- Performance optimization
- Production deployment
- Demo video creation

## 8. Technology Dependencies

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "@polkadot/api": "^10.1.0",
  "@polkadot/extension-dapp": "^0.46.0",
  "zustand": "^4.4.0",
  "tailwindcss": "^3.3.0",
  "ipfs-http-client": "^60.0.0",
  "axios": "^1.5.0"
}
```

### Backend Dependencies
```json
{
  "express": "^4.18.0",
  "typescript": "^5.0.0",
  "ipfs-http-client": "^60.0.0",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "jsonwebtoken": "^9.0.0",
  "@polkadot/api": "^10.1.0"
}
```

### Smart Contract Dependencies
```toml
[dependencies]
ink = { version = "4.3.0", default-features = false }
scale = { package = "parity-scale-codec", version = "3", default-features = false, features = ["derive"] }
scale-info = { version = "2.6", default-features = false, features = ["derive"], optional = true }
```

## 9. Testing Strategy

### Unit Testing
- Smart contract unit tests
- Frontend component tests
- Backend API tests

### Integration Testing
- Cross-chain communication tests
- IPFS integration tests
- Web2 API integration tests

### Security Testing
- Smart contract audits
- Penetration testing
- Privacy validation

## 10. Deployment Architecture

### Production Environment
- **Frontend**: Vercel or Netlify
- **Backend**: Railway or Heroku
- **IPFS**: Pinata or Infura
- **Blockchain**: Astar Network mainnet

### Development Environment
- **Local**: Docker containers
- **Testnet**: Astar Shibuya testnet
- **IPFS**: Local IPFS node
- **CI/CD**: GitHub Actions

This architecture provides a robust foundation for building MyDataVault while ensuring scalability, security, and user privacy.