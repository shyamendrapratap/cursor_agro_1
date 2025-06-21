const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

// Middleware for parsing JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// In-memory data storage (in production, use a database)
let users = [
    { id: 1, username: "admin", password: "admin123", role: "admin" },
    { id: 2, username: "customer1", password: "customer123", role: "customer" }
];

let inventory = [
    { id: 1, productId: 1, quantity: 100, lastUpdated: new Date() },
    { id: 2, productId: 2, quantity: 50, lastUpdated: new Date() },
    { id: 3, productId: 3, quantity: 75, lastUpdated: new Date() },
    { id: 4, productId: 4, quantity: 60, lastUpdated: new Date() },
    { id: 5, productId: 5, quantity: 200, lastUpdated: new Date() },
    { id: 6, productId: 6, quantity: 150, lastUpdated: new Date() },
    { id: 7, productId: 7, quantity: 80, lastUpdated: new Date() }
];

let orders = [];

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
            price: 2.50, 
            description: "Pure, pasteurized cow's milk.", 
            image: "https://images.unsplash.com/photo-1620189507195-68309c04c4d5?auto=format&fit=crop&w=600"
        },
        { 
            id: 2,
            name: "Curd", 
            price: 6.99, 
            description: "Thick and creamy traditional curd.", 
            image: "https://images.unsplash.com/photo-1562119423-f739a8823620?auto=format&fit=crop&w=600"
        },
        { 
            id: 3,
            name: "Buffalow Milk", 
            price: 3.25, 
            description: "Rich and creamy buffalo milk.", 
            image: "https://images.unsplash.com/photo-1620189507195-68309c04c4d5?auto=format&fit=crop&w=600"
        },
        { 
            id: 4,
            name: "Desi Cow Milk", 
            price: 4.00, 
            description: "Pure A2 milk from indigenous cow breeds.", 
            image: "https://images.unsplash.com/photo-1620189507195-68309c04c4d5?auto=format&fit=crop&w=600"
        },
        { 
            id: 5,
            name: "Eggs", 
            price: 5.50, 
            description: "Fresh farm eggs, perfect for cooking.", 
            image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600"
        },
        { 
            id: 6,
            name: "Desi Eggs", 
            price: 7.00, 
            description: "Organic eggs from free-range desi chickens.", 
            image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600"
        },
        { 
            id: 7,
            name: "Greek Yogurt", 
            price: 4.25, 
            description: "Thick and creamy Greek yogurt, high in protein.", 
            image: "https://images.unsplash.com/photo-1562119423-f739a8823620?auto=format&fit=crop&w=600"
        }
    ]);
});

// Inventory endpoints
app.get("/api/inventory", (req, res) => {
    res.json(inventory);
});

app.put("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const item = inventory.find(item => item.id === parseInt(id));
    if (item) {
        item.quantity = quantity;
        item.lastUpdated = new Date();
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
    const newOrder = {
        id: orders.length + 1,
        ...req.body,
        status: "pending",
        createdAt: new Date()
    };
    orders.push(newOrder);
    res.json(newOrder);
});

app.put("/api/orders/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = orders.find(o => o.id === parseInt(id));
    if (order) {
        order.status = status;
        res.json(order);
    } else {
        res.status(404).json({ error: "Order not found" });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
