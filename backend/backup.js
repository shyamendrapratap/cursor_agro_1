const fs = require('fs');
const path = require('path');

// Data file paths
const INVENTORY_FILE = path.join(__dirname, "data/inventory.json");
const ORDERS_FILE = path.join(__dirname, "data/orders.json");
const USERS_FILE = path.join(__dirname, "data/users.json");

// Backup directory
const BACKUP_DIR = path.join(__dirname, "backups");

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
    
    // Create backup directory
    fs.mkdirSync(backupPath, { recursive: true });
    
    // Copy data files
    const files = [
        { src: INVENTORY_FILE, dest: path.join(backupPath, 'inventory.json') },
        { src: ORDERS_FILE, dest: path.join(backupPath, 'orders.json') },
        { src: USERS_FILE, dest: path.join(backupPath, 'users.json') }
    ];
    
    files.forEach(file => {
        if (fs.existsSync(file.src)) {
            fs.copyFileSync(file.src, file.dest);
            console.log(`Backed up: ${path.basename(file.src)}`);
        }
    });
    
    console.log(`Backup created at: ${backupPath}`);
    return backupPath;
}

function restoreBackup(backupPath) {
    if (!fs.existsSync(backupPath)) {
        console.error('Backup path does not exist');
        return false;
    }
    
    const files = [
        { src: path.join(backupPath, 'inventory.json'), dest: INVENTORY_FILE },
        { src: path.join(backupPath, 'orders.json'), dest: ORDERS_FILE },
        { src: path.join(backupPath, 'users.json'), dest: USERS_FILE }
    ];
    
    files.forEach(file => {
        if (fs.existsSync(file.src)) {
            fs.copyFileSync(file.src, file.dest);
            console.log(`Restored: ${path.basename(file.dest)}`);
        }
    });
    
    console.log('Backup restored successfully');
    return true;
}

function listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) {
        console.log('No backups found');
        return;
    }
    
    const backups = fs.readdirSync(BACKUP_DIR)
        .filter(item => fs.statSync(path.join(BACKUP_DIR, item)).isDirectory())
        .sort()
        .reverse();
    
    console.log('Available backups:');
    backups.forEach(backup => {
        const backupPath = path.join(BACKUP_DIR, backup);
        const stats = fs.statSync(backupPath);
        console.log(`- ${backup} (${stats.mtime.toLocaleString()})`);
    });
}

// Command line interface
const command = process.argv[2];

switch (command) {
    case 'create':
        createBackup();
        break;
    case 'restore':
        const backupPath = process.argv[3];
        if (!backupPath) {
            console.error('Please specify backup path');
            process.exit(1);
        }
        restoreBackup(path.join(BACKUP_DIR, backupPath));
        break;
    case 'list':
        listBackups();
        break;
    default:
        console.log('Usage:');
        console.log('  node backup.js create    - Create a new backup');
        console.log('  node backup.js restore <backup-name> - Restore from backup');
        console.log('  node backup.js list      - List available backups');
        break;
} 