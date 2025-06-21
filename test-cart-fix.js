const puppeteer = require('puppeteer');

async function testCartFunctionality() {
    console.log('🧪 Testing Cart Functionality After Login...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        
        // Test 1: Check initial state (no cart functionality for non-logged in users)
        console.log('1️⃣ Testing initial state (non-logged in user)...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
        
        // Check if cart button is hidden for non-logged in users
        const cartButtonVisible = await page.evaluate(() => {
            const cartBtn = document.getElementById('open-cart-btn');
            return cartBtn && cartBtn.style.display !== 'none';
        });
        
        if (cartButtonVisible) {
            console.log('❌ Cart button should be hidden for non-logged in users');
        } else {
            console.log('✅ Cart button correctly hidden for non-logged in users');
        }
        
        // Check if Add to Cart buttons are hidden
        const addToCartButtons = await page.$$('.add-to-cart-btn');
        if (addToCartButtons.length > 0) {
            console.log('❌ Add to Cart buttons should be hidden for non-logged in users');
        } else {
            console.log('✅ Add to Cart buttons correctly hidden for non-logged in users');
        }
        
        // Test 2: Login as customer
        console.log('\n2️⃣ Testing login as customer...');
        await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle2' });
        
        await page.type('#username', 'customer1');
        await page.type('#password', 'password123');
        await page.click('#login-btn');
        
        // Wait for redirect and login
        await page.waitForTimeout(2000);
        
        // Check if login was successful
        const currentUrl = page.url();
        if (currentUrl.includes('index.html') || currentUrl.includes('localhost:3000')) {
            console.log('✅ Login successful');
        } else {
            console.log('❌ Login failed');
            return;
        }
        
        // Test 3: Check cart functionality after login
        console.log('\n3️⃣ Testing cart functionality after login...');
        
        // Check if cart button is now visible
        const cartButtonVisibleAfterLogin = await page.evaluate(() => {
            const cartBtn = document.getElementById('open-cart-btn');
            return cartBtn && cartBtn.style.display !== 'none';
        });
        
        if (cartButtonVisibleAfterLogin) {
            console.log('✅ Cart button now visible after login');
        } else {
            console.log('❌ Cart button should be visible after login');
        }
        
        // Check if Add to Cart buttons are now visible
        const addToCartButtonsAfterLogin = await page.$$('.add-to-cart-btn');
        if (addToCartButtonsAfterLogin.length > 0) {
            console.log(`✅ Add to Cart buttons now visible (${addToCartButtonsAfterLogin.length} found)`);
        } else {
            console.log('❌ Add to Cart buttons should be visible after login');
        }
        
        // Test 4: Add items to cart
        console.log('\n4️⃣ Testing adding items to cart...');
        
        // Click first Add to Cart button
        await page.click('.add-to-cart-btn');
        await page.waitForTimeout(1000);
        
        // Check cart count
        const cartCount = await page.evaluate(() => {
            const countElement = document.getElementById('cart-count');
            return countElement ? countElement.textContent : '0';
        });
        
        console.log(`Cart count after adding item: ${cartCount}`);
        
        // Test 5: Open cart and verify contents
        console.log('\n5️⃣ Testing cart modal...');
        await page.click('#open-cart-btn');
        await page.waitForTimeout(1000);
        
        // Check if cart modal is open
        const cartModalVisible = await page.evaluate(() => {
            const modal = document.getElementById('cart-modal');
            return modal && !modal.classList.contains('hidden') && modal.style.display !== 'none';
        });
        
        if (cartModalVisible) {
            console.log('✅ Cart modal opened successfully');
        } else {
            console.log('❌ Cart modal should be visible');
        }
        
        // Check cart contents
        const cartItems = await page.evaluate(() => {
            const itemsContainer = document.getElementById('cart-items');
            if (!itemsContainer) return 'No items container found';
            
            const items = itemsContainer.querySelectorAll('li');
            if (items.length === 0) return 'No items in cart';
            
            const itemTexts = [];
            items.forEach(item => {
                itemTexts.push(item.textContent.trim());
            });
            return itemTexts.join(', ');
        });
        
        console.log(`Cart contents: ${cartItems}`);
        
        // Check customer info
        const customerInfo = await page.evaluate(() => {
            const infoDiv = document.getElementById('cart-customer-info');
            return infoDiv ? infoDiv.textContent.trim() : 'No customer info found';
        });
        
        console.log(`Customer info: ${customerInfo}`);
        
        // Test 6: Test quantity change functionality
        console.log('\n6️⃣ Testing quantity change functionality...');
        
        // Try to increase quantity
        const increaseBtn = await page.$('.increase-btn');
        if (increaseBtn) {
            await increaseBtn.click();
            await page.waitForTimeout(500);
            
            const newCartCount = await page.evaluate(() => {
                const countElement = document.getElementById('cart-count');
                return countElement ? countElement.textContent : '0';
            });
            
            console.log(`Cart count after increasing quantity: ${newCartCount}`);
            
            if (parseInt(newCartCount) > parseInt(cartCount)) {
                console.log('✅ Quantity increase functionality working');
            } else {
                console.log('❌ Quantity increase not working');
            }
        } else {
            console.log('❌ Increase button not found');
        }
        
        // Test 7: Test product names in cart
        console.log('\n7️⃣ Testing product names in cart...');
        
        const productNamesInCart = await page.evaluate(() => {
            const items = document.querySelectorAll('#cart-items li');
            const names = [];
            items.forEach(item => {
                const nameElement = item.querySelector('.font-semibold');
                if (nameElement) {
                    names.push(nameElement.textContent.trim());
                }
            });
            return names;
        });
        
        if (productNamesInCart.length > 0) {
            console.log(`✅ Product names found in cart: ${productNamesInCart.join(', ')}`);
        } else {
            console.log('❌ No product names found in cart');
        }
        
        console.log('\n🎉 Cart functionality test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testCartFunctionality().catch(console.error); 