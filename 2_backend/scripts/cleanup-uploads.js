#!/usr/bin/env node

/**
 * Upload Cleanup Script
 * Removes old uploaded files to manage disk space
 */

const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const DAYS_TO_KEEP = process.env.CLEANUP_DAYS || 30; // Keep files for 30 days by default
const DRY_RUN = process.argv.includes('--dry-run');

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function cleanupUploads() {
    console.log(`🧹 Starting upload cleanup (keeping files newer than ${DAYS_TO_KEEP} days)`);
    console.log(`📁 Upload directory: ${UPLOADS_DIR}`);
    
    if (DRY_RUN) {
        console.log('🔍 DRY RUN - No files will be deleted\n');
    }
    
    if (!fs.existsSync(UPLOADS_DIR)) {
        console.log('❌ Upload directory does not exist');
        return;
    }
    
    const files = fs.readdirSync(UPLOADS_DIR);
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (DAYS_TO_KEEP * 24 * 60 * 60 * 1000));
    
    let deletedCount = 0;
    let deletedSize = 0;
    let keptCount = 0;
    let totalSize = 0;
    
    console.log(`📅 Cutoff date: ${cutoffDate.toISOString()}\n`);
    
    files.forEach(filename => {
        const filePath = path.join(UPLOADS_DIR, filename);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
        
        if (stats.mtime < cutoffDate) {
            console.log(`🗑️  DELETE: ${filename} (${formatBytes(stats.size)}) - ${stats.mtime.toISOString()}`);
            
            if (!DRY_RUN) {
                try {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                    deletedSize += stats.size;
                } catch (error) {
                    console.log(`❌ Error deleting ${filename}: ${error.message}`);
                }
            } else {
                deletedCount++;
                deletedSize += stats.size;
            }
        } else {
            keptCount++;
            if (process.argv.includes('--verbose')) {
                console.log(`✅ KEEP: ${filename} (${formatBytes(stats.size)}) - ${stats.mtime.toISOString()}`);
            }
        }
    });
    
    console.log('\n📊 Cleanup Summary:');
    console.log(`📁 Total files processed: ${files.length}`);
    console.log(`🗑️  Files ${DRY_RUN ? 'would be ' : ''}deleted: ${deletedCount}`);
    console.log(`✅ Files kept: ${keptCount}`);
    console.log(`💾 Space ${DRY_RUN ? 'would be ' : ''}freed: ${formatBytes(deletedSize)}`);
    console.log(`📈 Total directory size: ${formatBytes(totalSize)}`);
    
    if (DRY_RUN && deletedCount > 0) {
        console.log('\n💡 Run without --dry-run to actually delete files');
    }
    
    if (deletedCount === 0) {
        console.log('\n🎉 No old files to clean up!');
    }
}

// Show help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Upload Cleanup Script

Usage: node cleanup-uploads.js [options]

Options:
  --dry-run     Show what would be deleted without actually deleting
  --verbose     Show all files (including kept files)
  --help, -h    Show this help message

Environment Variables:
  CLEANUP_DAYS  Number of days to keep files (default: 30)

Examples:
  node cleanup-uploads.js --dry-run     # Preview what would be deleted
  node cleanup-uploads.js              # Actually delete old files
  CLEANUP_DAYS=7 node cleanup-uploads.js  # Keep only 7 days of files
`);
    process.exit(0);
}

// Run cleanup
try {
    cleanupUploads();
} catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
}
