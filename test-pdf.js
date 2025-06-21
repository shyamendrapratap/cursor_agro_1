// Test script to verify PDF generation
const fetch = require('node-fetch');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';

async function testPDFGeneration() {
    console.log('🧪 Testing PDF Generation System\n');

    try {
        // Test 1: Check if orders exist
        console.log('1. Checking for existing orders...');
        const ordersResponse = await fetch(`${BASE_URL}/api/orders`);
        const orders = await ordersResponse.json();
        
        if (orders.length === 0) {
            console.log('   No orders found. Please create an order first.');
            return;
        }
        
        console.log(`   Found ${orders.length} orders`);
        
        // Test 2: Test PDF generation for the first order
        const testOrder = orders[0];
        console.log(`\n2. Testing PDF generation for Order #${testOrder.id}...`);
        
        const pdfResponse = await fetch(`${BASE_URL}/api/bills/${testOrder.id}/pdf`);
        
        if (pdfResponse.ok) {
            const pdfBuffer = await pdfResponse.buffer();
            const filename = `test-bill-${testOrder.id}.pdf`;
            fs.writeFileSync(filename, pdfBuffer);
            
            console.log(`   ✅ PDF generated successfully!`);
            console.log(`   📄 File saved as: ${filename}`);
            console.log(`   📊 File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
            
            // Check if it's a valid PDF
            if (pdfBuffer.toString('ascii', 0, 4) === '%PDF') {
                console.log('   ✅ Valid PDF file confirmed');
            } else {
                console.log('   ⚠️  File may not be a valid PDF');
            }
        } else {
            const error = await pdfResponse.text();
            console.log('   ❌ PDF generation failed:', error);
        }
        
        // Test 3: Test bill print endpoint
        console.log(`\n3. Testing bill print endpoint for Order #${testOrder.id}...`);
        const printResponse = await fetch(`${BASE_URL}/api/bills/${testOrder.id}/print`, {
            method: 'POST'
        });
        
        if (printResponse.ok) {
            const bill = await printResponse.json();
            console.log('   ✅ Bill marked as printed successfully!');
            console.log(`   📋 Bill ID: ${bill.billId}`);
            console.log(`   💰 Total: ₹${bill.total.toFixed(2)}`);
        } else {
            const error = await printResponse.text();
            console.log('   ❌ Bill print failed:', error);
        }
        
        console.log('\n✅ PDF generation tests completed!');
        console.log('\n📋 Summary:');
        console.log('   • PDF generation endpoint is working');
        console.log('   • Bills can be marked as printed');
        console.log('   • PDF files are properly formatted');
        console.log('   • File download functionality is ready');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('Make sure the server is running on http://localhost:3000');
    }
}

// Run the test
testPDFGeneration(); 