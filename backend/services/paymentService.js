const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const paymentConfig = require('../config/payment');

class PaymentService {
    constructor() {
        this.phonepeConfig = paymentConfig.phonepe;
        this.googlepayConfig = paymentConfig.googlepay;
    }

    generatePhonePePayload(amount, billId, customerName) {
        const merchantTransactionId = `MT${Date.now()}`;
        const payload = {
            merchantId: this.phonepeConfig.merchantId,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: this.phonepeConfig.merchantUserId,
            amount: amount * 100, // Convert to paise
            redirectUrl: this.phonepeConfig.redirectUrl,
            redirectMode: 'POST',
            callbackUrl: this.phonepeConfig.callbackUrl,
            mobileNumber: '9999999999', // Test mobile number
            paymentInstrument: {
                type: 'PAY_PAGE'
            },
            deviceContext: {
                deviceOS: 'ANDROID' // Test device context
            },
            merchantOrderId: billId,
            customerName: customerName
        };

        return {
            payload,
            merchantTransactionId
        };
    }

    generatePhonePeChecksum(payload) {
        const data = JSON.stringify(payload);
        const concatenatedString = `${data}/pg/v1/pay${this.phonepeConfig.saltKey}`;
        return crypto.createHash('sha256').update(concatenatedString).digest('hex') + '###' + this.phonepeConfig.saltIndex;
    }

    async initiatePhonePePayment(amount, billId, customerName) {
        try {
            const { payload, merchantTransactionId } = this.generatePhonePePayload(amount, billId, customerName);
            const checksum = this.generatePhonePeChecksum(payload);
            
            console.log('Initiating PhonePe payment with payload:', payload);

            // In development mode, simulate the PhonePe response
            if (process.env.NODE_ENV === 'development') {
                console.log('Running in development mode - simulating PhonePe response');
                return {
                    success: true,
                    data: {
                        success: true,
                        code: 'PAYMENT_INITIATED',
                        message: 'Payment initiated successfully',
                        data: {
                            merchantId: this.phonepeConfig.merchantId,
                            merchantTransactionId: merchantTransactionId,
                            instrumentResponse: {
                                type: 'PAY_PAGE',
                                redirectInfo: {
                                    url: `http://localhost:3000/payment-success.html?txnId=${merchantTransactionId}`,
                                    method: 'GET'
                                }
                            }
                        }
                    },
                    merchantTransactionId
                };
            }

            const response = await axios.post(
                `${this.phonepeConfig.apiEndpoint}/pg/v1/pay`,
                {
                    request: Buffer.from(JSON.stringify(payload)).toString('base64')
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-VERIFY': checksum
                    }
                }
            );

            console.log('PhonePe payment initiation response:', response.data);

            return {
                success: true,
                data: response.data,
                merchantTransactionId
            };
        } catch (error) {
            console.error('PhonePe payment initiation error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    async verifyPhonePePayment(transactionId) {
        try {
            // For sandbox testing, always return success
            if (process.env.NODE_ENV !== 'production') {
                console.log('Simulating successful payment in sandbox mode');
                return {
                    success: true,
                    data: {
                        success: true,
                        code: 'PAYMENT_SUCCESS',
                        message: 'Payment successful',
                        data: {
                            merchantId: this.phonepeConfig.merchantId,
                            merchantTransactionId: transactionId,
                            transactionId: `TEST_${transactionId}`,
                            amount: 100,
                            state: 'COMPLETED',
                            responseCode: 'SUCCESS',
                            paymentInstrument: {
                                type: 'UPI',
                                utr: `TEST_UTR_${Date.now()}`
                            }
                        }
                    }
                };
            }

            const concatenatedString = `/pg/v1/status/${this.phonepeConfig.merchantId}/${transactionId}${this.phonepeConfig.saltKey}`;
            const checksum = crypto.createHash('sha256').update(concatenatedString).digest('hex') + '###' + this.phonepeConfig.saltIndex;

            const response = await axios.get(
                `${this.phonepeConfig.apiEndpoint}/pg/v1/status/${this.phonepeConfig.merchantId}/${transactionId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-VERIFY': checksum,
                        'X-MERCHANT-ID': this.phonepeConfig.merchantId
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('PhonePe payment verification error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    generateGooglePayPayload(amount, billId) {
        return {
            apiVersion: 2,
            apiVersionMinor: 0,
            merchantInfo: {
                merchantId: this.googlepayConfig.merchantId,
                merchantName: this.googlepayConfig.merchantName
            },
            allowedPaymentMethods: [{
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA']
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: this.googlepayConfig.gateway.parameters
                }
            }],
            transactionInfo: {
                totalPriceStatus: 'FINAL',
                totalPrice: amount.toString(),
                currencyCode: 'INR',
                countryCode: 'IN',
                // Test transaction details
                transactionId: `TEST_${billId}_${Date.now()}`,
                totalPriceLabel: 'Total',
                checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE'
            }
        };
    }

    async processGooglePayPayment(paymentToken, amount, billId) {
        try {
            // For sandbox testing, simulate payment processing
            if (process.env.NODE_ENV === 'development') {
                console.log('Running in development mode - simulating Google Pay payment:', {
                    paymentToken,
                    amount,
                    billId
                });

                // Simulate processing delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Generate test transaction ID
                const testTransactionId = `GPT_${Date.now()}_${billId}`;

                return {
                    success: true,
                    transactionId: testTransactionId,
                    amount: amount,
                    billId: billId,
                    status: 'COMPLETED',
                    paymentMethod: 'GOOGLE_PAY',
                    testDetails: {
                        processorName: 'Test Payment Processor',
                        processorTransactionId: `PROC_${testTransactionId}`,
                        processingTimestamp: new Date().toISOString(),
                        testMode: true
                    }
                };
            }

            // Production code would go here
            // 1. Validate the payment token with Google Pay API
            // 2. Process the payment with your payment processor
            // 3. Record the transaction in your database

            throw new Error('Production payment processing not implemented');
        } catch (error) {
            console.error('Google Pay payment processing error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new PaymentService(); 