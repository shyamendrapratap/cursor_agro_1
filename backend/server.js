const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require('cors');
const jsreport = require('jsreport-core')().use(require('jsreport-chrome-pdf')()).use(require('jsreport-jsrender')());
const backupSystem = require('./backup');
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON
app.use(express.json());
app.use(cors());

// Serve enhanced index as default - must come before static middleware
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index-enhanced.html'));
});

app.use(express.static(path.join(__dirname, "../frontend")));
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));

// Data file paths
const dataDir = path.join(__dirname, 'data');
const INVENTORY_FILE = path.join(dataDir, 'inventory.json');
const ORDERS_FILE = path.join(dataDir, 'orders.json');
const USERS_FILE = path.join(dataDir, 'users.json');
const INVESTMENTS_FILE = path.join(dataDir, 'investments.json');
const EXPENSES_FILE = path.join(dataDir, 'expenses.json');
const MONTHLY_BILLS_FILE = path.join(dataDir, 'monthly_bills.json');
const PAYMENTS_FILE = path.join(dataDir, 'payments.json');

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

    // Load or create monthly bills data
    if (fs.existsSync(MONTHLY_BILLS_FILE)) {
        monthlyBills = JSON.parse(fs.readFileSync(MONTHLY_BILLS_FILE, 'utf8'));
    } else {
        monthlyBills = [];
        saveMonthlyBills();
    }

    // Load or create payments data
    if (fs.existsSync(PAYMENTS_FILE)) {
        payments = JSON.parse(fs.readFileSync(PAYMENTS_FILE, 'utf8'));
    } else {
        payments = [];
        savePayments();
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

function saveMonthlyBills() {
    fs.writeFileSync(MONTHLY_BILLS_FILE, JSON.stringify(monthlyBills, null, 2));
}

function savePayments() {
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
}

// Initialize data
let users = [];
let inventory = [];
let orders = [];
let investments = [];
let expenses = [];
let monthlyBills = [];
let payments = [];

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
        // Pre-process the data
        const processedBill = {
            ...bill,
            formattedDate: new Date(bill.createdAt).toLocaleDateString('en-IN'),
            formattedDueDate: new Date(bill.billDate).toLocaleDateString('en-IN'),
            formattedTotalAmount: parseFloat(bill.total).toFixed(2),
            formattedDueAmount: parseFloat(bill.total - bill.subtotal).toFixed(2),
            formattedPaidAmount: parseFloat(bill.subtotal).toFixed(2),
            overdueDays: 0,
            overdueFee: '0.00', // 2% monthly fee
            orders: bill.items.map(item => ({
                ...item,
                formattedDate: new Date(item.date).toLocaleDateString('en-IN'),
                formattedAmount: parseFloat(item.price).toFixed(2)
            }))
        };

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
                        <p>{{:companyInfo.address}}</p>
                        <p>Phone: {{:companyInfo.phone}} | Email: {{:companyInfo.email}}</p>
                        <p>GSTIN: {{:companyInfo.gstin}}</p>
                    </div>
                    
                    <div class="details">
                        <div>
                            <h3>Bill To:</h3>
                            <p><strong>{{:customerName}}</strong></p>
                            <p>Customer ID: {{:customerId}}</p>
                        </div>
                        <div style="text-align: right;">
                            <h3>Invoice Details:</h3>
                            <p><strong>Invoice #:</strong> {{:billId}}</p>
                            <p><strong>Date:</strong> {{:formattedDate}}</p>
                            <p><strong>Status:</strong> {{:status}}</p>
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
                            {{for items}}
                            <tr>
                                <td>{{:name}}</td>
                                <td>{{:quantity}}</td>
                                <td>{{:formattedAmount}}</td>
                                <td>{{:formattedAmount}}</td>
                            </tr>
                            {{/for}}
                        </tbody>
                    </table>
                    
                    <div class="total">
                        <div>Subtotal: ₹{{:formattedSubtotal}}</div>
                        <div>Tax (5%): ₹{{:formattedTax}}</div>
                        <div style="font-size: 20px; color: #4CAF50;">Total: ₹{{:formattedTotalAmount}}</div>
                    </div>
                    
                    <div class="footer">
                        <p><strong>Thank you for your business!</strong></p>
                        <p>For any queries, please contact us at {{:companyInfo.phone}}</p>
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
            data: processedBill
        });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${bill.billId}.pdf"`);
        res.end(result.content);
        
    } catch (error) {
        console.error('PDF generation error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            orderId: orderId,
            bill: bill
        });
        res.status(500).json({ 
            error: 'Failed to generate PDF',
            details: error.message 
        });
    }
});

// Get payment history for a specific monthly bill
app.get('/api/monthly-bills/:billId/payments', (req, res) => {
    try {
        const { billId } = req.params;
        
        // Find payments for this bill
        const billPayments = payments.filter(payment => payment.billId === billId);
        
        // Sort by payment date (newest first)
        billPayments.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
        
        res.json(billPayments);
    } catch (error) {
        console.error('Error fetching bill payments:', error);
        res.status(500).json({ error: 'Failed to fetch bill payments' });
    }
});

app.get('/api/payments', (req, res) => {
    try {
        const { customerId, billId, month, year } = req.query;
        
        let filteredPayments = [...payments];
        
        // Filter by customer
        if (customerId) {
            filteredPayments = filteredPayments.filter(payment => payment.customerId === parseInt(customerId));
        }
        
        // Filter by bill
        if (billId) {
            filteredPayments = filteredPayments.filter(payment => payment.billId === billId);
        }
        
        // Filter by month and year
        if (month && year) {
            filteredPayments = filteredPayments.filter(payment => 
                payment.month === parseInt(month) && payment.year === parseInt(year)
            );
        }
        
        // Sort by payment date (newest first)
        filteredPayments.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
        
        res.json(filteredPayments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// Monthly Bills API endpoint
app.get("/api/monthly-bills", (req, res) => {
    try {
        const customerId = req.query.customerId;
        
        // Filter orders by customer ID and status (only completed/delivered orders)
        const customerOrders = orders.filter(order => 
            (!customerId || order.customerId === parseInt(customerId)) &&
            (order.status === 'completed' || order.status === 'delivered')
        );
        
        const monthlyBills = customerOrders.reduce((acc, order) => {
            const orderDate = new Date(order.createdAt);
            const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
            const monthName = orderDate.toLocaleString('default', { month: 'long', year: 'numeric' });
            
            if (!acc[monthKey]) {
                acc[monthKey] = {
                    id: monthKey,
                    month: monthName,
                    customerId: order.customerId,
                    customerName: order.customerName,
                    orders: [],
                    totalAmount: 0,
                    paidAmount: 0,
                    dueAmount: 0,
                    overdueFees: 0,
                    status: 'unpaid'
                };
            }
            
            // Add complete order with items
            acc[monthKey].orders.push({
                orderId: order.id,
                date: order.createdAt,
                items: order.items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity
                })),
                total: order.total,
                status: order.status
            });
            
            const orderTotal = order.total * 1.05; // Including 5% tax
            acc[monthKey].totalAmount += orderTotal;
            
            if (order.status === 'paid') {
                acc[monthKey].paidAmount += orderTotal;
            } else {
                acc[monthKey].dueAmount += orderTotal;
                
                // Calculate overdue fees (2% per month on unpaid amount)
                const monthsOverdue = getMonthsDifference(new Date(order.createdAt), new Date());
                if (monthsOverdue > 0) {
                    acc[monthKey].overdueFees += (orderTotal * 0.02 * monthsOverdue);
                }
            }
            
            // Update status
            if (acc[monthKey].dueAmount === 0) {
                acc[monthKey].status = 'paid';
            } else if (acc[monthKey].paidAmount > 0) {
                acc[monthKey].status = 'partial';
            }
            
            return acc;
        }, {});
        
        // Sort orders within each bill by date
        Object.values(monthlyBills).forEach(bill => {
            bill.orders.sort((a, b) => new Date(a.date) - new Date(b.date));
        });
        
        // Convert to array and sort by month (newest first)
        const sortedBills = Object.values(monthlyBills).sort((a, b) => {
            const [aYear, aMonth] = a.id.split('-').map(Number);
            const [bYear, bMonth] = b.id.split('-').map(Number);
            return bYear !== aYear ? bYear - aYear : bMonth - aMonth;
        });
        
        res.json(sortedBills);
    } catch (error) {
        console.error('Error getting monthly bills:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function getMonthsDifference(startDate, endDate) {
    return (
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        endDate.getMonth() - startDate.getMonth()
    );
}

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
