# UniVault Backend API

A Node.js/Express backend server for the UniVault banking application.

## Project Structure

```
2_backend/
├── config/
│   ├── database.js      # Database connection configuration
│   └── multer.js        # File upload configuration
├── middleware/
│   └── errorHandler.js  # Global error handling middleware
├── routes/
│   ├── auth.js          # Authentication routes (login)
│   ├── customer.js      # Customer data retrieval routes
│   ├── registration.js  # Customer registration routes
│   └── upload.js        # File upload routes
├── utils/
│   └── fieldMapper.js   # Helper functions for data mapping
├── uploads/             # File upload storage directory
├── .env                 # Environment variables (not in git)
├── .env.template        # Environment variables template
├── package.json         # Dependencies and scripts
├── server.js            # Main server file
└── README.md           # This file
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.template .env
   # Edit .env with your database credentials
   ```

3. **Start the Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## Environment Variables

Required variables in `.env`:
- `DB_HOST` - Database host (default: 127.0.0.1)
- `DB_USER` - Database username (default: root)
- `DB_PASSWORD` - Database password
- `DB_DATABASE` - Database name (default: univault_schema)
- `DB_PORT` - Database port (default: 3306)
- `PORT` - Server port (default: 3000)

## API Endpoints

### Authentication
- `POST /login` - User login
- `POST /register` - User registration

### Customer Data
- `GET /api/customer/:cif_number` - Get basic customer info
- `GET /api/customer/all/:cif_number` - Get all customer data

### File Upload
- `POST /upload` - Upload files (images, documents)

### Utility
- `GET /api` - API information and available endpoints
- `GET /` - Health check

## Database Schema

The backend expects the following database tables:
- `customer` - Main customer information
- `CUSTOMER_ADDRESS` - Customer addresses
- `CUSTOMER_ID` - Customer identification documents
- `CUSTOMER_CONTACT_DETAILS` - Contact information
- `CUSTOMER_EMPLOYMENT_INFORMATION` - Employment details
- `CUSTOMER_FUND_SOURCE` - Fund source information
- `CUSTOMER_WORK_NATURE` - Work nature details
- `CUSTOMER_ALIAS` - Customer aliases

## Error Handling

The application uses centralized error handling with:
- Specific error codes for database constraint violations
- Detailed error messages in development mode
- Consistent error response format

## File Upload

Files are stored locally in the `uploads/` directory with unique timestamps.
Future enhancement: AWS S3 integration (see `aws_upload_example.js` for reference).

## Security

- Passwords are hashed using bcrypt
- Environment variables for sensitive data
- Input validation for all endpoints
- SQL injection protection through parameterized queries
