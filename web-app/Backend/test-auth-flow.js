import axios from 'axios';
import fs from 'fs';

async function runTests() {
    console.log('--- Testing Auth Flow ---');
    try {
        console.log('1. Testing Sign Up...');
        const signupRes = await axios.post('http://localhost:5000/api/auth/signup', {
            name: 'Test Setup User',
            email: `test_${Date.now()}@example.com`,
            password: 'password123'
        });
        console.log('Sign Up Response:', signupRes.status, signupRes.data.name);

        const cookies = signupRes.headers['set-cookie'];
        console.log('Received Cookies on Signup:', cookies ? 'YES' : 'NO');

        console.log('2. Testing /me endpoint with cookies...');
        const meRes = await axios.get('http://localhost:5000/api/auth/me', {
            headers: {
                Cookie: cookies ? cookies[0] : ''
            }
        });
        console.log('/me Response:', meRes.status, meRes.data.name);

        console.log('3. Testing Logout...');
        const logoutRes = await axios.post('http://localhost:5000/api/auth/logout', {}, {
            headers: { Cookie: cookies ? cookies[0] : '' }
        });
        console.log('Logout Response:', logoutRes.status);

        console.log('--- All Auth Tests Passed! ---');
    } catch (err) {
        fs.writeFileSync('debug-api-err.txt', err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.stack || err.toString());
        console.error('Test Failed: ERROR WRITTEN TO debug-api-err.txt');
    }
}

runTests();
