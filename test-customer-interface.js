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
        const heroBanner = await page.$('#hero-banner');
        const featuresSection = await page.$('#features-section');
        const farmShowcase = await page.$('#farm-showcase');
        const mapSection = await page.$('#map-section');
        
        const heroVisible = await heroBanner ? await heroBanner.isVisible() : false;
        const featuresVisible = await featuresSection ? await featuresSection.isVisible() : false;
        const farmVisible = await farmShowcase ? await farmShowcase.isVisible() : false;
        const mapVisible = await mapSection ? await mapSection.isVisible() : false;
        
        console.log(`   Hero Banner: ${heroVisible ? '✅ Visible' : '❌ Hidden'}`);
        console.log(`   Features Section: ${featuresVisible ? '✅ Visible' : '❌ Hidden'}`);
        console.log(`   Farm Showcase: ${farmVisible ? '✅ Visible' : '❌ Hidden'}`);
        console.log(`   Map Section: ${mapVisible ? '✅ Visible' : '❌ Hidden'}`);
        
        // Check if welcome section exists (should not for logged out users)
        const welcomeSection = await page.$('.text-center.mb-8.bg-blue-50');
        const welcomeExists = welcomeSection !== null;
        console.log(`   Customer Welcome: ${welcomeExists ? '❌ Should not exist' : '✅ Not present'}`);
        
        // Test 2: Login as customer
        console.log('\n2️⃣ Testing customer login...');
        await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle0' });
        
        // Fill login form
        await page.type('#username', 'customer1');
        await page.type('#password', 'customer123');
        await page.click('button[type="submit"]');
        
        // Wait for redirect
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        // Check if promotional sections are hidden for logged-in customer
        console.log('   Checking sections after customer login...');
        await page.waitForTimeout(2000); // Wait for JavaScript to execute
        
        const heroBannerAfter = await page.$('#hero-banner');
        const featuresSectionAfter = await page.$('#features-section');
        const farmShowcaseAfter = await page.$('#farm-showcase');
        const mapSectionAfter = await page.$('#map-section');
        
        const heroVisibleAfter = await heroBannerAfter ? await heroBannerAfter.isVisible() : false;
        const featuresVisibleAfter = await featuresSectionAfter ? await featuresSectionAfter.isVisible() : false;
        const farmVisibleAfter = await farmShowcaseAfter ? await farmShowcaseAfter.isVisible() : false;
        const mapVisibleAfter = await mapSectionAfter ? await mapSectionAfter.isVisible() : false;
        
        console.log(`   Hero Banner: ${heroVisibleAfter ? '❌ Should be hidden' : '✅ Hidden'}`);
        console.log(`   Features Section: ${featuresVisibleAfter ? '❌ Should be hidden' : '✅ Hidden'}`);
        console.log(`   Farm Showcase: ${farmVisibleAfter ? '❌ Should be hidden' : '✅ Hidden'}`);
        console.log(`   Map Section: ${mapVisibleAfter ? '❌ Should be hidden' : '✅ Hidden'}`);
        
        // Check if welcome section exists for logged-in customer
        const welcomeSectionAfter = await page.$('.text-center.mb-8.bg-blue-50');
        const welcomeExistsAfter = welcomeSectionAfter !== null;
        console.log(`   Customer Welcome: ${welcomeExistsAfter ? '✅ Present' : '❌ Should be present'}`);
        
        // Test 3: Logout
        console.log('\n3️⃣ Testing logout...');
        await page.click('button:contains("Logout")');
        await page.waitForTimeout(2000); // Wait for JavaScript to execute
        
        // Check if promotional sections are visible again after logout
        console.log('   Checking sections after logout...');
        
        const heroBannerLogout = await page.$('#hero-banner');
        const featuresSectionLogout = await page.$('#features-section');
        const farmShowcaseLogout = await page.$('#farm-showcase');
        const mapSectionLogout = await page.$('#map-section');
        
        const heroVisibleLogout = await heroBannerLogout ? await heroBannerLogout.isVisible() : false;
        const featuresVisibleLogout = await featuresSectionLogout ? await featuresSectionLogout.isVisible() : false;
        const farmVisibleLogout = await farmShowcaseLogout ? await farmShowcaseLogout.isVisible() : false;
        const mapVisibleLogout = await mapSectionLogout ? await mapSectionLogout.isVisible() : false;
        
        console.log(`   Hero Banner: ${heroVisibleLogout ? '✅ Visible' : '❌ Should be visible'}`);
        console.log(`   Features Section: ${featuresVisibleLogout ? '✅ Visible' : '❌ Should be visible'}`);
        console.log(`   Farm Showcase: ${farmVisibleLogout ? '✅ Visible' : '❌ Should be visible'}`);
        console.log(`   Map Section: ${mapVisibleLogout ? '✅ Visible' : '❌ Should be visible'}`);
        
        // Check if welcome section is removed after logout
        const welcomeSectionLogout = await page.$('.text-center.mb-8.bg-blue-50');
        const welcomeExistsLogout = welcomeSectionLogout !== null;
        console.log(`   Customer Welcome: ${welcomeExistsLogout ? '❌ Should not exist' : '✅ Removed'}`);
        
        console.log('\n✅ Customer Interface Test Completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testCustomerInterface(); 