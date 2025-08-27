// Test script to verify frontend-backend connectivity
const API_BASE_URL = 'http://localhost:5002';

async function testEndpoints() {
    console.log('🔧 Testing DermAI Frontend-Backend Connection');
    console.log('================================================');
    
    const tests = [
        { name: 'Health Check', url: `${API_BASE_URL}/api/health` },
        { name: 'Chat Health Check', url: `${API_BASE_URL}/api/chat/health` },
        { name: 'Model Status', url: `${API_BASE_URL}/api/model-status` },
        { name: 'Test Endpoint', url: `${API_BASE_URL}/api/test` }
    ];
    
    for (const test of tests) {
        try {
            const response = await fetch(test.url);
            const data = await response.json();
            
            console.log(`✅ ${test.name}: ${response.status} OK`);
            console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
            console.log('');
        } catch (error) {
            console.log(`❌ ${test.name}: Failed`);
            console.log(`   Error: ${error.message}`);
            console.log('');
        }
    }
    
    // Test chat functionality
    console.log('🗨️ Testing Chat Functionality');
    console.log('--------------------------------');
    
    try {
        const chatResponse = await fetch(`${API_BASE_URL}/api/chat/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Hello, this is a test message',
                user_id: 'test_user'
            }),
        });
        
        const chatData = await chatResponse.json();
        console.log(`✅ Chat POST: ${chatResponse.status} OK`);
        console.log(`   Response: ${JSON.stringify(chatData, null, 2)}`);
    } catch (error) {
        console.log(`❌ Chat POST: Failed`);
        console.log(`   Error: ${error.message}`);
    }
    
    console.log('\n🎯 Frontend-Backend Connection Test Complete!');
}

// For Node.js testing
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    testEndpoints();
} else {
    // Browser environment
    window.testDermAI = testEndpoints;
    console.log('Run testDermAI() in browser console to test');
}
