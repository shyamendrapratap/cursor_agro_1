const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testMonthlyBilling() {
    console.log('Testing Monthly Billing System...\n');
    
    try {
        // Step 1: Create some test orders for the current month
        console.log('1. Creating test orders for current month...');
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        
        const testOrders = [
            {
                customerName: "John Doe",
                customerId: 1,
                items: [
                    { id: 1, name: "Fresh Milk", quantity: 5, price: 9.66 },
                    { id: 2, name: "Curd", quantity: 2, price: 6.99 }
                ],
                status: "completed",
                createdAt: new Date(currentYear, currentMonth - 1, 5).toISOString()
            },
            {
                customerName: "John Doe",
                customerId: 1,
                items: [
                    { id: 1, name: "Fresh Milk", quantity: 3, price: 9.66 },
                    { id: 3, name: "Buffalow Milk", quantity: 2, price: 3.25 }
                ],
                status: "completed",
                createdAt: new Date(currentYear, currentMonth - 1, 15).toISOString()
            },
            {
                customerName: "Jane Smith",
                customerId: 2,
                items: [
                    { id: 2, name: "Curd", quantity: 4, price: 6.99 },
                    { id: 5, name: "Eggs", quantity: 1, price: 5.50 }
                ],
                status: "completed",
                createdAt: new Date(currentYear, currentMonth - 1, 10).toISOString()
            }
        ];
        
        for (const order of testOrders) {
            const response = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log(`   Created order ${result.id} for ${order.customerName}`);
            } else {
                console.log(`   Failed to create order for ${order.customerName}`);
            }
        }
        
        // Step 2: Generate monthly bills
        console.log('\n2. Generating monthly bills...');
        const billResponse = await fetch('http://localhost:3000/api/monthly-bills/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                month: currentMonth,
                year: currentYear
            })
        });
        
        if (billResponse.ok) {
            const billResult = await billResponse.json();
            console.log(`   Generated ${billResult.totalBills} monthly bills`);
            console.log('   Bills:', billResult.bills.map(bill => ({
                billId: bill.billId,
                customerName: bill.customerName,
                totalAmount: bill.totalAmount,
                status: bill.status
            })));
        } else {
            const error = await billResponse.json();
            console.log(`   Failed to generate bills: ${error.error}`);
        }
        
        // Step 3: Get all monthly bills
        console.log('\n3. Fetching all monthly bills...');
        const billsResponse = await fetch('http://localhost:3000/api/monthly-bills');
        if (billsResponse.ok) {
            const bills = await billsResponse.json();
            console.log(`   Found ${bills.length} monthly bills`);
            bills.forEach(bill => {
                console.log(`   - ${bill.billId}: ${bill.customerName} - ₹${bill.totalAmount} (${bill.status})`);
            });
        }
        
        // Step 4: Get dues summary
        console.log('\n4. Getting dues summary...');
        const duesResponse = await fetch('http://localhost:3000/api/dues/summary');
        if (duesResponse.ok) {
            const dues = await duesResponse.json();
            console.log('   Dues Summary:', {
                totalBills: dues.totalBills,
                totalAmount: dues.totalAmount,
                totalDue: dues.totalDue,
                totalPaid: dues.totalPaid,
                pendingBills: dues.pendingBills,
                overdueBills: dues.overdueBills,
                paidBills: dues.paidBills
            });
        }
        
        // Step 5: Record a partial payment
        console.log('\n5. Recording a partial payment...');
        const billsForPayment = await fetch('http://localhost:3000/api/monthly-bills');
        if (billsForPayment.ok) {
            const bills = await billsForPayment.json();
            if (bills.length > 0) {
                const firstBill = bills[0];
                const paymentResponse = await fetch(`http://localhost:3000/api/monthly-bills/${firstBill.billId}/pay`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: firstBill.totalAmount * 0.5, // Pay 50%
                        paymentMethod: 'cash',
                        notes: 'Partial payment'
                    })
                });
                
                if (paymentResponse.ok) {
                    const paymentResult = await paymentResponse.json();
                    console.log(`   Recorded payment of ₹${paymentResult.payment.amount} for ${firstBill.customerName}`);
                    console.log(`   Remaining due: ₹${paymentResult.updatedBill.dueAmount}`);
                } else {
                    const error = await paymentResponse.json();
                    console.log(`   Failed to record payment: ${error.error}`);
                }
            }
        }
        
        // Step 6: Get payments history
        console.log('\n6. Getting payments history...');
        const paymentsResponse = await fetch('http://localhost:3000/api/payments');
        if (paymentsResponse.ok) {
            const payments = await paymentsResponse.json();
            console.log(`   Found ${payments.length} payments`);
            payments.forEach(payment => {
                console.log(`   - ${payment.billId}: ₹${payment.amount} (${payment.paymentMethod}) - ${new Date(payment.paidAt).toLocaleDateString()}`);
            });
        }
        
        // Step 7: Generate PDF for a monthly bill
        console.log('\n7. Generating PDF for monthly bill...');
        const billsForPDF = await fetch('http://localhost:3000/api/monthly-bills');
        if (billsForPDF.ok) {
            const bills = await billsForPDF.json();
            if (bills.length > 0) {
                const firstBill = bills[0];
                const pdfResponse = await fetch(`http://localhost:3000/api/monthly-bills/${firstBill.billId}/pdf`);
                
                if (pdfResponse.ok) {
                    const pdfBuffer = await pdfResponse.arrayBuffer();
                    console.log(`   Generated PDF for ${firstBill.billId} (${pdfBuffer.byteLength} bytes)`);
                    
                    // Save the PDF
                    const fs = require('fs');
                    fs.writeFileSync('test-monthly-bill.pdf', Buffer.from(pdfBuffer));
                    console.log('   PDF saved as test-monthly-bill.pdf');
                } else {
                    const error = await pdfResponse.json();
                    console.log(`   Failed to generate PDF: ${error.error}`);
                }
            }
        }
        
        console.log('\n✅ Monthly billing system test completed successfully!');
        
    } catch (error) {
        console.error('❌ Error testing monthly billing system:', error);
    }
}

testMonthlyBilling(); 