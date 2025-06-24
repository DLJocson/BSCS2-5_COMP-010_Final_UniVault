# 🏦 UniVault Local Development Setup

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- Git

## Step 1: Database Setup

1. **Start MySQL Server**
   ```bash
   # Windows (using XAMPP/WAMP or MySQL Workbench)
   # or using MySQL command line
   mysql -u root -p
   ```

2. **Create Database and Import Schema**
   ```sql
   -- In MySQL command line or Workbench
   SOURCE c:/Users/louie/Documents/Github/COMP010_BSCS25_G4_UniVault/3_database/01_schema.sql;
   SOURCE c:/Users/louie/Documents/Github/COMP010_BSCS25_G4_UniVault/3_database/02_seed_data.sql;
   ```

## Step 2: Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd "C:\Users\louie\Documents\Github\COMP010_BSCS25_G4_UniVault\2_backend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   Create a `.env` file in the `2_backend` directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_DATABASE=univault_schema
   DB_PORT=3306
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

## Step 3: Test the Setup

1. **Check Backend API**
   - Open browser: http://localhost:3000/api
   - Should show API endpoints list

2. **Check Frontend**
   - Open browser: http://localhost:3000/Registration-Customer/entry.html
   - Should load the registration entry page

3. **Check Database Connection**
   - Look at console output for "Connected to MySQL database!" message

## Step 4: File Upload Directory

The system automatically creates an `uploads` directory in `2_backend/uploads/` for image storage.

## Common Issues

1. **Database Connection Failed**
   - Check MySQL server is running
   - Verify credentials in `.env` file
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes on port 3000

3. **File Upload Issues**
   - Ensure `uploads` directory has write permissions

## Development Commands

```bash
# Start development server
npm run dev

# Install new dependencies
npm install package-name

# Check database connection
# Server will log connection status on startup
```

## Project Structure

```
UniVault/
├── 1_frontend/Registration-Customer/  # Frontend files
├── 2_backend/                         # Node.js backend
│   ├── config/                        # Database & multer config
│   ├── routes/                        # API endpoints
│   ├── uploads/                       # Uploaded images
│   └── server.js                      # Main server file
└── 3_database/                        # SQL schema & seed data
```

## Next Steps

After setup, you can:
1. Test the registration flow end-to-end
2. Check data saving in database
3. Test image upload functionality
