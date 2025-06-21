const puppeteer = require('puppeteer');

async function testBillsFunctionality() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🧪 Testing Bills Functionality...\n');
    
    try {
        // Test 1: Login as admin
        console.log('1️⃣ Logging in as admin...');
        await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle0' });
        
        // Fill login form
        await page.type('#username', 'admin');
        await page.type('#password', 'admin123');
        await page.click('button[type="submit"]');
        
        // Wait for redirect to admin panel
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        // Test 2: Navigate to bills tab
        console.log('2️⃣ Navigating to bills tab...');
        await page.click('button[data-tab="bills"]');
        await page.waitForTimeout(2000); // Wait for bills to load
        
        // Test 3: Check if bills are loaded
        console.log('3️⃣ Checking bills data...');
        
        // Check if the loading message is gone
        const loadingElement = await page.$('td:contains("Loading bills...")');
        const isLoading = loadingElement !== null;
        console.log(`   Loading message: ${isLoading ? '❌ Still showing' : '✅ Hidden'}`);
        
        // Check if bills table has data
        const billsTable = await page.$('#bills-table');
        if (billsTable) {
            const rows = await page.$$('#bills-table tr');
            console.log(`   Bills table rows: ${rows.length}`);
            
            if (rows.length > 1) { // More than just the loading row
                console.log('   ✅ Bills data loaded successfully');
                
                // Check if action buttons are present
                const viewButtons = await page.$$('#bills-table .btn-primary');
                const generateButtons = await page.$$('#bills-table .btn-success');
                const pdfButtons = await page.$$('#bills-table .btn-warning');
                
                console.log(`   View buttons: ${viewButtons.length}`);
                console.log(`   Generate buttons: ${generateButtons.length}`);
                console.log(`   PDF buttons: ${pdfButtons.length}`);
            } else {
                console.log('   ❌ No bills data found');
            }
        } else {
            console.log('   ❌ Bills table not found');
        }
        
        // Test 4: Test "Generate New Bill" button
        console.log('\n4️⃣ Testing "Generate New Bill" button...');
        const generateNewBillBtn = await page.$('button:contains("Generate New Bill")');
        if (generateNewBillBtn) {
            console.log('   ✅ "Generate New Bill" button found');
            await generateNewBillBtn.click();
            await page.waitForTimeout(1000);
            
            // Check if modal appears
            const modal = await page.$('.fixed');
            if (modal) {
                console.log('   ✅ Modal opened successfully');
                
                // Check if orders list is loaded
                const ordersList = await page.$('#orders-list');
                if (ordersList) {
                    const orderItems = await page.$$('#orders-list > div');
                    console.log(`   Orders in modal: ${orderItems.length}`);
                }
                
                // Close modal
                const closeBtn = await page.$('.fixed button:contains("×")');
                if (closeBtn) {
                    await closeBtn.click();
                    console.log('   ✅ Modal closed successfully');
                }
            } else {
                console.log('   ❌ Modal did not open');
            }
        } else {
            console.log('   ❌ "Generate New Bill" button not found');
        }
        
        console.log('\n✅ Bills Functionality Test Completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testBillsFunctionality(); 