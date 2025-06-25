# 🛠️ Troubleshooting Guide for Admin Panel Loading Issues

## Quick Diagnosis

If admin pages are stuck on "Loading...", follow these steps:

### 1. Check Backend Server Status
```bash
cd 2_backend
node test-server.js
```

This will test:
- Database connectivity
- Admin routes loading
- Basic server health

### 2. Start Backend Server (if not running)
```bash
cd 2_backend
npm run dev         # Windows
npm run dev-linux   # Linux/Mac
```

Server should start on http://localhost:3000

### 3. Check Browser Console (F12)

Open DevTools in browser and look for:
- ❌ **Network errors**: Failed fetch requests to `/admin/*` endpoints
- ❌ **CORS errors**: Cross-origin request blocked
- ❌ **Timeout errors**: Requests taking longer than 10 seconds
- ❌ **JSON parse errors**: Server returning HTML instead of JSON

### 4. Common Issues & Solutions

#### Issue: "Failed to fetch" errors
**Cause**: Backend server not running
**Solution**: Start the backend server with `npm run dev`

#### Issue: "HTTP 500" errors  
**Cause**: Database connection failed
**Solution**: 
- Check MySQL is running
- Verify .env database credentials
- Ensure `univault_schema` database exists

#### Issue: "Request timed out"
**Cause**: Slow database queries or network issues
**Solution**:
- Check database performance
- Restart MySQL server
- Check network connectivity

#### Issue: "JSON parse error"
**Cause**: Server returning HTML error page instead of JSON
**Solution**:
- Check server logs for route errors
- Verify admin routes are properly loaded
- Check Express middleware configuration

## 🔧 Advanced Debugging

### Server Health Check
```bash
cd 2_backend
node test-server.js
```

### Database Direct Test
```bash
cd 2_backend
mysql -u root -p univault_schema
SELECT COUNT(*) FROM CUSTOMER;
SELECT COUNT(*) FROM BANK_EMPLOYEE;
```

### Check Specific Endpoints
Test these URLs directly in browser:
- http://localhost:3000/admin/test
- http://localhost:3000/admin/dashboard-stats
- http://localhost:3000/admin/customers
- http://localhost:3000/admin/employees

### Network Tab Analysis
In browser DevTools > Network tab, check:
- Status codes (should be 200)
- Response times (should be < 5 seconds)
- Response headers (Content-Type: application/json)
- Response body (should be valid JSON)

## 🚨 Emergency Reset

If all else fails:

1. **Restart everything**:
   ```bash
   # Stop MySQL
   sudo service mysql stop
   sudo service mysql start
   
   # Restart backend
   cd 2_backend
   npm run dev
   ```

2. **Clear browser cache**:
   - Ctrl+Shift+R (hard refresh)
   - Clear browser cache and cookies for localhost

3. **Check system resources**:
   - Available memory
   - CPU usage
   - Disk space

## 📊 Performance Monitoring

The updated admin pages now include:
- ✅ **10-second timeouts** on all requests
- ✅ **Detailed console logging** for debugging
- ✅ **Automatic connectivity tests** on page load
- ✅ **User-friendly error messages** with retry buttons
- ✅ **Loading state management** that never hangs indefinitely

## 🔍 Log Analysis

Check these log outputs in browser console:
- `🚀 Admin [Page] initializing...` - Page startup
- `🔍 Testing server connectivity...` - Connectivity test
- `✅ Server connection successful` - Backend is reachable
- `✅ Database connection successful` - Database is working
- `📡 [Data] response status: 200` - API requests successful
- `✅ Loaded X items successfully` - Data loaded correctly

If you see ❌ errors instead of ✅ success messages, that indicates the specific problem area.
