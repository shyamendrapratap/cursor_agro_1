const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require('cors');
const jsreport = require('jsreport-core')().use(require('jsreport-chrome-pdf')()).use(require('jsreport-jsrender')());
const backupSystem = require('./backup');
const app = express();
const port = process.env.PORT || 3000;
const paymentService = require('./services/paymentService');
const walletService = require('./services/walletService');
const isDevelopment = process.env.NODE_ENV === 'development';

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

    // Load or create products data
    const productsFile = path.join(dataDir, 'products.json');
    if (fs.existsSync(productsFile)) {
        products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    } else {
        products = [];
        saveProducts();
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
function saveProducts() {
    const productsFile = path.join(dataDir, 'products.json');
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
}

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
let products = [];

// Load data on startup
loadInitialData();

// Authentication middleware with token check
const authenticateUserWithToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.split(' ')[1];
    try {
        // For now, we're using a simple token which is the user ID
        // In production, use proper JWT tokens
        const user = users.find(u => u.id === parseInt(token));
        if (user) {
            req.user = user;
            next();
        } else {
            res.status(401).json({ error: "Invalid token" });
        }
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};

// Basic authentication for login
const authenticateLogin = (req, res, next) => {
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
app.post("/api/login", authenticateLogin, (req, res) => {
    // For now, we'll use the user ID as a simple token
    // In production, use proper JWT tokens
    const token = req.user.id.toString();
    res.json({ 
        success: true, 
        user: { 
            id: req.user.id, 
            username: req.user.username, 
            role: req.user.role 
        },
        token
    });
});

// API endpoint for products
app.get("/api/products", (req, res) => {
    // Load products data
    let products = [];
    const productsFile = path.join(dataDir, 'products.json');
    if (fs.existsSync(productsFile)) {
        try {
            products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
        } catch (error) {
            console.error('Error reading products file:', error);
            return res.status(500).json({ error: "Failed to read products data" });
        }
    }
    res.json(products);
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
    
    // Create new product
    const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: name.trim(),
        price: parseFloat(price),
        description: description || "",
        image: image || "/images/cattle1.jpg"
    };
    
    // Add to products array
    products.push(newProduct);
    saveProducts();
    
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
        // Find corresponding product
        const product = products.find(p => p.id === item.productId);
        
        if (product) {
            // Update product fields if provided
            if (name !== undefined) product.name = name.trim();
            if (price !== undefined) product.price = parseFloat(price);
            if (description !== undefined) product.description = description;
            if (image !== undefined) product.image = image;
            
            // Save updated products
            saveProducts();
        }
        
        // Update inventory fields if provided
        if (stock !== undefined) {
            item.quantity = parseInt(stock);
            item.stock = parseInt(stock);
        }
        
        item.lastUpdated = new Date().toISOString();
        saveInventory();
        
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

app.post("/api/orders", authenticateUserWithToken, async (req, res) => {
    try {
        const { customerName, items, total, customerId, useWallet } = req.body;
        
        // Validate order data
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Invalid order items" });
        }

        // Create new order
        const order = {
            id: orders.length + 1,
            customerName,
            items,
            total,
            customerId,
            status: 'pending',
            paymentMethod: useWallet ? 'wallet' : 'pending',
            paymentStatus: useWallet ? 'paid' : 'pending',
            createdAt: new Date().toISOString()
        };

        orders.push(order);
        saveOrders();

        res.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: isDevelopment ? error.message : 'Internal server error' });
    }
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

// Payment Routes
app.post('/api/payments/phonepe/initiate', async (req, res) => {
    try {
        const { amount, billId, customerName } = req.body;
        
        if (!amount || !billId || !customerName) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const result = await paymentService.initiatePhonePePayment(amount, billId, customerName);
        
        if (result.success) {
            // Store the transaction details in payments array
            payments.push({
                transactionId: result.merchantTransactionId,
                billId: billId,
                amount: amount,
                status: 'initiated',
                provider: 'phonepe',
                createdAt: new Date().toISOString()
            });
            savePayments();
            
            res.json(result.data);
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error initiating PhonePe payment:', error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
});

app.post('/api/payments/phonepe/callback', async (req, res) => {
    try {
        const { transactionId } = req.body;
        
        const result = await paymentService.verifyPhonePePayment(transactionId);
        
        if (result.success && result.data.success) {
            // Update payment status
            const payment = payments.find(p => p.transactionId === transactionId);
            if (payment) {
                payment.status = 'completed';
                payment.completedAt = new Date().toISOString();
                savePayments();
                
                // Update bill status
                const bill = monthlyBills.find(b => b.id === payment.billId);
                if (bill) {
                    bill.status = bill.dueAmount <= payment.amount ? 'paid' : 'partial';
                    bill.paidAmount += payment.amount;
                    bill.dueAmount -= payment.amount;
                    saveMonthlyBills();
                }
            }
            
            res.redirect('/payment-success.html');
        } else {
            res.redirect('/payment-failed.html');
        }
    } catch (error) {
        console.error('Error processing PhonePe callback:', error);
        res.redirect('/payment-failed.html');
    }
});

app.post('/api/payments/googlepay/process', async (req, res) => {
    try {
        const { paymentToken, amount, billId } = req.body;
        
        if (!paymentToken || !amount || !billId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const result = await paymentService.processGooglePayPayment(paymentToken, amount, billId);
        
        if (result.success) {
            // Store the transaction details
            payments.push({
                transactionId: result.transactionId,
                billId: billId,
                amount: amount,
                status: 'completed',
                provider: 'googlepay',
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            });
            savePayments();
            
            // Update bill status
            const bill = monthlyBills.find(b => b.id === billId);
            if (bill) {
                bill.status = bill.dueAmount <= amount ? 'paid' : 'partial';
                bill.paidAmount += amount;
                bill.dueAmount -= amount;
                saveMonthlyBills();
            }
            
            res.json({ success: true, transactionId: result.transactionId });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error processing Google Pay payment:', error);
        res.status(500).json({ error: 'Failed to process payment' });
    }
});

// Test endpoint to create a sample bill (only available in development)
app.post('/api/test/create-bill', (req, res) => {
    console.log('Received request to create test bill');
    
    if (!isDevelopment) {
        console.log('Rejecting request: not in development mode');
        return res.status(403).json({ error: 'Test endpoint only available in development mode' });
    }

    try {
        const testBill = {
            id: `TEST_BILL_${Date.now()}`,
            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            customerId: 2,
            customerName: 'Test Customer',
            orders: [],
            totalAmount: 1000.00,
            paidAmount: 0,
            dueAmount: 1000.00,
            overdueFees: 0,
            status: 'unpaid',
            createdAt: new Date().toISOString()
        };

        monthlyBills.push(testBill);
        saveMonthlyBills();

        console.log('Successfully created test bill:', testBill);
        res.json(testBill);
    } catch (error) {
        console.error('Error creating test bill:', error);
        res.status(500).json({ error: 'Failed to create test bill', details: isDevelopment ? error.message : undefined });
    }
});

// Add after app creation
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: isDevelopment ? err.message : 'Internal server error' });
});

// Wallet endpoints (all protected by authentication)
app.get("/api/wallet/balance", authenticateUserWithToken, (req, res) => {
    try {
        const balance = walletService.getBalance(req.user.id);
        res.json({ balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/wallet/transactions", authenticateUserWithToken, (req, res) => {
    try {
        const transactions = walletService.getTransactionHistory(req.user.id);
        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/wallet/add", authenticateUserWithToken, async (req, res) => {
    try {
        const { amount, paymentMethod, transactionId } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }
        const transaction = await walletService.addMoney(req.user.id, amount, paymentMethod, transactionId);
        res.json({ transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/wallet/deduct", authenticateUserWithToken, async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }
        const transaction = await walletService.deductMoney(req.user.id, amount, orderId);
        res.json({ transaction });
    } catch (error) {
        if (error.message === 'Insufficient balance') {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Admin System Management APIs
app.get("/api/dashboard/stats", (req, res) => {
    try {
        // Calculate revenue
        const revenue = orders.reduce((total, order) => {
            if (order.paymentStatus === 'paid') {
                return total + order.total;
            }
            return total;
        }, 0);

        // Calculate revenue change
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthRevenue = orders.reduce((total, order) => {
            const orderDate = new Date(order.createdAt);
            if (order.paymentStatus === 'paid' && orderDate >= lastMonth) {
                return total + order.total;
            }
            return total;
        }, 0);

        const revenueChange = lastMonthRevenue > 0 ? 
            ((revenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;

        // Count active orders
        const activeOrders = orders.filter(order => 
            order.status === 'pending' || order.status === 'processing'
        ).length;

        // Count pending deliveries
        const pendingDeliveries = orders.filter(order => 
            order.status === 'processing'
        ).length;

        // Count low stock items
        const lowStockThreshold = 10;
        const lowStockItems = inventory.filter(item => item.stock <= lowStockThreshold).length;

        // Count active users
        const activeUsers = users.filter(user => user.role === 'customer').length;

        // Count new users this month
        const thisMonth = new Date();
        thisMonth.setMonth(thisMonth.getMonth() - 1);
        const newUsers = users.filter(user => {
            const userCreated = new Date(user.createdAt || 0);
            return userCreated >= thisMonth;
        }).length;

        res.json({
            revenue,
            revenueChange,
            activeOrders,
            pendingDeliveries,
            lowStockItems,
            activeUsers,
            newUsers
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
});

app.get("/api/system/status", (req, res) => {
    try {
        const os = require('os');
        const status = {
            health: 'good',
            cpuUsage: Math.round((1 - os.loadavg()[0]) * 100),
            memoryUsage: Math.round((1 - os.freemem() / os.totalmem()) * 100),
            activeConnections: orders.filter(o => o.status === 'pending').length,
            lastBackup: fs.statSync(path.join(__dirname, 'backups')).mtime,
            uptime: Math.floor(os.uptime() / 3600) + ' hours'
        };
        res.json(status);
    } catch (error) {
        console.error('Error getting system status:', error);
        res.status(500).json({ error: 'Failed to get system status' });
    }
});

app.get("/api/system/audit-logs", (req, res) => {
    try {
        // For now, we'll return recent orders and inventory changes as audit logs
        const auditLogs = [
            ...orders.map(order => ({
                action: 'Order Created',
                user: order.customerName,
                timestamp: order.createdAt,
                details: `Order #${order.id} created for ₹${order.total}`
            })),
            ...inventory.map(item => ({
                action: 'Inventory Updated',
                user: 'System',
                timestamp: item.lastUpdated,
                details: `${item.name} stock updated to ${item.stock}`
            }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(auditLogs);
    } catch (error) {
        console.error('Error getting audit logs:', error);
        res.status(500).json({ error: 'Failed to get audit logs' });
    }
});

app.get("/api/system/settings", (req, res) => {
    try {
        const settings = {
            backupSchedule: 'daily',
            lowStockThreshold: 10,
            billGenerationDay: 1,
            maintenanceTime: '00:00',
            notifications: {
                lowStock: true,
                systemErrors: true,
                newOrders: true
            }
        };
        res.json(settings);
    } catch (error) {
        console.error('Error getting system settings:', error);
        res.status(500).json({ error: 'Failed to get system settings' });
    }
});

app.put("/api/system/settings", (req, res) => {
    try {
        const settings = req.body;
        // In a real app, save these settings to a file or database
        res.json(settings);
    } catch (error) {
        console.error('Error updating system settings:', error);
        res.status(500).json({ error: 'Failed to update system settings' });
    }
});

app.post("/api/system/maintenance", (req, res) => {
    try {
        // Simulate system maintenance
        res.json({
            optimizedTables: 5,
            cleanedRecords: 100,
            updatedIndexes: 3
        });
    } catch (error) {
        console.error('Error running system maintenance:', error);
        res.status(500).json({ error: 'Failed to run system maintenance' });
    }
});

app.get("/api/users", (req, res) => {
    try {
        const userList = users.map(user => ({
            id: user.id,
            name: user.username,
            email: user.email || `${user.username}@example.com`,
            role: user.role,
            active: true
        }));
        res.json(userList);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Bill Cycle and Announcements
app.post("/api/billing/run-cycle", async (req, res) => {
    try {
        // Get all customers
        const customers = users.filter(user => user.role === 'customer');
        let billCount = 0;

        // For each customer
        for (const customer of customers) {
            // Get their unpaid orders
            const unpaidOrders = orders.filter(order => 
                order.customerId === customer.id && 
                order.paymentStatus !== 'paid' &&
                order.status !== 'cancelled'
            );

            if (unpaidOrders.length > 0) {
                // Calculate totals
                const total = unpaidOrders.reduce((sum, order) => sum + order.total, 0);
                const tax = total * 0.05; // 5% tax
                const grandTotal = total + tax;

                // Create monthly bill
                const monthlyBill = {
                    id: `BILL-${Date.now()}-${customer.id}`,
                    customerId: customer.id,
                    customerName: customer.username,
                    orders: unpaidOrders.map(order => ({
                        orderId: order.id,
                        items: order.items,
                        total: order.total,
                        date: order.createdAt
                    })),
                    subtotal: total,
                    tax: tax,
                    total: grandTotal,
                    status: 'unpaid',
                    generatedAt: new Date().toISOString(),
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
                };

                monthlyBills.push(monthlyBill);
                billCount++;

                // Update orders to mark them as billed
                unpaidOrders.forEach(order => {
                    order.billId = monthlyBill.id;
                    order.billedAt = new Date().toISOString();
                });
            }
        }

        // Save changes
        saveMonthlyBills();
        saveOrders();

        res.json({ 
            success: true, 
            billCount,
            message: `Generated ${billCount} bills successfully`
        });
    } catch (error) {
        console.error('Error running bill cycle:', error);
        res.status(500).json({ error: 'Failed to run bill cycle' });
    }
});

// Store announcements in memory (in a real app, this would be in a database)
let announcements = [];

app.post("/api/announcements", (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const announcement = {
            id: Date.now(),
            message,
            createdAt: new Date().toISOString(),
            createdBy: 'admin'
        };

        announcements.unshift(announcement); // Add to start of array
        if (announcements.length > 100) {
            announcements = announcements.slice(0, 100); // Keep only last 100 announcements
        }

        res.json(announcement);
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ error: 'Failed to create announcement' });
    }
});

app.get("/api/announcements", (req, res) => {
    try {
        res.json(announcements);
    } catch (error) {
        console.error('Error getting announcements:', error);
        res.status(500).json({ error: 'Failed to get announcements' });
    }
});

// Reports API endpoints
app.post("/api/reports/:type", async (req, res) => {
    try {
        const { type } = req.params;
        let reportData = {};

        switch (type) {
            case 'sales':
                reportData = {
                    title: 'Sales Report',
                    data: orders.map(order => ({
                        id: order.id,
                        customerName: order.customerName,
                        total: order.total,
                        status: order.status,
                        date: order.createdAt
                    }))
                };
                break;
            case 'inventory':
                reportData = {
                    title: 'Inventory Report',
                    data: inventory.map(item => ({
                        id: item.id,
                        name: item.name,
                        stock: item.stock,
                        lastUpdated: item.lastUpdated
                    }))
                };
                break;
            case 'customers':
                reportData = {
                    title: 'Customer Report',
                    data: users.filter(user => user.role === 'customer').map(user => ({
                        id: user.id,
                        name: user.username,
                        email: user.email,
                        joinDate: user.createdAt
                    }))
                };
                break;
            case 'financial':
                const totalRevenue = orders.reduce((sum, order) => 
                    order.status === 'completed' ? sum + order.total : sum, 0);
                const pendingPayments = orders.reduce((sum, order) => 
                    order.status !== 'completed' ? sum + order.total : sum, 0);
                
                reportData = {
                    title: 'Financial Report',
                    data: {
                        totalRevenue,
                        pendingPayments,
                        orderCount: orders.length,
                        averageOrderValue: totalRevenue / orders.length || 0
                    }
                };
                break;
            default:
                return res.status(400).json({ error: 'Invalid report type' });
        }

        // Generate PDF report
        const result = await jsreport.render({
            template: {
                content: `
                    <h1>{{title}}</h1>
                    <div>Generated on: {{generatedDate}}</div>
                    {{#if data.length}}
                        <table>
                            <thead>
                                <tr>
                                    {{#each headers}}
                                        <th>{{this}}</th>
                                    {{/each}}
                                </tr>
                            </thead>
                            <tbody>
                                {{#each data}}
                                    <tr>
                                        {{#each this}}
                                            <td>{{this}}</td>
                                        {{/each}}
                                    </tr>
                                {{/each}}
                            </tbody>
                        </table>
                    {{else}}
                        <div>
                            {{#each data}}
                                <div>
                                    <strong>{{@key}}:</strong> {{this}}
                                </div>
                            {{/each}}
                        </div>
                    {{/if}}
                `,
                engine: 'jsrender',
                recipe: 'chrome-pdf'
            },
            data: {
                ...reportData,
                generatedDate: new Date().toLocaleString(),
                headers: Object.keys(reportData.data[0] || reportData.data)
            }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${type}-report.pdf"`);
        res.end(result.content);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// System logs API endpoints
app.get("/api/system/logs", (req, res) => {
    try {
        // For now, we'll generate some sample logs
        const logs = [
            {
                level: 'info',
                timestamp: new Date().toISOString(),
                message: 'System started successfully'
            },
            {
                level: 'warning',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                message: 'High CPU usage detected'
            },
            {
                level: 'error',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                message: 'Failed to connect to backup service'
            }
        ];
        res.json(logs);
    } catch (error) {
        console.error('Error getting system logs:', error);
        res.status(500).json({ error: 'Failed to get system logs' });
    }
});

app.get("/api/system/logs/export", (req, res) => {
    try {
        // Generate CSV content
        const logs = [
            {
                level: 'info',
                timestamp: new Date().toISOString(),
                message: 'System started successfully'
            },
            {
                level: 'warning',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                message: 'High CPU usage detected'
            }
        ];

        const csvContent = [
            ['Level', 'Timestamp', 'Message'],
            ...logs.map(log => [log.level, log.timestamp, log.message])
        ].map(row => row.join(',')).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=system-logs.csv');
        res.send(csvContent);
    } catch (error) {
        console.error('Error exporting system logs:', error);
        res.status(500).json({ error: 'Failed to export system logs' });
    }
});

app.delete("/api/system/logs", (req, res) => {
    try {
        // In a real app, this would clear the logs from a database
        res.json({ message: 'Logs cleared successfully' });
    } catch (error) {
        console.error('Error clearing system logs:', error);
        res.status(500).json({ error: 'Failed to clear system logs' });
    }
});

// Wallet management API endpoints
app.get("/api/wallets", (req, res) => {
    try {
        // Get all users with wallet information
        const wallets = users.map(user => ({
            userId: user.id,
            userName: user.username,
            balance: user.wallet?.balance || 0,
            lastTransaction: user.wallet?.lastTransaction || null
        }));
        res.json(wallets);
    } catch (error) {
        console.error('Error getting wallets:', error);
        res.status(500).json({ error: 'Failed to get wallets' });
    }
});

app.post("/api/wallets/:userId/adjust", (req, res) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        const user = users.find(u => u.id === parseInt(userId));
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Initialize wallet if it doesn't exist
        if (!user.wallet) {
            user.wallet = {
                balance: 0,
                transactions: []
            };
        }

        // Update balance
        user.wallet.balance = (user.wallet.balance || 0) + parseFloat(amount);
        user.wallet.lastTransaction = new Date().toISOString();

        // Add transaction record
        user.wallet.transactions = user.wallet.transactions || [];
        user.wallet.transactions.push({
            amount: parseFloat(amount),
            balance: user.wallet.balance,
            type: amount >= 0 ? 'Credit' : 'Debit',
            date: new Date().toISOString()
        });

        saveUsers();
        res.json({ 
            userId: user.id,
            balance: user.wallet.balance,
            lastTransaction: user.wallet.lastTransaction
        });
    } catch (error) {
        console.error('Error adjusting wallet balance:', error);
        res.status(500).json({ error: 'Failed to adjust wallet balance' });
    }
});

app.get("/api/wallets/:userId/history", (req, res) => {
    try {
        const { userId } = req.params;
        const user = users.find(u => u.id === parseInt(userId));
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const transactions = user.wallet?.transactions || [];
        res.json(transactions);
    } catch (error) {
        console.error('Error getting wallet history:', error);
        res.status(500).json({ error: 'Failed to get wallet history' });
    }
});

// System backup API endpoint
app.post("/api/system/backup", async (req, res) => {
    try {
        const backupPath = await backupSystem.createBackup();
        res.json({ 
            success: true,
            backupPath,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({ error: 'Failed to create backup' });
    }
});
