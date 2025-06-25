// Connectivity Test Utility
class ConnectivityTest {
    static async testServerConnection() {
        console.log('🔍 Testing server connectivity...');
        
        try {
            // Test the basic admin test endpoint
            const response = await fetch('/admin/test', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Server connection successful:', data);
                return { success: true, message: 'Server is running' };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('❌ Server connection failed:', error);
            
            let message = 'Server connection failed';
            
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                message = 'Server request timed out - server may be down';
            } else if (error.message.includes('Failed to fetch')) {
                message = 'Cannot reach server - check if backend is running on port 3000';
            } else if (error.message.includes('HTTP')) {
                message = `Server error: ${error.message}`;
            }
            
            return { success: false, message, error: error.message };
        }
    }
    
    static async testDatabaseConnection() {
        console.log('🔍 Testing database connectivity...');
        
        try {
            // Test dashboard stats endpoint which requires database
            const response = await fetch('/admin/dashboard-stats', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(8000) // 8 second timeout for DB queries
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Database connection successful');
                return { success: true, message: 'Database is connected' };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            
            let message = 'Database connection failed';
            
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                message = 'Database query timed out - check MySQL connection';
            } else if (error.message.includes('500')) {
                message = 'Database server error - check MySQL is running';
            } else {
                message = `Database error: ${error.message}`;
            }
            
            return { success: false, message, error: error.message };
        }
    }
    
    static async runFullDiagnostic() {
        console.log('🚀 Running full connectivity diagnostic...');
        
        const results = {
            server: await this.testServerConnection(),
            database: await this.testDatabaseConnection()
        };
        
        console.log('📋 Diagnostic Results:', results);
        
        // Show diagnostic results to user if there are issues
        if (!results.server.success || !results.database.success) {
            this.showDiagnosticResults(results);
        }
        
        return results;
    }
    
    static showDiagnosticResults(results) {
        const diagnosticDiv = document.createElement('div');
        diagnosticDiv.id = 'connectivity-diagnostic';
        diagnosticDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fff;
            border: 2px solid #dc3545;
            border-radius: 8px;
            padding: 20px;
            max-width: 400px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            font-family: 'Manjari', sans-serif;
        `;
        
        diagnosticDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #dc3545;">🔧 Connectivity Issues Detected</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Server:</strong> 
                <span style="color: ${results.server.success ? '#28a745' : '#dc3545'}">
                    ${results.server.success ? '✅ Connected' : '❌ ' + results.server.message}
                </span>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Database:</strong> 
                <span style="color: ${results.database.success ? '#28a745' : '#dc3545'}">
                    ${results.database.success ? '✅ Connected' : '❌ ' + results.database.message}
                </span>
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; font-size: 14px; color: #666;">
                <strong>Troubleshooting:</strong><br>
                1. Ensure the backend server is running on port 3000<br>
                2. Check that MySQL database is running<br>
                3. Verify database connection settings in backend/.env
            </div>
        `;
        
        document.body.appendChild(diagnosticDiv);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (diagnosticDiv.parentElement) {
                diagnosticDiv.remove();
            }
        }, 30000);
    }
}

// Make globally available
window.ConnectivityTest = ConnectivityTest;
