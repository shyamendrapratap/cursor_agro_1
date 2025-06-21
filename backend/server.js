const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const port = 3000;

// Middleware for parsing JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Data file paths
const INVENTORY_FILE = path.join(__dirname, "data/inventory.json");
const ORDERS_FILE = path.join(__dirname, "data/orders.json");
const USERS_FILE = path.join(__dirname, "data/users.json");

// Ensure data directory exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Load data from files or create default data
function loadData() {
    // Load or create inventory data
    if (fs.existsSync(INVENTORY_FILE)) {
        inventory = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'));
    } else {
        inventory = [
            { id: 1, productId: 1, quantity: 100, lastUpdated: new Date().toISOString() },
            { id: 2, productId: 2, quantity: 50, lastUpdated: new Date().toISOString() },
            { id: 3, productId: 3, quantity: 75, lastUpdated: new Date().toISOString() },
            { id: 4, productId: 4, quantity: 60, lastUpdated: new Date().toISOString() },
            { id: 5, productId: 5, quantity: 200, lastUpdated: new Date().toISOString() },
            { id: 6, productId: 6, quantity: 150, lastUpdated: new Date().toISOString() },
            { id: 7, productId: 7, quantity: 80, lastUpdated: new Date().toISOString() }
        ];
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

// Initialize data
let users = [];
let inventory = [];
let orders = [];

// Load data on startup
loadData();

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

app.put("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
    const item = inventory.find(item => item.id === parseInt(id));
    if (item) {
        item.stock = parseInt(stock);
        item.lastUpdated = new Date().toISOString();
        saveInventory(); // Save to file
        res.json(item);
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

// Add user management endpoints
app.post("/api/users", (req, res) => {
    const { username, password, role } = req.body;
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username,
        password,
        role: role || "customer"
    };
    users.push(newUser);
    saveUsers(); // Save to file
    res.json(newUser);
});

app.get("/api/users", (req, res) => {
    // Return users without passwords for security
    const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role
    }));
    res.json(safeUsers);
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
    console.log(`Data files location: ${dataDir}`);
});
