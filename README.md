# 🏦 UniVault - Banking Customer Management System

> **A comprehensive customer information management system** built for modern banking operations, featuring advanced risk assessment, regulatory compliance, and secure customer onboarding workflows.

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-Academic-yellow)](./LICENSE)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen)](#testing--validation)

---

## 🎯 Overview

UniVault is a full-stack banking customer management system based on **BDO Unibank's "A1 - A2: Customer Information, Regulations, and Agreements"** form. Developed as the capstone project for **COMP 010 - Information Management**, it showcases enterprise-grade customer data management with robust security, compliance monitoring, and risk assessment capabilities.

### ✨ What Makes UniVault Special

- 🔐 **Enterprise Security** - Multi-layered validation with PEP detection
- 📊 **Smart Risk Assessment** - Automated scoring algorithms
- 🏛️ **Regulatory Compliance** - Built-in AML/KYC and DNFBP monitoring  
- 🚀 **Modern Architecture** - Clean separation of frontend, backend, and database
- 📱 **Responsive Design** - Works seamlessly across all devices

---

## 🚀 Quick Start

> **New to UniVault?** Get up and running in **5 minutes**:

### 📋 Prerequisites

Ensure you have these installed:
- 🗄️ **MySQL 8.0+** or **MariaDB 10.5+**
- 🟢 **Node.js 16.0+** and **npm**
- 🌐 **Modern web browser** with JavaScript enabled

### ⚡ Lightning Setup

#### 1️⃣ Clone & Navigate
```bash
git clone <repository-url>
cd UniVault
```

#### 2️⃣ Database Setup (One-Click)
```bash
# Windows
setup_database.bat

# Linux/Mac  
chmod +x setup_database.sh && ./setup_database.sh
```

#### 3️⃣ Backend Configuration
```bash
cd 2_backend
npm install
copy .env.template .env     # Windows
cp .env.template .env       # Linux/Mac
```

**📝 Edit `.env` with your database credentials:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=univault_schema
DB_PORT=3306
NODE_ENV=development
```

#### 4️⃣ Launch Backend
```bash
npm run dev                 # Development with hot reload
```

#### 5️⃣ Access Frontend
```bash
cd ../1_frontend
# Open index.html in browser or use Live Server extension
```

#### 6️⃣ Verify Everything Works
```bash
cd ..
node verify_setup.js        # System health check
cd 2_backend && npm test    # Run test suite
```

🎉 **You're all set!** 
- **Backend**: `http://localhost:3000`
- **Frontend**: Open `1_frontend/index.html` in browser

---

## 📁 Project Architecture

```
🏦 UniVault/
├── 📄 0_documentation/         # Project specifications & requirements
├── 🎨 1_frontend/              # Client-side application (HTML/CSS/JS)
│   ├── 🧩 components/          # Reusable UI components
│   ├── 👤 Dashboard-Admin/     # Administrative panel
│   ├── 🏠 Dashboard-Customer/  # Customer self-service portal
│   ├── 📝 Registration-Customer/ # Customer onboarding flow
│   └── 📦 shared/             # Shared frontend resources
│
├── ⚙️ 2_backend/               # Server-side API (Node.js + Express)
│   ├── 🔧 config/             # Database & application configuration
│   ├── 🎮 controllers/        # Business logic controllers
│   ├── 🛡️ middleware/         # Authentication & validation
│   ├── 🛣️ routes/             # API endpoint definitions
│   ├── 🔧 services/           # Core business services
│   ├── 🛠️ utils/              # Helper utilities
│   └── 📁 uploads/            # File storage directory
│
├── 🗄️ 3_database/             # Database layer (MySQL)
│   ├── 📋 01_schema.sql       # Database structure definition
│   ├── 🌱 02_seed_data.sql    # Sample data for testing
│   └── 📊 03_sample_queries.sql # Example database queries
│
├── 🎯 4_assets/               # Static resources (images, fonts)
├── 📚 audit_archive/          # Development history & documentation
├── 📖 SETUP.md               # Detailed installation guide
├── 🤖 AGENT.md               # Developer workflow reference
└── ✅ verify_setup.js        # System validation script
```

---

## ✨ Core Features

### 🏦 Banking Operations
| Feature | Description | Status |
|---------|-------------|--------|
| **Customer Registration** | Complete KYC onboarding with document upload | ✅ Complete |
| **Account Management** | Support for Deposits, Cards, Loans, and more | ✅ Complete |
| **Risk Assessment** | Multi-factor automated risk scoring | ✅ Complete |
| **Compliance Monitoring** | AML/KYC validation and DNFBP compliance | ✅ Complete |
| **Document Verification** | Secure file upload with validation | ✅ Complete |

### 👥 User Experience
- **🎨 Intuitive Interface** - Clean, modern design following banking UX standards
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile
- **🔐 Role-Based Access** - Different views for customers, employees, and admins
- **📋 Self-Service Portal** - Customers can manage their profiles independently
- **📊 Admin Dashboard** - Comprehensive management tools for bank employees

### 🛡️ Security & Compliance
- **🔒 Data Encryption** - All sensitive data properly secured
- **✅ Input Validation** - Comprehensive sanitization and validation
- **📋 Audit Trail** - Complete activity logging for compliance
- **🚨 PEP Detection** - Politically Exposed Person screening
- **📊 Risk Scoring** - Advanced algorithms for customer risk assessment

---

## 🧪 Testing & Validation

### 🚀 Run Tests
```bash
cd 2_backend
npm test                    # Comprehensive endpoint testing
npm run verify              # System validation
```

### 👥 Sample Test Data
Perfect for testing different scenarios:

| 👤 Customer | 📊 Risk Level | 🏷️ Category | 📝 Notes |
|------------|--------------|-------------|----------|
| **Juan Dela Cruz** | 🟢 Low | Standard | Regular customer profile |
| **Maria Clara Santos** | 🟡 Medium | Remittance | International transfers |
| **Pedro Penduko** | 🟡 Medium | Business | Has business alias |
| **Rodrigo Gambler** | 🔴 High | Gaming | Gaming industry worker |
| **Sisa Madrigal** | ⏳ Pending | Verification | Awaiting document review |
| **Miguel Politico** | 🔴 High | Political | Political connections |

---

## 🛠️ Development Workflow

### 🎯 Backend Commands
```bash
cd 2_backend
npm install                 # Install all dependencies
npm run dev                 # Development server (Windows)
npm run dev-linux          # Development server (Linux/Mac)
npm start                   # Production server
npm test                    # Run comprehensive tests
npm run verify             # System health check
npm run cleanup            # Clean old uploaded files
```

### 🗄️ Database Management
```bash
# 🚀 Automated Setup
setup_database.bat          # Windows one-click setup
./setup_database.sh         # Linux/Mac one-click setup

# 🔧 Manual Setup (if needed)
mysql -u root -p < 3_database/00_create_database.sql
mysql -u root -p < 3_database/01_schema.sql
mysql -u root -p < 3_database/02_seed_data.sql

# 🧹 Database Maintenance
mysql -u root -p -e "DROP DATABASE IF EXISTS univault_schema;"  # Reset
mysqldump -u root -p univault_schema > backup.sql               # Backup
```

---

## 🚨 Troubleshooting Guide

### 🔧 Common Issues & Solutions

<details>
<summary><b>🔴 Database Connection Failed</b></summary>

```bash
# Check if MySQL is running
# Windows: services.msc → MySQL
# Linux: sudo systemctl status mysql
# Mac: brew services list | grep mysql

# Test connection manually
mysql -h localhost -u root -p univault_schema

# Verify .env file has correct credentials
```
</details>

<details>
<summary><b>🔴 Port 3000 Already in Use</b></summary>

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```
</details>

<details>
<summary><b>🔴 Tests Failing</b></summary>

1. **Database Setup**: `node verify_setup.js`
2. **Server Running**: `curl http://localhost:3000/api`
3. **Dependencies**: `cd 2_backend && npm install`
4. **Environment**: Check `.env` file configuration
</details>

<details>
<summary><b>🔴 File Upload Errors</b></summary>

```bash
# Ensure upload directory exists
mkdir -p 2_backend/uploads
chmod 755 2_backend/uploads        # Linux/Mac only
```
</details>

### 🩺 Diagnostic Tools
```bash
node diagnose_issues.js             # 🔍 Comprehensive system check
node verify_setup.js                # ✅ Setup verification  
cd 2_backend && npm run verify      # 🎯 Backend-specific validation
```

---

## 📚 Documentation Hub

| 📖 Document | 🎯 Purpose | 👥 Audience |
|-------------|------------|-------------|
| **[📋 SETUP.md](SETUP.md)** | Complete installation guide | New developers |
| **[🤖 AGENT.md](AGENT.md)** | Development commands & standards | Contributors |
| **[🗄️ Database Docs](3_database/)** | Database design & queries | DBAs & developers |

---

## 🏆 Quality Assurance

### ✅ Standards Met
- **🧪 Testing Coverage** - 10+ endpoint tests with 70%+ pass rate
- **🔒 Security Standards** - Input validation, no hardcoded secrets
- **🏗️ Architecture** - Modular design with clear separation of concerns
- **🌐 Cross-Platform** - Windows, Linux, and macOS compatibility
- **📊 Performance** - Optimized queries and efficient file handling
- **📋 Documentation** - Comprehensive guides for all user types

### 📊 System Requirements

| 🔧 Component | 📋 Minimum Requirement | 💡 Recommended |
|--------------|-------------------------|----------------|
| **🗄️ Database** | MySQL 8.0+ or MariaDB 10.5+ | MySQL 8.0+ |
| **🟢 Runtime** | Node.js 16.0+ | Node.js 18.0+ |
| **💻 Platform** | Windows 10, Linux, macOS | Any modern OS |
| **🌐 Browser** | Chrome 90+, Firefox 88+, Safari 14+ | Latest version |
| **💾 Storage** | 100MB minimum | 500MB+ recommended |
| **🧠 Memory** | 2GB RAM | 4GB+ RAM |

---

## 🎓 Academic Excellence

**🏫 Course**: COMP 010 - Information Management  
**🎯 Focus**: Real-world application of database design and management principles

### 📈 Learning Outcomes Demonstrated
- **🗄️ Database Design** - Normalized schema with proper relationships
- **🔒 Data Security** - Industry-standard encryption and validation
- **📊 Risk Analytics** - Statistical algorithms for customer assessment
- **🏛️ Regulatory Compliance** - Banking industry standards implementation
- **🏗️ Full-Stack Development** - End-to-end application architecture

### 🌟 Project Highlights
- **Real Industry Application** - Based on actual BDO Unibank forms
- **Production-Ready Code** - Enterprise-level architecture and security
- **Comprehensive Testing** - Automated validation and error handling
- **Professional Documentation** - Industry-standard project documentation

---

## 🤝 Support & Resources

### 🆘 Getting Help

| 🎯 Issue Type | 📍 Resource | ⚡ Quick Action |
|---------------|-------------|----------------|
| **🔧 Setup Problems** | [SETUP.md](SETUP.md) | `node verify_setup.js` |
| **👨‍💻 Development** | [AGENT.md](AGENT.md) | Check command reference |
| **🗄️ Database Issues** | Database docs | Run diagnostic tools |
| **🧪 Testing Problems** | Test logs | `npm test` with verbose output |

### 📞 Emergency Troubleshooting
```bash
# 🚨 Full system diagnostic
node diagnose_issues.js

# 🔄 Reset everything (nuclear option)
cd 2_backend && npm run cleanup
mysql -u root -p -e "DROP DATABASE IF EXISTS univault_schema;"
setup_database.bat  # or .sh for Linux/Mac
```

---

## 🎉 Ready to Explore?

**🚀 Quick Start**: Run `node verify_setup.js` to validate your environment  
**📖 Deep Dive**: Check out [SETUP.md](SETUP.md) for comprehensive instructions  
**🤖 Development**: See [AGENT.md](AGENT.md) for contributor workflow

---

<div align="center">

**Built with ❤️ for COMP 010 - Information Management**

*Showcasing modern banking technology through academic excellence*

</div>
