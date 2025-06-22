module.exports = {
    phonepe: {
        // PhonePe Sandbox Credentials
        merchantId: process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT',
        merchantUserId: process.env.PHONEPE_MERCHANT_USER_ID || 'MUID123',
        // Test Salt Key from PhonePe Documentation
        saltKey: process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
        saltIndex: process.env.PHONEPE_SALT_INDEX || '1',
        // PhonePe Sandbox API Endpoint
        apiEndpoint: process.env.PHONEPE_API_ENDPOINT || 'https://api-preprod.phonepe.com/apis/pg-sandbox',
        // Test redirect URL
        redirectUrl: process.env.PHONEPE_REDIRECT_URL || 'http://localhost:3000/api/payments/phonepe/callback',
        callbackUrl: process.env.PHONEPE_CALLBACK_URL || 'http://localhost:3000/api/payments/phonepe/callback'
    },
    googlepay: {
        // Google Pay Test Environment Credentials
        merchantId: process.env.GOOGLEPAY_MERCHANT_ID || 'TEST_MERCHANT_ID',
        merchantName: process.env.GOOGLEPAY_MERCHANT_NAME || 'Vibha Agro Dairy Test',
        environment: 'TEST',
        // Test Gateway Configuration
        gateway: {
            merchantId: 'TEST_GATEWAY_MERCHANT_ID',
            gatewayName: 'example',
            // Test Gateway Parameters
            parameters: {
                'gateway': 'example',
                'gatewayMerchantId': 'exampleTestGatewayMerchantId'
            }
        }
    }
}; 