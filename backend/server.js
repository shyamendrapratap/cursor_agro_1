const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require('cors');
const jsreport = require('jsreport-core')();
const backupSystem = require('./backup');
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend")));
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));

// Data file paths
const dataDir = path.join(__dirname, 'data');
const INVENTORY_FILE = path.join(dataDir, 'inventory.json');
const ORDERS_FILE = path.join(dataDir, 'orders.json');
const USERS_FILE = path.join(dataDir, 'users.json');
const INVESTMENTS_FILE = path.join(dataDir, 'investments.json');
const EXPENSES_FILE = path.join(dataDir, 'expenses.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Load data to files
function loadData(filename, defaultValue = []) {
    const filePath = path.join(dataDir, filename);
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            return defaultValue;
        }
    }
    return defaultValue;
}

function saveData(filename, data) {
    const filePath = path.join(dataDir, filename);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error saving ${filename}:`, error);
    }
}

// Load data on startup
function loadInitialData() {
    // Load or create inventory data
    if (fs.existsSync(INVENTORY_FILE)) {
        inventory = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'));
    } else {
        inventory = [];
        saveInventory();
    }

    // Load or create orders data
    if (fs.existsSync(ORDERS_FILE)) {
        orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    } else {
        orders = [];
        saveOrders();
    }

    // Load or create users data
    if (fs.existsSync(USERS_FILE)) {
        users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } else {
        users = [
            { id: 1, username: "admin", password: "admin123", role: "admin" },
            { id: 2, username: "customer1", password: "customer123", role: "customer" }
        ];
        saveUsers();
    }

    // Load or create investments data
    if (fs.existsSync(INVESTMENTS_FILE)) {
        investments = JSON.parse(fs.readFileSync(INVESTMENTS_FILE, 'utf8'));
    } else {
        investments = [];
        saveInvestments();
    }

    // Load or create expenses data
    if (fs.existsSync(EXPENSES_FILE)) {
        expenses = JSON.parse(fs.readFileSync(EXPENSES_FILE, 'utf8'));
    } else {
        expenses = [];
        saveExpenses();
    }
}

// Save data to files
function saveInventory() {
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventory, null, 2));
}

function saveOrders() {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

function saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function saveInvestments() {
    fs.writeFileSync(INVESTMENTS_FILE, JSON.stringify(investments, null, 2));
}

function saveExpenses() {
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses, null, 2));
}

// Initialize data
let users = [];
let inventory = [];
let orders = [];
let investments = [];
let expenses = [];

// Load data on startup
loadInitialData();

// Authentication middleware
const authenticateUser = (req, res, next) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.user = user;
        next();
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
};

// Login endpoint
app.post("/api/login", authenticateUser, (req, res) => {
    res.json({ 
        success: true, 
        user: { 
            id: req.user.id, 
            username: req.user.username, 
            role: req.user.role 
        } 
    });
});

// API endpoint for products
app.get("/api/products", (req, res) => {
    res.json([
        { 
            id: 1,
            name: "Fresh Milk", 
            price: 9.66, 
            description: "Pure, pasteurized cow's milk.", 
            image: "/images/cattle1.jpg"
        },
        { 
            id: 2,
            name: "Curd", 
            price: 6.99, 
            description: "Thick and creamy traditional curd.", 
            image: "/images/check.jpg"
        },
        { 
            id: 3,
            name: "Buffalow Milk", 
            price: 3.25, 
            description: "Rich and creamy buffalo milk.", 
            image: "/images/cattle2.jpg"
        },
        { 
            id: 4,
            name: "Desi Cow Milk", 
            price: 4.00, 
            description: "Pure A2 milk from indigenous cow breeds.", 
            image: "/images/cattle3.jpg"
        },
        { 
            id: 5,
            name: "Eggs", 
            price: 5.50, 
            description: "Fresh farm eggs, perfect for cooking.", 
            image: "/images/check1.jpg"
        },
        { 
            id: 6,
            name: "Desi Eggs", 
            price: 7.00, 
            description: "Organic eggs from free-range desi chickens.", 
            image: "/images/check2.jpg"
        },
        { 
            id: 7,
            name: "Greek Yogurt", 
            price: 4.25, 
            description: "Thick and creamy Greek yogurt, high in protein.", 
            image: "/images/check_1.jpg"
        }
    ]);
});

// Inventory endpoints
app.get("/api/inventory", (req, res) => {
    res.json(inventory);
});

app.post("/api/inventory", (req, res) => {
    const { name, price, stock, description, image } = req.body;
    
    // Validate required fields
    if (!name || !price || stock === undefined) {
        return res.status(400).json({ error: "Name, price, and stock are required" });
    }
    
    // Load products data
    let products = [];
    const productsFile = path.join(dataDir, 'products.json');
    if (fs.existsSync(productsFile)) {
        products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    }
    
    // Create new product
    const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: name.trim(),
        price: parseFloat(price),
        description: description || "",
        image: image || "/images/cattle1.jpg"
    };
    
    // Add to products
    products.push(newProduct);
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
    
    // Create inventory entry
    const newInventoryItem = {
        id: inventory.length > 0 ? Math.max(...inventory.map(item => item.id)) + 1 : 1,
        productId: newProduct.id,
        quantity: parseInt(stock),
        stock: parseInt(stock),
        lastUpdated: new Date().toISOString()
    };
    
    // Add to inventory
    inventory.push(newInventoryItem);
    saveInventory();
    
    console.log(`New product added: ${newProduct.name} (ID: ${newProduct.id})`);
    res.json({ product: newProduct, inventory: newInventoryItem });
});

app.put("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    const { name, price, stock, description, image } = req.body;
    const item = inventory.find(item => item.id === parseInt(id));
    
    if (item) {
        // Load products data
        let products = [];
        const productsFile = path.join(dataDir, 'products.json');
        if (fs.existsSync(productsFile)) {
            products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
        }
        
        // Find corresponding product
        const product = products.find(p => p.id === item.productId);
        
        if (product) {
            // Update product fields if provided
            if (name !== undefined) product.name = name.trim();
            if (price !== undefined) product.price = parseFloat(price);
            if (description !== undefined) product.description = description;
            if (image !== undefined) product.image = image;
            
            // Save updated products
            fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
        }
        
        // Update inventory fields if provided
        if (stock !== undefined) {
            item.quantity = parseInt(stock);
            item.stock = parseInt(stock);
        }
        
        item.lastUpdated = new Date().toISOString();
        saveInventory(); // Save to file
        
        res.json({ product, inventory: item });
    } else {
        res.status(404).json({ error: "Inventory item not found" });
    }
});

// Delete product from inventory
app.delete("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    const itemIndex = inventory.findIndex(item => item.id === parseInt(id));
    
    if (itemIndex !== -1) {
        const deletedItem = inventory[itemIndex];
        
        // Load products data
        let products = [];
        const productsFile = path.join(dataDir, 'products.json');
        if (fs.existsSync(productsFile)) {
            products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
        }
        
        // Remove corresponding product
        const productIndex = products.findIndex(p => p.id === deletedItem.productId);
        let deletedProduct = null;
        if (productIndex !== -1) {
            deletedProduct = products[productIndex];
            products.splice(productIndex, 1);
            fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
        }
        
        // Remove inventory item
        inventory.splice(itemIndex, 1);
        saveInventory(); // Save to file
        
        console.log(`Product deleted: ${deletedProduct ? deletedProduct.name : 'Unknown'} (ID: ${deletedItem.id})`);
        res.json({ 
            message: "Product deleted successfully", 
            deletedProduct, 
            deletedInventory: deletedItem 
        });
    } else {
        res.status(404).json({ error: "Inventory item not found" });
    }
});

// Orders endpoints
app.get("/api/orders", (req, res) => {
    res.json(orders);
});

app.post("/api/orders", (req, res) => {
    const { items, customerName, customerId } = req.body;
    
    // Validate inventory before processing order
    const inventoryErrors = [];
    const updatedInventory = [];
    
    // Check if we have inventory data, if not initialize with default stock
    if (inventory.length === 0) {
        // Initialize inventory with default stock for all products
        const products = [
            { id: 1, name: "Fresh Milk", price: 9.66, stock: 50 },
            { id: 2, name: "Curd", price: 6.99, stock: 30 },
            { id: 3, name: "Buffalow Milk", price: 3.25, stock: 40 },
            { id: 4, name: "Desi Cow Milk", price: 4.00, stock: 35 },
            { id: 5, name: "Eggs", price: 5.50, stock: 100 },
            { id: 6, name: "Desi Eggs", price: 7.00, stock: 80 },
            { id: 7, name: "Greek Yogurt", price: 4.25, stock: 25 }
        ];
        inventory.push(...products);
        saveInventory();
    }
    
    // Validate each item in the order
    for (const orderItem of items) {
        const inventoryItem = inventory.find(inv => inv.id === orderItem.id);
        
        if (!inventoryItem) {
            inventoryErrors.push(`Product "${orderItem.name}" not found in inventory`);
            continue;
        }
        
        if (inventoryItem.stock < orderItem.quantity) {
            inventoryErrors.push(`Insufficient stock for "${orderItem.name}". Available: ${inventoryItem.stock}, Requested: ${orderItem.quantity}`);
            continue;
        }
        
        // Prepare inventory update
        updatedInventory.push({
            id: inventoryItem.id,
            currentStock: inventoryItem.stock,
            newStock: inventoryItem.stock - orderItem.quantity,
            item: orderItem
        });
    }
    
    // If there are inventory errors, return them
    if (inventoryErrors.length > 0) {
        return res.status(400).json({
            error: "Inventory validation failed",
            details: inventoryErrors,
            message: "Some items are out of stock or have insufficient quantity"
        });
    }
    
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create the order
    const newOrder = {
        id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
        customerName,
        customerId,
        items,
        total,
        status: "pending",
        createdAt: new Date().toISOString()
    };
    
    // Update inventory
    for (const update of updatedInventory) {
        const inventoryItem = inventory.find(inv => inv.id === update.id);
        if (inventoryItem) {
            inventoryItem.stock = update.newStock;
            inventoryItem.lastUpdated = new Date().toISOString();
        }
    }
    
    // Save both orders and inventory
    orders.push(newOrder);
    saveOrders();
    saveInventory();
    
    // Return success response with order details
    res.json({
        ...newOrder,
        inventoryUpdated: updatedInventory.map(update => ({
            productId: update.id,
            productName: update.item.name,
            previousStock: update.currentStock,
            newStock: update.newStock,
            quantityOrdered: update.item.quantity
        }))
    });
});

app.put("/api/orders/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = orders.find(o => o.id === parseInt(id));
    if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        saveOrders(); // Save to file
        res.json(order);
    } else {
        res.status(404).json({ error: "Order not found" });
    }
});

// Bill generation endpoints
app.get("/api/bills", (req, res) => {
    // Return all bills (in a real app, you'd store bills separately)
    const bills = orders.map(order => ({
        billId: `BILL-${order.id.toString().padStart(4, '0')}`,
        orderId: order.id,
        customerName: order.customerName,
        customerId: order.customerId,
        items: order.items,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        billDate: order.createdAt
    }));
    res.json(bills);
});

app.get("/api/bills/:orderId", (req, res) => {
    const { orderId } = req.params;
    const order = orders.find(o => o.id === parseInt(orderId));
    
    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }
    
    const bill = {
        billId: `BILL-${order.id.toString().padStart(4, '0')}`,
        orderId: order.id,
        customerName: order.customerName,
        customerId: order.customerId,
        items: order.items,
        subtotal: order.total,
        tax: order.total * 0.05, // 5% tax
        total: order.total * 1.05,
        status: order.status,
        createdAt: order.createdAt,
        billDate: order.createdAt,
        companyInfo: {
            name: "Vibha Agro Dairy",
            address: "123 Dairy Farm Road, Rural Area",
            phone: "+91 98765 43210",
            email: "info@vibhaagro.com",
            gstin: "22AAAAA0000A1Z5"
        }
    };
    
    res.json(bill);
});

app.post("/api/bills/:orderId/print", (req, res) => {
    const { orderId } = req.params;
    const order = orders.find(o => o.id === parseInt(orderId));
    
    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }
    
    // Update order status to indicate bill has been printed
    order.billPrinted = true;
    order.billPrintedAt = new Date().toISOString();
    saveOrders();
    
    const bill = {
        billId: `BILL-${order.id.toString().padStart(4, '0')}`,
        orderId: order.id,
        customerName: order.customerName,
        customerId: order.customerId,
        items: order.items,
        subtotal: order.total,
        tax: order.total * 0.05,
        total: order.total * 1.05,
        status: order.status,
        createdAt: order.createdAt,
        billDate: order.createdAt,
        printedAt: new Date().toISOString(),
        companyInfo: {
            name: "Vibha Agro Dairy",
            address: "123 Dairy Farm Road, Rural Area",
            phone: "+91 98765 43210",
            email: "info@vibhaagro.com",
            gstin: "22AAAAA0000A1Z5"
        }
    };
    
    res.json(bill);
});

// PDF Generation endpoint
app.get("/api/bills/:orderId/pdf", async (req, res) => {
    const { orderId } = req.params;
    const order = orders.find(o => o.id === parseInt(orderId));
    
    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }
    
    const bill = {
        billId: `BILL-${order.id.toString().padStart(4, '0')}`,
        orderId: order.id,
        customerName: order.customerName,
        customerId: order.customerId,
        items: order.items,
        subtotal: order.total,
        tax: order.total * 0.05,
        total: order.total * 1.05,
        status: order.status,
        createdAt: order.createdAt,
        billDate: order.createdAt,
        companyInfo: {
            name: "Vibha Agro Dairy",
            address: "123 Dairy Farm Road, Rural Area",
            phone: "+91 98765 43210",
            email: "info@vibhaagro.com",
            gstin: "22AAAAA0000A1Z5"
        }
    };
    
    try {
        const result = await jsreport.render({
            template: {
                content: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                        .header { text-align: center; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px; }
                        .header h1 { color: #4CAF50; margin: 0; font-size: 28px; }
                        .header p { margin: 5px 0; color: #666; }
                        .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                        .details div { flex: 1; }
                        .details h3 { color: #4CAF50; margin-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #f8f9fa; font-weight: bold; color: #4CAF50; }
                        .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
                        .total div { margin: 5px 0; }
                        .footer { text-align: center; margin-top: 40px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
                        .logo { font-size: 24px; font-weight: bold; color: #4CAF50; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">🥛 Vibha Agro Dairy</div>
                        <h1>INVOICE</h1>
                        <p>{{companyInfo.address}}</p>
                        <p>Phone: {{companyInfo.phone}} | Email: {{companyInfo.email}}</p>
                        <p>GSTIN: {{companyInfo.gstin}}</p>
                    </div>
                    
                    <div class="details">
                        <div>
                            <h3>Bill To:</h3>
                            <p><strong>{{customerName}}</strong></p>
                            <p>Customer ID: {{customerId}}</p>
                        </div>
                        <div style="text-align: right;">
                            <h3>Invoice Details:</h3>
                            <p><strong>Invoice #:</strong> {{billId}}</p>
                            <p><strong>Date:</strong> {{formatDate billDate}}</p>
                            <p><strong>Status:</strong> {{status}}</p>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price (₹)</th>
                                <th>Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {{#each items}}
                            <tr>
                                <td>{{name}}</td>
                                <td>{{quantity}}</td>
                                <td>{{formatPrice price}}</td>
                                <td>{{formatPrice (multiply price quantity)}}</td>
                            </tr>
                            {{/each}}
                        </tbody>
                    </table>
                    
                    <div class="total">
                        <div>Subtotal: ₹{{formatPrice subtotal}}</div>
                        <div>Tax (5%): ₹{{formatPrice tax}}</div>
                        <div style="font-size: 20px; color: #4CAF50;">Total: ₹{{formatPrice total}}</div>
                    </div>
                    
                    <div class="footer">
                        <p><strong>Thank you for your business!</strong></p>
                        <p>For any queries, please contact us at {{companyInfo.phone}}</p>
                        <p>This is a computer generated invoice</p>
                    </div>
                </body>
                </html>
                `,
                engine: 'jsrender',
                recipe: 'chrome-pdf',
                chrome: {
                    format: 'A4',
                    margin: '1cm'
                }
            },
            data: {
                ...bill,
                formatDate: (date) => new Date(date).toLocaleDateString('en-IN'),
                formatPrice: (price) => parseFloat(price).toFixed(2),
                multiply: (a, b) => a * b
            }
        });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${bill.billId}.pdf"`);
        res.send(result.content);
        
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

// User management endpoints
app.get('/api/users', (req, res) => {
    try {
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.post('/api/users', (req, res) => {
    try {
        const { username, password, role } = req.body;
        
        // Validate required fields
        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Username, password, and role are required' });
        }
        
        // Check if username already exists
        if (users.find(user => user.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        // Validate role
        if (!['admin', 'customer'].includes(role)) {
            return res.status(400).json({ error: 'Role must be either admin or customer' });
        }
        
        // Create new user
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            username: username.trim(),
            password: password,
            role: role,
            createdAt: new Date().toISOString(),
            active: true
        };
        
        users.push(newUser);
        saveUsers();
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.put('/api/users/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { username, password, role, active } = req.body;
        
        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if username already exists (excluding current user)
        if (username && users.find(user => user.username === username && user.id !== userId)) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        // Update user
        if (username) users[userIndex].username = username.trim();
        if (password) users[userIndex].password = password;
        if (role && ['admin', 'customer'].includes(role)) users[userIndex].role = role;
        if (typeof active === 'boolean') users[userIndex].active = active;
        
        users[userIndex].updatedAt = new Date().toISOString();
        
        saveUsers();
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = users[userIndex];
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.delete('/api/users/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        // Prevent deleting the current admin user
        const currentUser = req.user;
        if (currentUser && currentUser.id === userId) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        
        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if user has any orders
        const userOrders = orders.filter(order => order.customerId === userId);
        if (userOrders.length > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete user with existing orders. Consider deactivating instead.' 
            });
        }
        
        users.splice(userIndex, 1);
        saveUsers();
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

app.get('/api/users/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = users.find(user => user.id === userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Investment and Expense Management endpoints
app.get("/api/investments", (req, res) => {
    res.json(investments);
});

app.post("/api/investments", (req, res) => {
    const { title, amount, description, category, date } = req.body;
    const newInvestment = {
        id: investments.length > 0 ? Math.max(...investments.map(i => i.id)) + 1 : 1,
        title,
        amount: parseFloat(amount),
        description,
        category,
        date: date || new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
    investments.push(newInvestment);
    saveInvestments();
    res.json(newInvestment);
});

app.get("/api/expenses", (req, res) => {
    res.json(expenses);
});

app.post("/api/expenses", (req, res) => {
    const { title, amount, description, category, date } = req.body;
    const newExpense = {
        id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
        title,
        amount: parseFloat(amount),
        description,
        category,
        date: date || new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
    expenses.push(newExpense);
    saveExpenses();
    res.json(newExpense);
});

// Profitability Analysis endpoint
app.get("/api/analytics/profitability", (req, res) => {
    const { period = 'month' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch(period) {
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    // Calculate revenue from orders
    const periodOrders = orders.filter(order => new Date(order.createdAt) >= startDate);
    const revenue = periodOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Calculate expenses
    const periodExpenses = expenses.filter(expense => new Date(expense.date) >= startDate);
    const totalExpenses = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate investments
    const periodInvestments = investments.filter(investment => new Date(investment.date) >= startDate);
    const totalInvestments = periodInvestments.reduce((sum, investment) => sum + investment.amount, 0);
    
    // Calculate profit
    const profit = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    // Sales trends
    const salesByDay = {};
    periodOrders.forEach(order => {
        const date = new Date(order.createdAt).toDateString();
        salesByDay[date] = (salesByDay[date] || 0) + order.total;
    });
    
    const analytics = {
        period,
        revenue,
        expenses: totalExpenses,
        investments: totalInvestments,
        profit,
        profitMargin,
        orderCount: periodOrders.length,
        expenseCount: periodExpenses.length,
        investmentCount: periodInvestments.length,
        salesTrends: Object.entries(salesByDay).map(([date, amount]) => ({ date, amount })),
        topProducts: getTopProducts(periodOrders),
        expenseCategories: getExpenseCategories(periodExpenses),
        investmentCategories: getInvestmentCategories(periodInvestments)
    };
    
    res.json(analytics);
});

function getTopProducts(orders) {
    const productSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            productSales[item.name] = (productSales[item.name] || 0) + (item.price * item.quantity);
        });
    });
    
    return Object.entries(productSales)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);
}

function getExpenseCategories(expenses) {
    const categories = {};
    expenses.forEach(expense => {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
    });
    
    return Object.entries(categories).map(([category, amount]) => ({ category, amount }));
}

function getInvestmentCategories(investments) {
    const categories = {};
    investments.forEach(investment => {
        categories[investment.category] = (categories[investment.category] || 0) + investment.amount;
    });
    
    return Object.entries(categories).map(([category, amount]) => ({ category, amount }));
}

// Backup Management endpoints
app.get("/api/backups", (req, res) => {
    try {
        const backups = backupSystem.listBackups();
        res.json(backups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/backups/create", (req, res) => {
    try {
        const backupName = backupSystem.createBackup();
        res.json({ message: 'Backup created successfully', backupName });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/backups/restore/:backupName", (req, res) => {
    try {
        const { backupName } = req.params;
        backupSystem.restoreBackup(backupName);
        
        // Reload data after restore
        loadInitialData();
        
        res.json({ message: 'Backup restored successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete("/api/backups/:backupName", (req, res) => {
    try {
        const { backupName } = req.params;
        const backupPath = path.join(__dirname, 'backups', backupName);
        
        if (fs.existsSync(backupPath)) {
            fs.rmSync(backupPath, { recursive: true, force: true });
            res.json({ message: 'Backup deleted successfully' });
        } else {
            res.status(404).json({ error: 'Backup not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Newsletter subscriptions
app.post('/api/newsletter/subscribe', (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email is required' });
        }
        
        const subscriptions = loadData('newsletter_subscriptions.json', []);
        
        // Check if already subscribed
        if (subscriptions.find(sub => sub.email === email)) {
            return res.status(400).json({ error: 'Email already subscribed' });
        }
        
        const subscription = {
            id: Date.now(),
            email,
            subscribedAt: new Date().toISOString(),
            active: true
        };
        
        subscriptions.push(subscription);
        saveData('newsletter_subscriptions.json', subscriptions);
        
        res.json({ message: 'Successfully subscribed to newsletter', subscription });
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

app.get('/api/newsletter/subscribers', (req, res) => {
    try {
        const subscriptions = loadData('newsletter_subscriptions.json', []);
        res.json(subscriptions);
    } catch (error) {
        console.error('Error fetching newsletter subscribers:', error);
        res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
});

app.post('/api/newsletter/subscribers/:id/toggle', (req, res) => {
    try {
        const subscriberId = parseInt(req.params.id);
        const subscriptions = loadData('newsletter_subscriptions.json', []);
        
        const subscription = subscriptions.find(sub => sub.id === subscriberId);
        if (!subscription) {
            return res.status(404).json({ error: 'Subscriber not found' });
        }
        
        subscription.active = !subscription.active;
        saveData('newsletter_subscriptions.json', subscriptions);
        
        res.json({ message: 'Subscriber status updated', subscription });
    } catch (error) {
        console.error('Error toggling newsletter subscriber status:', error);
        res.status(500).json({ error: 'Failed to update subscriber status' });
    }
});

// Enhanced analytics with customer insights
app.get('/api/analytics/enhanced', (req, res) => {
    try {
        const orders = loadData('orders.json', []);
        const users = loadData('users.json', []);
        const subscriptions = loadData('newsletter_subscriptions.json', []);
        
        // Customer analytics
        const customerOrders = orders.filter(order => order.customerId);
        const uniqueCustomers = [...new Set(customerOrders.map(order => order.customerId))];
        
        // Top customers by order value
        const customerStats = {};
        customerOrders.forEach(order => {
            if (!customerStats[order.customerId]) {
                customerStats[order.customerId] = {
                    totalOrders: 0,
                    totalSpent: 0,
                    lastOrder: null
                };
            }
            customerStats[order.customerId].totalOrders++;
            customerStats[order.customerId].totalSpent += order.total;
            if (!customerStats[order.customerId].lastOrder || 
                new Date(order.date) > new Date(customerStats[order.customerId].lastOrder)) {
                customerStats[order.customerId].lastOrder = order.date;
            }
        });
        
        const topCustomers = Object.entries(customerStats)
            .sort(([,a], [,b]) => b.totalSpent - a.totalSpent)
            .slice(0, 5)
            .map(([customerId, stats]) => {
                const user = users.find(u => u.id == customerId);
                return {
                    customerId,
                    customerName: user ? user.username : 'Unknown',
                    ...stats
                };
            });
        
        // Newsletter analytics
        const newsletterStats = {
            totalSubscribers: subscriptions.length,
            activeSubscribers: subscriptions.filter(sub => sub.active).length,
            recentSubscriptions: subscriptions
                .filter(sub => new Date(sub.subscribedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                .length
        };
        
        // Order trends by customer type
        const customerOrderCount = customerOrders.length;
        const guestOrders = orders.filter(order => !order.customerId);
        
        const analytics = {
            // Existing analytics
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
            averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
            ordersThisMonth: orders.filter(order => {
                const orderDate = new Date(order.date);
                const now = new Date();
                return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
            }).length,
            
            // Enhanced customer analytics
            totalCustomers: uniqueCustomers.length,
            customerOrders: customerOrderCount,
            guestOrders: guestOrders.length,
            topCustomers,
            newsletterStats,
            
            // Customer retention
            repeatCustomers: Object.values(customerStats).filter(stats => stats.totalOrders > 1).length,
            newCustomersThisMonth: uniqueCustomers.filter(customerId => {
                const customerOrders = orders.filter(order => order.customerId == customerId);
                const firstOrder = customerOrders.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
                if (!firstOrder) return false;
                const orderDate = new Date(firstOrder.date);
                const now = new Date();
                return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
            }).length
        };
        
        res.json(analytics);
    } catch (error) {
        console.error('Error generating enhanced analytics:', error);
        res.status(500).json({ error: 'Failed to generate analytics' });
    }
});

// Serve enhanced index as default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index-enhanced.html'));
});

// Initialize jsreport
jsreport.init().then(() => {
    console.log('jsreport initialized');
}).catch(err => {
    console.error('jsreport initialization failed:', err);
});

// Start server
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
    console.log(`Data files location: ${dataDir}`);
    
    // Start backup scheduler
    backupSystem.startBackupScheduler();
});
