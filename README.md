# Vibha Agro Dairy - Microservices Application

A complete dairy products e-commerce platform with admin panel, inventory management, and persistent data storage.

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse fresh dairy products
- **Shopping Cart**: Add, remove, and adjust quantities
- **User Authentication**: Secure login system
- **Order Placement**: Place orders with real-time updates
- **Responsive Design**: Works on all devices

### Admin Features
- **Dashboard**: Real-time business metrics
- **Inventory Management**: Update stock levels
- **Order Management**: Process and track orders
- **User Management**: Manage customer accounts

### Technical Features
- **Persistent Data Storage**: All data saved to JSON files
- **Backup System**: Automated data backup and restore
- **RESTful API**: Clean API endpoints
- **Session Management**: Secure user sessions

## 📁 Project Structure

```
dairy-microservices/
├── backend/
│   ├── server.js          # Main server with API endpoints
│   ├── backup.js          # Data backup and restore utility
│   ├── data/              # Persistent data storage (auto-created)
│   │   ├── inventory.json
│   │   ├── orders.json
│   │   └── users.json
│   ├── backups/           # Backup files (auto-created)
│   └── package.json
├── frontend/
│   ├── index.html         # Main customer interface
│   ├── login.html         # Authentication page
│   └── admin.html         # Admin panel
├── install.sh             # Installation script
├── start.sh              # Start server script
├── stop.sh               # Stop server script
└── README.md
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dairy-microservices
   ```

2. **Install dependencies**
   ```bash
   ./install.sh
   # or manually:
   cd backend && npm install
   ```

3. **Start the server**
   ```bash
   ./start.sh
   # or manually:
   cd backend && node server.js
   ```

4. **Access the application**
   - Customer Interface: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin.html
   - Login Page: http://localhost:3000/login.html

## 🔐 Default Credentials

### Admin Access
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full admin panel with inventory and order management

### Customer Access
- **Username**: `customer1`
- **Password**: `customer123`
- **Access**: Product browsing and order placement

## 💾 Data Persistence

### Storage System
- **File-based Storage**: All data stored in JSON files
- **Automatic Creation**: Data files created on first run
- **Real-time Updates**: Changes saved immediately
- **Backup System**: Automated backup and restore functionality

### Data Files Location
- **Inventory**: `backend/data/inventory.json`
- **Orders**: `backend/data/orders.json`
- **Users**: `backend/data/users.json`

### Backup Management

#### Create Backup
```bash
cd backend
node backup.js create
```

#### List Backups
```bash
cd backend
node backup.js list
```

#### Restore Backup
```bash
cd backend
node backup.js restore <backup-name>
```

## 📊 API Endpoints

### Authentication
- `POST /api/login` - User login

### Products
- `GET /api/products` - Get all products

### Inventory
- `GET /api/inventory` - Get inventory status
- `PUT /api/inventory/:id` - Update stock quantity

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

### Users
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create new user

## 🎯 Usage Guide

### For Customers
1. Visit http://localhost:3000
2. Login with customer credentials
3. Browse products and add to cart
4. Place orders through cart interface

### For Admins
1. Login with admin credentials
2. Access admin panel from navbar
3. **Dashboard**: View business metrics
4. **Inventory**: Update stock quantities
5. **Orders**: Manage customer orders

## 🔧 Configuration

### Server Configuration
- **Port**: 3000 (configurable in `server.js`)
- **Data Directory**: `backend/data/` (auto-created)
- **Backup Directory**: `backend/backups/` (auto-created)

### Adding New Products
Edit the products array in `backend/server.js`:
```javascript
{
    id: 8,
    name: "New Product",
    price: 5.99,
    description: "Product description",
    image: "image-url"
}
```

### Adding New Users
Use the API endpoint or edit `backend/data/users.json`:
```json
{
    "id": 3,
    "username": "newuser",
    "password": "password123",
    "role": "customer"
}
```

## 🚨 Important Notes

### Data Security
- Data files are excluded from version control
- Passwords stored in plain text (use encryption in production)
- Backup files contain sensitive data

### Production Considerations
- Use a proper database (MySQL, PostgreSQL, MongoDB)
- Implement password hashing
- Add SSL/TLS encryption
- Set up proper backup automation
- Use environment variables for configuration

## 🐛 Troubleshooting

### Common Issues

1. **Server won't start**
   - Check if port 3000 is available
   - Ensure Node.js is installed
   - Verify all dependencies are installed

2. **Data not persisting**
   - Check file permissions on `backend/data/` directory
   - Ensure disk space is available
   - Verify JSON file syntax

3. **Backup issues**
   - Check `backend/backups/` directory permissions
   - Ensure sufficient disk space
   - Verify backup file integrity

### Logs
- Server logs appear in console
- Data operations logged to console
- Backup operations logged to console

## 📈 Future Enhancements

- [ ] Database integration (MySQL/PostgreSQL)
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Advanced inventory features
- [ ] Customer reviews and ratings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- **Proprietor**: Shanvi Singh
- **Phone**: +91 9246871484
- **Location**: 25°46'43.3"N 85°15'27.0"E

---

**Vibha Agro Dairy** - Fresh dairy products delivered to your doorstep! 🥛
