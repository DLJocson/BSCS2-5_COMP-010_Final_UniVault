const express = require('express');
const { upload } = require('../config/multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// File upload endpoint with enhanced error handling
router.post('/upload', (req, res) => {
    upload.single('file')(req, res, (err) => {
        // Handle multer errors
        if (err) {
            console.error('Upload error:', err);
            
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ 
                    error: 'File too large. Maximum size is 5MB.',
                    code: 'FILE_TOO_LARGE'
                });
            }
            
            if (err.message.includes('Invalid file type')) {
                return res.status(400).json({ 
                    error: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.',
                    code: 'INVALID_FILE_TYPE'
                });
            }
            
            return res.status(400).json({ 
                error: err.message || 'Upload failed',
                code: 'UPLOAD_ERROR'
            });
        }
        
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ 
                error: 'No file uploaded',
                code: 'NO_FILE'
            });
        }
        
        // Log successful upload (only in development)
        if (process.env.NODE_ENV === 'development') {
            console.log('File uploaded successfully:', {
                originalname: req.file.originalname,
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype
            });
        }
        
        // Verify file was actually written to disk
        const filePath = path.join(__dirname, '../uploads', req.file.filename);
        if (!fs.existsSync(filePath)) {
            return res.status(500).json({ 
                error: 'File upload failed - file not saved',
                code: 'UPLOAD_SAVE_ERROR'
            });
        }
        
        // Return file information
        const publicPath = `/uploads/${req.file.filename}`;
        res.json({ 
            success: true,
            filePath: publicPath,
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedAt: new Date().toISOString()
        });
    });
});

module.exports = router;
