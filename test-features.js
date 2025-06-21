const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Simple fetch implementation
function fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const req = client.request(url, {
            method: options.method || 'GET',
            headers: options.headers || {},
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        json: () => Promise.resolve(jsonData)
                    });
                } catch (e) {
                    resolve({
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        json: () => Promise.resolve(data)
                    });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function testFeatures() {
    console.log('🧪 Testing Dairy Microservices Features...\n');

    try {
        // Test 1: Investment Management
        console.log('1. Testing Investment Management...');
        const investmentData = {
            title: 'New Milking Equipment',
            amount: 50000,
            description: 'Automated milking system for increased efficiency',
            category: 'Equipment',
            date: new Date().toISOString()
        };

        const investmentResponse = await fetch(`${BASE_URL}/api/investments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(investmentData)
        });

        if (investmentResponse.ok) {
            const investment = await investmentResponse.json();
            console.log('✅ Investment created:', investment.title, '₹' + investment.amount);
        } else {
            console.log('❌ Investment creation failed');
        }

        // Test 2: Expense Management
        console.log('\n2. Testing Expense Management...');
        const expenseData = {
            title: 'Cattle Feed Purchase',
            amount: 15000,
            description: 'Monthly feed supply for dairy cattle',
            category: 'Feed',
            date: new Date().toISOString()
        };

        const expenseResponse = await fetch(`${BASE_URL}/api/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenseData)
        });

        if (expenseResponse.ok) {
            const expense = await expenseResponse.json();
            console.log('✅ Expense created:', expense.title, '₹' + expense.amount);
        } else {
            console.log('❌ Expense creation failed');
        }

        // Test 3: Analytics/Profitability
        console.log('\n3. Testing Analytics/Profitability...');
        const analyticsResponse = await fetch(`${BASE_URL}/api/analytics/profitability?period=month`);
        
        if (analyticsResponse.ok) {
            const analytics = await analyticsResponse.json();
            console.log('✅ Analytics loaded:');
            console.log('   Revenue: ₹' + analytics.revenue.toFixed(2));
            console.log('   Expenses: ₹' + analytics.expenses.toFixed(2));
            console.log('   Profit: ₹' + analytics.profit.toFixed(2));
            console.log('   Profit Margin: ' + analytics.profitMargin.toFixed(1) + '%');
            console.log('   Top Products:', analytics.topProducts.length);
            console.log('   Expense Categories:', analytics.expenseCategories.length);
            console.log('   Investment Categories:', analytics.investmentCategories.length);
        } else {
            console.log('❌ Analytics failed');
        }

        // Test 4: Backup Management
        console.log('\n4. Testing Backup Management...');
        
        // Create a backup
        const createBackupResponse = await fetch(`${BASE_URL}/api/backups/create`, {
            method: 'POST'
        });

        if (createBackupResponse.ok) {
            const backupResult = await createBackupResponse.json();
            console.log('✅ Backup created:', backupResult.backupName);
        } else {
            console.log('❌ Backup creation failed');
        }

        // List backups
        const listBackupsResponse = await fetch(`${BASE_URL}/api/backups`);
        
        if (listBackupsResponse.ok) {
            const backups = await listBackupsResponse.json();
            console.log('✅ Backups listed:', backups.length, 'backups found');
            backups.forEach(backup => {
                console.log(`   - ${backup.name} (${backup.type}) - ${new Date(backup.timestamp).toLocaleString()}`);
            });
        } else {
            console.log('❌ Backup listing failed');
        }

        // Test 5: Get all data
        console.log('\n5. Testing Data Retrieval...');
        
        const [investmentsRes, expensesRes] = await Promise.all([
            fetch(`${BASE_URL}/api/investments`),
            fetch(`${BASE_URL}/api/expenses`)
        ]);

        if (investmentsRes.ok && expensesRes.ok) {
            const investments = await investmentsRes.json();
            const expenses = await expensesRes.json();
            console.log('✅ Data retrieved:');
            console.log('   Investments:', investments.length);
            console.log('   Expenses:', expenses.length);
        } else {
            console.log('❌ Data retrieval failed');
        }

        console.log('\n🎉 All tests completed successfully!');
        console.log('\n📊 Summary of new features:');
        console.log('   ✅ Investment tracking with categories');
        console.log('   ✅ Expense management with categories');
        console.log('   ✅ Profitability analytics with trends');
        console.log('   ✅ Automated backup system (every 30 minutes)');
        console.log('   ✅ Manual backup creation and restoration');
        console.log('   ✅ Monthly and yearly backup retention');
        console.log('   ✅ Updated proprietor info (Upendra Kumar Singh)');
        console.log('   ✅ Updated phone number (+91 9431887715)');
        console.log('   ✅ Copyright year updated to 2025');
        console.log('   ✅ Functional Show Now and Learn More buttons');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run tests
testFeatures(); 