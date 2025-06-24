const path = require('path');

class PathUtils {
    
    // Normalize file path for database storage
    static normalizeFilePath(filePath, baseDir = null) {
        if (!filePath || filePath === 'null' || filePath === '') {
            return null;
        }
        
        // If it's already a URL, return as-is
        if (filePath.match(/^(https?|ftp):\/\/.+/)) {
            return filePath;
        }
        
        // Handle relative paths starting with uploads/
        if (filePath.startsWith('uploads/')) {
            const uploadsDir = baseDir || path.join(__dirname, '../');
            return path.resolve(uploadsDir, filePath);
        }
        
        // If it's already an absolute path, return as-is
        if (path.isAbsolute(filePath)) {
            return path.normalize(filePath);
        }
        
        // Default: treat as relative to uploads directory
        const uploadsDir = baseDir || path.join(__dirname, '../uploads');
        return path.resolve(uploadsDir, filePath);
    }

    // Get relative path for serving files
    static getRelativePath(absolutePath, baseDir = null) {
        if (!absolutePath) return null;
        
        const uploadsDir = baseDir || path.join(__dirname, '../uploads');
        return path.relative(uploadsDir, absolutePath);
    }

    // Generate unique filename
    static generateUniqueFilename(originalName) {
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1E9);
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
        return `${timestamp}-${random}-${sanitizedName}`;
    }

    // Validate file path for security
    static isValidFilePath(filePath) {
        if (!filePath) return false;
        
        // Check for path traversal attempts
        if (filePath.includes('..') || filePath.includes('~')) {
            return false;
        }
        
        // Check for null bytes
        if (filePath.includes('\0')) {
            return false;
        }
        
        return true;
    }

    // Get file extension
    static getFileExtension(filename) {
        return path.extname(filename).toLowerCase();
    }

    // Check if file is allowed type
    static isAllowedFileType(filename, allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']) {
        const ext = this.getFileExtension(filename);
        return allowedExtensions.includes(ext);
    }
}

module.exports = PathUtils;
