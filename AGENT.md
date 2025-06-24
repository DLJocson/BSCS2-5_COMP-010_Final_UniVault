# UniVault Project - Agent Instructions

## Project Structure
- `1_frontend/` - Frontend HTML/CSS/JS files
- `2_backend/` - Node.js backend API server
- `3_database/` - Database schema and scripts
- `4_assets/` - Static assets and images

## Backend Commands (2_backend/)

### Development
```bash
cd 2_backend
npm install          # Install dependencies
npm run dev         # Start development server with detailed logging (Windows)
npm run dev-linux   # Start development server (Linux/Mac)
npm start           # Start production server
```

### Testing
```bash
npm test            # Run endpoint tests
npm run test-dry    # Dry run test (same as test)
npm run verify      # Verify database and server setup
```

### Maintenance
```bash
npm run cleanup-dry # Preview old file cleanup
npm run cleanup     # Clean up old uploaded files
```

### Direct Scripts
```bash
node test-endpoints.js              # Test all API endpoints
node scripts/cleanup-uploads.js     # Cleanup upload files
node ../verify_setup.js             # Verify complete setup
```

## Environment Setup

### Required Environment Variables (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_DATABASE=univault_schema
DB_PORT=3306
COUNTRY_STATE_CITY_API_KEY=your_api_key
NODE_ENV=development
```

## Database Commands
- Database schema should be in `3_database/`
- Ensure `univault_schema` database exists before starting server

## Testing
- Server must be running on port 3000 for tests to work
- Tests cover all endpoints, validation, and error handling
- Results saved to `2_backend/test-results.json`

## Code Quality Standards
- Use environment-based logging (NODE_ENV)
- Validate all inputs before processing
- Use standardized error responses
- Follow modular architecture patterns

## File Upload Management
- Uploads stored in `2_backend/uploads/`
- Regular cleanup recommended (30-day retention default)
- File validation: JPEG, PNG, PDF only, 5MB max

## Backend Architecture
- **Routes**: API endpoint definitions
- **Services**: Business logic layer
- **Utils**: Reusable utility functions
- **Middleware**: Error handling and validation
- **Config**: Database and file upload configuration

## Recent Improvements (Backend Audit)
- ✅ Modular registration service
- ✅ Comprehensive input validation
- ✅ Optimized database queries
- ✅ Standardized error handling
- ✅ Cross-platform file path handling
- ✅ Automated testing suite
- ✅ File cleanup utilities
