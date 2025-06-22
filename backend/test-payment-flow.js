const axios = require('axios');

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPaymentFlow() {
    try {
        // Wait for server to be ready
        console.log('Waiting for server to be ready...');
        await wait(2000);

        console.log('\n1. Creating a test bill...');
        try {
            const billResponse = await axios.post('http://localhost:3000/api/test/create-bill');
            const testBill = billResponse.data;
            console.log('Test bill created:', JSON.stringify(testBill, null, 2));

            console.log('\n2. Initiating PhonePe payment...');
            const phonepeResponse = await axios.post('http://localhost:3000/api/payments/phonepe/initiate', {
                amount: testBill.dueAmount,
                billId: testBill.id,
                customerName: testBill.customerName
            });
            console.log('PhonePe payment initiated:', JSON.stringify(phonepeResponse.data, null, 2));

            if (phonepeResponse.data.data?.instrumentResponse?.redirectInfo?.url) {
                console.log('\nPhonePe Test Payment URL:', phonepeResponse.data.data.instrumentResponse.redirectInfo.url);
                console.log('\nTest Instructions:');
                console.log('1. Open the above URL in your browser');
                console.log('2. Use these test credentials:');
                console.log('   - Mobile Number: 9999999999');
                console.log('   - UPI ID: test@phonepe');
                console.log('   - OTP: 123456');
            }

            // Wait for a moment before simulating callback
            await wait(2000);

            // Simulate payment completion
            console.log('\n3. Simulating payment completion...');
            const verifyResponse = await axios.post('http://localhost:3000/api/payments/phonepe/callback', {
                transactionId: phonepeResponse.data.merchantTransactionId
            });
            console.log('Payment verification result:', JSON.stringify(verifyResponse.data, null, 2));

            // Wait for a moment before checking bill status
            await wait(1000);

            // Check updated bill status
            console.log('\n4. Checking updated bill status...');
            const billsResponse = await axios.get('http://localhost:3000/api/monthly-bills');
            const updatedBill = billsResponse.data.find(bill => bill.id === testBill.id);
            console.log('Updated bill status:', JSON.stringify(updatedBill, null, 2));

            // Wait before testing Google Pay
            await wait(1000);

            console.log('\n5. Testing Google Pay payment...');
            const googlepayResponse = await axios.post('http://localhost:3000/api/payments/googlepay/process', {
                paymentToken: 'TEST_TOKEN',
                amount: 500, // Testing partial payment
                billId: testBill.id
            });
            console.log('Google Pay payment result:', JSON.stringify(googlepayResponse.data, null, 2));

            console.log('\nTest completed successfully!');
        } catch (error) {
            console.error('API Error:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
        }
    } catch (error) {
        console.error('Fatal error:', error);
    }
}

// Run the test
console.log('Starting payment flow test...');
testPaymentFlow(); 