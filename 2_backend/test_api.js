const http = require('http');

function testReviewQueueAPI() {
    console.log('🔍 Testing Review Queue API...');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/admin/review-queue?type=verification',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    const req = http.request(options, (res) => {
        console.log('📊 Response status:', res.statusCode);
        console.log('📊 Response headers:', res.headers);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('📊 Response body:', data);
            
            if (res.statusCode === 200) {
                try {
                    const jsonData = JSON.parse(data);
                    console.log('✅ JSON parsed successfully');
                    console.log('📊 Full JSON:', JSON.stringify(jsonData, null, 2));
                    console.log('📊 Data count:', jsonData.data ? jsonData.data.length : 'No data array');
                    console.log('📊 Success:', jsonData.success);
                } catch (parseError) {
                    console.log('❌ Failed to parse JSON:', parseError.message);
                }
            } else {
                console.log('❌ API request failed with status:', res.statusCode);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ Error testing API:', error.message);
    });
    
    req.end();
}

testReviewQueueAPI(); 