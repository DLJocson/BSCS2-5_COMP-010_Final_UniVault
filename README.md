# UniVault - Banking Customer Management System

A comprehensive customer information management system based on BDO Unibank's "A1 - A2: Customer Information, Regulations, and Agreements" form. Developed as a final project for COMP 010 - Information Management course, this system provides a scalable and secure solution for banking customer data management with advanced risk assessment and compliance features.

## 🚀 Quick Setup

**New to UniVault?** Follow these steps:

1. **Prerequisites**: Ensure you have MySQL 8.0+, Node.js 16+, and npm installed
2. **Database Setup**: Run `setup_database.bat` (Windows) or `./setup_database.sh` (Linux/Mac)
3. **Backend Setup**: 
   ```bash
   cd 2_backend
   npm install
   # Create .env file with your database credentials
   npm run dev
   ```
4. **Verify Setup**: Run `node verify_setup.js` or `npm run verify` from backend directory
5. **Test System**: Run `npm test` from backend directory

📖 **For detailed instructions, see [SETUP.md](SETUP.md)**

## 🏗️ Project Structure

```
UniVault/
├── 1_frontend/           # Web frontend interface (HTML/CSS/JS)
├── 2_backend/            # Node.js API server
├── 3_database/           # MySQL database schema and scripts
├── 4_assets/             # Static assets and resources
├── SETUP.md              # Complete setup guide
├── AGENT.md              # Developer commands reference
├── verify_setup.js       # Setup verification script
├── diagnose_issues.js    # Troubleshooting diagnostic tool
└── setup_database.*      # Automated database setup scripts
```

## ✨ Features

### Customer Management
- ✅ Customer registration with validation
- ✅ Profile management and updates
- ✅ Document verification system
- ✅ Multiple address and contact support

### Risk & Compliance
- ✅ Automated risk scoring
- ✅ PEP (Politically Exposed Person) detection
- ✅ DNFBP compliance monitoring
- ✅ AML/KYC validation

### Account Operations
- ✅ Account opening workflow
- ✅ Multi-product support (Deposits, Cards, Loans, etc.)
- ✅ Employee verification requirements
- ✅ Status tracking and management

### Admin Features
- ✅ Review queue management
- ✅ Employee management
- ✅ Audit logging
- ✅ Comprehensive reporting

## 🧪 Testing

The system includes comprehensive testing:

```bash
cd 2_backend
npm test                    # Run all endpoint tests
npm run verify              # Verify complete setup
node ../diagnose_issues.js  # Diagnose common issues
```

## 🛠️ Development Commands

### Backend (2_backend/)
```bash
npm install          # Install dependencies
npm run dev         # Start development server (Windows)
npm run dev-linux   # Start development server (Linux/Mac)
npm test            # Run comprehensive tests
npm run verify      # Verify database and server setup
npm run cleanup     # Clean up old uploaded files
```

### Database Setup
```bash
# Automated setup
setup_database.bat           # Windows
./setup_database.sh          # Linux/Mac

# Manual setup
mysql -u root -p < 3_database/00_create_database.sql
mysql -u root -p < 3_database/01_schema_improved.sql
mysql -u root -p < 3_database/02_seed_data_improved.sql
```

## 📊 Sample Data

The system includes 6 sample customers for testing different risk profiles:

1. **Juan Dela Cruz** - Standard customer (Low risk)
2. **Maria Clara Santos** - Remittance customer (Medium risk)  
3. **Pedro Penduko** - Business owner with alias (Medium risk)
4. **Rodrigo Gambler** - Gaming industry (High risk)
5. **Sisa Madrigal** - Pending verification
6. **Miguel Politico** - Political connection (High risk)

## 🔧 Troubleshooting

**Common Issues:**

1. **Database connection failed**: Run `setup_database.bat` and check `.env` file
2. **Tests failing**: Ensure database is set up and server is running
3. **Port 3000 in use**: Stop other servers or use a different port
4. **Missing dependencies**: Run `npm install` in `2_backend/`

**Diagnostic Tools:**
```bash
node diagnose_issues.js     # Comprehensive system check
node verify_setup.js        # Verify setup completion
```

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Complete setup guide with troubleshooting
- **[AGENT.md](AGENT.md)** - Developer commands and project standards
- **[3_database/DATABASE_AUDIT_REPORT.md](3_database/DATABASE_AUDIT_REPORT.md)** - Database design documentation

## 🏆 Quality Standards

- ✅ Comprehensive input validation
- ✅ Automated testing suite (70%+ pass rate)
- ✅ Modular architecture
- ✅ Cross-platform compatibility
- ✅ Security best practices
- ✅ Detailed audit logging

## 📋 System Requirements

- **Database**: MySQL 8.0+ or MariaDB 10.5+
- **Runtime**: Node.js 16.0+
- **Platform**: Windows, Linux, or macOS
- **Browser**: Modern browser with JavaScript enabled

## 🎓 Academic Context

This project was developed as part of the COMP 010 - Information Management course final requirement. It demonstrates practical application of:

- Database design and normalization
- Customer data management
- Risk assessment algorithms
- Regulatory compliance implementation
- Full-stack web development

---

**Ready to start?** Run `node verify_setup.js` to check your environment, then see [SETUP.md](SETUP.md) for detailed instructions.
