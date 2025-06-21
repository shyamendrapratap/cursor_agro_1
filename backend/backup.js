const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const backupDir = path.join(__dirname, 'backups');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Data files to backup
const dataFiles = [
    'inventory.json',
    'orders.json',
    'users.json',
    'investments.json',
    'expenses.json'
];

function createBackup() {
    const timestamp = new Date();
    const dateStr = timestamp.toISOString().replace(/[:.]/g, '-').split('T')[0];
    const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    const backupName = `backup-${dateStr}-${timeStr}`;
    const backupPath = path.join(backupDir, backupName);
    
    // Create backup directory
    if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
    }
    
    // Copy all data files
    dataFiles.forEach(file => {
        const sourcePath = path.join(dataDir, file);
        const destPath = path.join(backupPath, file);
        
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
        }
    });
    
    // Create backup metadata
    const metadata = {
        timestamp: timestamp.toISOString(),
        files: dataFiles,
        type: 'regular'
    };
    
    fs.writeFileSync(path.join(backupPath, 'metadata.json'), JSON.stringify(metadata, null, 2));
    
    console.log(`Backup created: ${backupName}`);
    return backupName;
}

function createMonthlyBackup() {
    const timestamp = new Date();
    const monthStr = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}`;
    
    const backupName = `monthly-${monthStr}`;
    const backupPath = path.join(backupDir, backupName);
    
    // Check if monthly backup already exists
    if (fs.existsSync(backupPath)) {
        console.log(`Monthly backup for ${monthStr} already exists`);
        return backupName;
    }
    
    // Create backup directory
    fs.mkdirSync(backupPath, { recursive: true });
    
    // Copy all data files
    dataFiles.forEach(file => {
        const sourcePath = path.join(dataDir, file);
        const destPath = path.join(backupPath, file);
        
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
        }
    });
    
    // Create backup metadata
    const metadata = {
        timestamp: timestamp.toISOString(),
        files: dataFiles,
        type: 'monthly'
    };
    
    fs.writeFileSync(path.join(backupPath, 'metadata.json'), JSON.stringify(metadata, null, 2));
    
    console.log(`Monthly backup created: ${backupName}`);
    return backupName;
}

function createYearlyBackup() {
    const timestamp = new Date();
    const yearStr = timestamp.getFullYear().toString();
    
    const backupName = `yearly-${yearStr}`;
    const backupPath = path.join(backupDir, backupName);
    
    // Check if yearly backup already exists
    if (fs.existsSync(backupPath)) {
        console.log(`Yearly backup for ${yearStr} already exists`);
        return backupName;
    }
    
    // Create backup directory
    fs.mkdirSync(backupPath, { recursive: true });
    
    // Copy all data files
    dataFiles.forEach(file => {
        const sourcePath = path.join(dataDir, file);
        const destPath = path.join(backupPath, file);
        
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
        }
    });
    
    // Create backup metadata
    const metadata = {
        timestamp: timestamp.toISOString(),
        files: dataFiles,
        type: 'yearly'
    };
    
    fs.writeFileSync(path.join(backupPath, 'metadata.json'), JSON.stringify(metadata, null, 2));
    
    console.log(`Yearly backup created: ${backupName}`);
    return backupName;
}

function cleanupOldBackups() {
    const backups = fs.readdirSync(backupDir)
        .filter(item => {
            const itemPath = path.join(backupDir, item);
            return fs.statSync(itemPath).isDirectory() && item.startsWith('backup-');
        })
        .sort()
        .reverse();
    
    // Keep only the 5 latest regular backups
    if (backups.length > 5) {
        const toDelete = backups.slice(5);
        toDelete.forEach(backup => {
            const backupPath = path.join(backupDir, backup);
            fs.rmSync(backupPath, { recursive: true, force: true });
            console.log(`Deleted old backup: ${backup}`);
        });
    }
}

function listBackups() {
    const backups = fs.readdirSync(backupDir)
        .filter(item => {
            const itemPath = path.join(backupDir, item);
            return fs.statSync(itemPath).isDirectory();
        })
        .map(backup => {
            const backupPath = path.join(backupDir, backup);
            const metadataPath = path.join(backupPath, 'metadata.json');
            
            let metadata = {};
            if (fs.existsSync(metadataPath)) {
                metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            }
            
            return {
                name: backup,
                type: metadata.type || 'unknown',
                timestamp: metadata.timestamp || 'unknown',
                size: getDirectorySize(backupPath)
            };
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return backups;
}

function getDirectorySize(dirPath) {
    let size = 0;
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
            size += stats.size;
        }
    });
    
    return size;
}

function restoreBackup(backupName) {
    const backupPath = path.join(backupDir, backupName);
    
    if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup ${backupName} not found`);
    }
    
    // Verify backup integrity
    dataFiles.forEach(file => {
        const backupFilePath = path.join(backupPath, file);
        if (!fs.existsSync(backupFilePath)) {
            throw new Error(`Backup file ${file} missing in ${backupName}`);
        }
    });
    
    // Create restore backup before restoring
    const restoreBackupName = `restore-backup-${new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]}`;
    createBackup();
    
    // Restore files
    dataFiles.forEach(file => {
        const sourcePath = path.join(backupPath, file);
        const destPath = path.join(dataDir, file);
        
        fs.copyFileSync(sourcePath, destPath);
    });
    
    console.log(`Backup ${backupName} restored successfully`);
    console.log(`Previous state backed up as ${restoreBackupName}`);
    
    return true;
}

// Schedule regular backups (every 30 minutes)
function startBackupScheduler() {
    console.log('Starting backup scheduler...');
    
    // Create initial backup
    createBackup();
    
    // Schedule regular backups every 30 minutes
    setInterval(() => {
        createBackup();
        cleanupOldBackups();
    }, 30 * 60 * 1000); // 30 minutes
    
    // Check for monthly backup (first day of month)
    setInterval(() => {
        const now = new Date();
        if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
            createMonthlyBackup();
        }
    }, 60 * 1000); // Check every minute
    
    // Check for yearly backup (first day of year)
    setInterval(() => {
        const now = new Date();
        if (now.getMonth() === 0 && now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
            createYearlyBackup();
        }
    }, 60 * 1000); // Check every minute
}

// Export functions for use in other modules
module.exports = {
    createBackup,
    createMonthlyBackup,
    createYearlyBackup,
    cleanupOldBackups,
    listBackups,
    restoreBackup,
    startBackupScheduler
};

// Start scheduler if this file is run directly
if (require.main === module) {
    startBackupScheduler();
} 