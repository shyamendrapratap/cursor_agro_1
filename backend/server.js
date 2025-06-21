const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "../frontend")));

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

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
