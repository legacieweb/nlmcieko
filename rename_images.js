const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'client', 'public', 'assets', 'images');

if (!fs.existsSync(dir)) {
    console.error('Directory does not exist:', dir);
    process.exit(1);
}

const files = fs.readdirSync(dir);

files.forEach((file) => {
    const oldPath = path.join(dir, file);
    if (fs.lstatSync(oldPath).isFile()) {
        // Create a safe filename: strip spaces, special chars, and lowercase
        let newName = file.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
        
        // Remove consecutive underscores
        newName = newName.replace(/_+/g, '_');
        
        // Remove trailing underscore before extension
        newName = newName.replace(/_\./g, '.');

        const newPath = path.join(dir, newName);
        
        if (oldPath !== newPath) {
            console.log(`Renaming: "${file}" -> "${newName}"`);
            try {
                fs.renameSync(oldPath, newPath);
            } catch (err) {
                console.error(`Failed to rename ${file}:`, err.message);
            }
        }
    }
});
