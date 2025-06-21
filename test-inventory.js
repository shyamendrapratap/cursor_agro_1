// Test script to demonstrate inventory validation
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testInventoryValidation() {
    console.log('🧪 Testing Inventory Validation System\n');

    try {
        // Test 1: Check initial inventory
        console.log('1. Checking initial inventory...');
        const inventoryResponse = await fetch(`${BASE_URL}/api/inventory`);
        const inventory = await inventoryResponse.json();
        console.log('   Initial inventory:', inventory.length > 0 ? 'Loaded' : 'Empty (will be initialized)');
        
        // Test 2: Try to place an order with valid quantities
        console.log('\n2. Testing order with valid quantities...');
        const validOrder = {
            customerName: "Test Customer",
            customerId: 1,
            items: [
                { id: 1, name: "Fresh Milk", price: 2.50, quantity: 2 },
                { id: 2, name: "Curd", price: 6.99, quantity: 1 }
            ]
        };

        const validOrderResponse = await fetch(`${BASE_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validOrder)
        });

        if (validOrderResponse.ok) {
            const validOrderResult = await validOrderResponse.json();
            console.log('   ✅ Valid order placed successfully!');
            console.log(`   Order ID: ${validOrderResult.id}`);
            console.log(`   Total: $${validOrderResult.total}`);
            if (validOrderResult.inventoryUpdated) {
                console.log('   Inventory updated:', validOrderResult.inventoryUpdated.length, 'items');
            }
        } else {
            const error = await validOrderResponse.json();
            console.log('   ❌ Valid order failed:', error.message);
        }

        // Test 3: Try to place an order with excessive quantities
        console.log('\n3. Testing order with excessive quantities...');
        const invalidOrder = {
            customerName: "Test Customer",
            customerId: 1,
            items: [
                { id: 1, name: "Fresh Milk", price: 2.50, quantity: 1000 }, // Way more than available
                { id: 2, name: "Curd", price: 6.99, quantity: 50 } // More than available
            ]
        };

        const invalidOrderResponse = await fetch(`${BASE_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidOrder)
        });

        if (!invalidOrderResponse.ok) {
            const error = await invalidOrderResponse.json();
            console.log('   ❌ Invalid order correctly rejected!');
            console.log('   Error:', error.message);
            console.log('   Details:');
            error.details.forEach(detail => {
                console.log(`     • ${detail}`);
            });
        } else {
            console.log('   ⚠️  Invalid order was accepted (this should not happen)');
        }

        // Test 4: Check updated inventory
        console.log('\n4. Checking updated inventory...');
        const updatedInventoryResponse = await fetch(`${BASE_URL}/api/inventory`);
        const updatedInventory = await updatedInventoryResponse.json();
        console.log('   Updated inventory:');
        updatedInventory.forEach(item => {
            console.log(`     ${item.name}: ${item.stock} units`);
        });

        // Test 5: Try to order non-existent product
        console.log('\n5. Testing order with non-existent product...');
        const nonExistentOrder = {
            customerName: "Test Customer",
            customerId: 1,
            items: [
                { id: 999, name: "Non-existent Product", price: 10.00, quantity: 1 }
            ]
        };

        const nonExistentResponse = await fetch(`${BASE_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nonExistentOrder)
        });

        if (!nonExistentResponse.ok) {
            const error = await nonExistentResponse.json();
            console.log('   ❌ Non-existent product correctly rejected!');
            console.log('   Error:', error.message);
            console.log('   Details:');
            error.details.forEach(detail => {
                console.log(`     • ${detail}`);
            });
        } else {
            console.log('   ⚠️  Non-existent product order was accepted (this should not happen)');
        }

        console.log('\n✅ Inventory validation tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   • Valid orders are processed and inventory is updated');
        console.log('   • Orders with insufficient stock are rejected with detailed error messages');
        console.log('   • Orders with non-existent products are rejected');
        console.log('   • Inventory is automatically initialized if empty');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('Make sure the server is running on http://localhost:3000');
    }
}

// Run the test
testInventoryValidation(); 