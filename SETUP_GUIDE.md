# UniVault Frontend-Backend Connection Setup Guide

## Overview
This guide will help you connect the frontend customer dashboard to the backend API and database to display real customer data.

## Prerequisites
1. MySQL database server running
2. Node.js installed (version 14 or higher)
3. The database schema has been created and populated with data

## Step 1: Database Setup

### 1.1 Create the Database
Run the database setup scripts in order:

```bash
# Navigate to the database directory
cd 3_database

# Create the database and schema
mysql -u root -p < 00_create_database.sql
mysql -u root -p < 01_schema_improved.sql
mysql -u root -p < 02_seed_data_improved.sql
```

### 1.2 Verify Database Connection
Make sure you can connect to the database:
```bash
mysql -u root -p univault_schema
```

## Step 2: Backend Setup

### 2.1 Install Dependencies
```bash
# Navigate to the backend directory
cd 2_backend

# Install Node.js dependencies
npm install
```

### 2.2 Configure Environment Variables
Create a `.env` file in the `2_backend` directory with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_DATABASE=univault_schema
DB_PORT=3306

# API Configuration
PORT=3000
NODE_ENV=development

# External API Keys (optional)
COUNTRY_STATE_CITY_API_KEY=NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA==
```

**Important:** Replace `your_mysql_password_here` with your actual MySQL password.

### 2.3 Start the Backend Server
```bash
# Start the development server
npm run dev

# Or for production
npm start
```

The server should start on `http://localhost:3000`

### 2.4 Test the API
You can test the API endpoints using the provided test script:
```bash
npm test
```

## Step 3: Frontend Setup

### 3.1 Access the Profile Page
The profile page is now configured to fetch data from the backend. You can access it in several ways:

1. **Direct URL with CIF parameter:**
   ```
   http://localhost:3000/Dashboard-Customer/profile.html?cif=1
   ```

2. **From login flow:** The login system should store the CIF number in localStorage/sessionStorage

### 3.2 Test Data Display
The profile page will automatically:
- Fetch customer data from the API
- Display personal information
- Show contact details
- Display employment information
- Show fund sources and aliases

## Step 4: Available API Endpoints

### Customer Data Endpoints
- `GET /api/customer/:cif_number` - Get basic customer info
- `GET /api/customer/all/:cif_number` - Get all customer data (recommended)

### Authentication Endpoints
- `POST /register` - Register new customer
- `POST /login` - Customer login

### File Upload Endpoints
- `POST /upload` - Upload documents

## Step 5: Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `.env` file
   - Ensure the database exists: `univault_schema`

2. **CORS Errors**
   - The backend is configured with CORS headers
   - Make sure you're accessing via `http://localhost:3000`

3. **CIF Number Not Found**
   - Check URL parameters: `?cif=1`
   - Verify localStorage/sessionStorage has CIF number
   - Ensure the customer exists in the database

4. **API Endpoint Not Found**
   - Verify the backend server is running
   - Check the API base URL in `profile.js` (should be `http://localhost:3000`)

### Debug Steps

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for JavaScript errors
   - Check Network tab for API calls

2. **Check Backend Logs**
   - Monitor the terminal where the backend is running
   - Look for error messages

3. **Test API Directly**
   ```bash
   curl http://localhost:3000/api/customer/all/1
   ```

## Step 6: Sample Data

The database includes sample customer data with CIF numbers 1-10. You can test with:
- CIF 1: John Doe
- CIF 2: Jane Smith
- etc.

## Step 7: Next Steps

Once the basic connection is working:

1. **Add more customer data** to the database
2. **Implement authentication flow** to automatically set CIF number
3. **Add error handling** for missing data
4. **Implement data updates** through the frontend
5. **Add loading states** and better UX

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all prerequisites are met
3. Ensure the database has data
4. Test API endpoints directly
5. Check the backend logs for errors 