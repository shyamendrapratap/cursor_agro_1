const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testPDFGeneration() {
    console.log('Testing PDF generation...');
    
    try {
        // First, let's create a test order
        const testOrder = {
            customerName: "Test Customer",
            customerId: 1,
            items: [
                { id: 1, name: "Fresh Milk", quantity: 2, price: 9.66 },
                { id: 2, name: "Curd", quantity: 1, price: 6.99 }
            ],
            status: "completed",
            createdAt: new Date().toISOString()
        };
        
        console.log('Creating test order...');
        const orderResponse = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testOrder)
        });
        
        if (!orderResponse.ok) {
            throw new Error(`Failed to create order: ${orderResponse.statusText}`);
        }
        
        const order = await orderResponse.json();
        console.log('Test order created:', order);
        
        // Now try to generate PDF for this order
        console.log('Generating PDF for order ID:', order.id);
        const pdfResponse = await fetch(`http://localhost:3000/api/bills/${order.id}/pdf`);
        
        if (!pdfResponse.ok) {
            const errorText = await pdfResponse.text();
            console.error('PDF generation failed:', pdfResponse.status, errorText);
            throw new Error(`PDF generation failed: ${pdfResponse.status} - ${errorText}`);
        }
        
        const pdfBuffer = await pdfResponse.arrayBuffer();
        console.log('PDF generated successfully!');
        console.log('PDF size:', pdfBuffer.byteLength, 'bytes');
        console.log('PDF content type:', pdfResponse.headers.get('content-type'));
        
        // Save the PDF to a file for inspection
        const fs = require('fs');
        fs.writeFileSync('test-bill.pdf', Buffer.from(pdfBuffer));
        console.log('PDF saved as test-bill.pdf');
        
    } catch (error) {
        console.error('Test failed:', error.message);
        console.error('Full error:', error);
    }
}

testPDFGeneration(); 