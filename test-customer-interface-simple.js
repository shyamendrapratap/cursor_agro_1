const puppeteer = require('puppeteer');

async function testCustomerInterface() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🧪 Testing Customer Interface Logic...\n');
    
    try {
        // Test 1: Check initial state (not logged in)
        console.log('1️⃣ Testing initial state (not logged in)...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        
        // Check if promotional sections are visible
        const sections = ['hero-banner', 'features-section', 'farm-showcase', 'testimonials-section', 'newsletter-section', 'map-section'];
        
        for (const sectionId of sections) {
            const section = await page.$(`#${sectionId}`);
            const isVisible = section ? await section.isVisible() : false;
            console.log(`   ${sectionId}: ${isVisible ? '✅ Visible' : '❌ Hidden'}`);
        }
        
        // Test 2: Login as customer
        console.log('\n2️⃣ Testing customer login...');
        await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle0' });
        
        // Fill login form
        await page.type('#username', 'customer1');
        await page.type('#password', 'customer123');
        await page.click('button[type="submit"]');
        
        // Wait for redirect
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        // Wait for JavaScript to execute
        await page.waitForTimeout(3000);
        
        // Check if promotional sections are hidden for logged-in customer
        console.log('   Checking sections after customer login...');
        
        for (const sectionId of sections) {
            const section = await page.$(`#${sectionId}`);
            const isVisible = section ? await section.isVisible() : false;
            console.log(`   ${sectionId}: ${isVisible ? '❌ Should be hidden' : '✅ Hidden'}`);
        }
        
        // Check if welcome section exists for logged-in customer
        const welcomeSection = await page.$('.text-center.mb-8.bg-blue-50');
        const welcomeExists = welcomeSection !== null;
        console.log(`   Customer Welcome: ${welcomeExists ? '✅ Present' : '❌ Should be present'}`);
        
        // Test 3: Logout
        console.log('\n3️⃣ Testing logout...');
        await page.click('button:contains("Logout")');
        await page.waitForTimeout(3000); // Wait for JavaScript to execute
        
        // Check if promotional sections are visible again after logout
        console.log('   Checking sections after logout...');
        
        for (const sectionId of sections) {
            const section = await page.$(`#${sectionId}`);
            const isVisible = section ? await section.isVisible() : false;
            console.log(`   ${sectionId}: ${isVisible ? '✅ Visible' : '❌ Should be visible'}`);
        }
        
        // Check if welcome section is removed after logout
        const welcomeSectionAfter = await page.$('.text-center.mb-8.bg-blue-50');
        const welcomeExistsAfter = welcomeSectionAfter !== null;
        console.log(`   Customer Welcome: ${welcomeExistsAfter ? '❌ Should not exist' : '✅ Removed'}`);
        
        console.log('\n✅ Customer Interface Test Completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testCustomerInterface(); 