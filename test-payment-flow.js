const axios = require('axios');

async function testPaymentFlow() {
    try {
        console.log('\n1. Creating a test bill...');
        const billResponse = await axios.post('http://localhost:3000/api/test/create-bill');
        const testBill = billResponse.data;
        console.log('Test bill created:', testBill);

        console.log('\n2. Initiating PhonePe payment...');
        const phonepeResponse = await axios.post('http://localhost:3000/api/payments/phonepe/initiate', {
            amount: testBill.dueAmount,
            billId: testBill.id,
            customerName: testBill.customerName
        });
        console.log('PhonePe payment initiated:', phonepeResponse.data);

        if (phonepeResponse.data.data?.instrumentResponse?.redirectInfo?.url) {
            console.log('\nPhonePe Test Payment URL:', phonepeResponse.data.data.instrumentResponse.redirectInfo.url);
            console.log('\nTest Instructions:');
            console.log('1. Open the above URL in your browser');
            console.log('2. Use these test credentials:');
            console.log('   - Mobile Number: 9999999999');
            console.log('   - UPI ID: test@phonepe');
            console.log('   - OTP: 123456');
        }

        // Simulate payment completion (in real scenario, this happens through the callback)
        console.log('\n3. Simulating payment completion...');
        const verifyResponse = await axios.post('http://localhost:3000/api/payments/phonepe/callback', {
            transactionId: phonepeResponse.data.merchantTransactionId
        });
        console.log('Payment verification result:', verifyResponse.data);

        // Check updated bill status
        console.log('\n4. Checking updated bill status...');
        const billsResponse = await axios.get('http://localhost:3000/api/monthly-bills');
        const updatedBill = billsResponse.data.find(bill => bill.id === testBill.id);
        console.log('Updated bill status:', updatedBill);

        console.log('\n5. Testing Google Pay payment...');
        const googlepayResponse = await axios.post('http://localhost:3000/api/payments/googlepay/process', {
            paymentToken: 'TEST_TOKEN',
            amount: 500, // Testing partial payment
            billId: testBill.id
        });
        console.log('Google Pay payment result:', googlepayResponse.data);

        console.log('\nTest completed successfully!');
    } catch (error) {
        console.error('Error during test:', error.response?.data || error.message);
    }
}

// Run the test
testPaymentFlow(); 