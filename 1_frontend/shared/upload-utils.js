// Standardized Image Upload Utility for Registration Forms
// Provides consistent upload behavior with previews, validation, and error handling

class ImageUploadHandler {
    constructor() {
        this.validTypes = ["image/jpeg", "image/jpg", "image/png"];
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
    }

    // Initialize upload handlers for specified input IDs
    initializeUploads(inputIds) {
        console.log('Initializing uploads for:', inputIds);
        inputIds.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                console.log(`Found input element for ${id}`);
                this.setupUploadHandler(input, id);
                this.setupPreviewContainer(input, id);
            } else {
                console.warn(`Input element not found for ID: ${id}`);
            }
        });
        console.log('Upload initialization complete');
    }

    // Set up individual upload handler
    setupUploadHandler(input, id) {
        console.log(`Setting up upload handler for: ${id}`);
        input.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (!file) {
                console.log(`No file selected for ${id}`);
                return;
            }

            console.log(`File selected for ${id}:`, file.name, file.type, file.size);
            try {
                await this.handleFileUpload(file, id);
            } catch (error) {
                console.error(`Upload error for ${id}:`, error);
                this.showError(id, error.message);
            }
        });
    }

    // Main file upload handling
    async handleFileUpload(file, id) {
        // Clear previous errors
        this.clearError(id);
        
        // Validate file
        this.validateFile(file);
        
        // Show upload progress
        this.showUploadProgress(id, file.name);
        
        try {
            // Upload to server
            const result = await this.uploadToServer(file);
            
            // Handle success
            this.handleUploadSuccess(id, file, result);
            
        } catch (error) {
            // Handle failure
            this.handleUploadFailure(id, error);
            throw error;
        }
    }

    // File validation
    validateFile(file) {
        // Check file type
        if (!this.validTypes.includes(file.type)) {
            throw new Error("Invalid file type. Please upload JPEG or PNG images only.");
        }
        
        // Check file size
        if (file.size > this.maxFileSize) {
            throw new Error("File too large. Maximum size is 5MB.");
        }
    }

    // Upload file to server
    async uploadToServer(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
        }
        
        return data;
    }

    // Handle successful upload
    handleUploadSuccess(id, file, result) {
        // Store file path in localStorage
        localStorage.setItem(`${id}_path`, result.filePath);
        localStorage.setItem(`${id}_filename`, file.name);
        
        // Show success message
        this.showSuccess(id, file.name);
        
        // Show image preview
        this.showImagePreview(id, file);
        
        // Remove upload box error state
        this.clearUploadBoxError(id);
    }

    // Handle upload failure
    handleUploadFailure(id, error) {
        // Clear stored data
        localStorage.removeItem(`${id}_path`);
        localStorage.removeItem(`${id}_filename`);
        
        // Show error
        this.showError(id, error.message);
        
        // Clear file input
        const input = document.getElementById(id);
        if (input) input.value = '';
        
        // Hide preview
        this.hideImagePreview(id);
    }

    // UI Methods
    showUploadProgress(id, filename) {
        const uploadBox = this.getUploadBox(id);
        const direction = uploadBox?.querySelector(".direction");
        
        if (direction) {
            direction.textContent = `Uploading ${filename}...`;
            direction.style.color = "#007bff";
        }
    }

    showSuccess(id, filename) {
        const uploadBox = this.getUploadBox(id);
        const direction = uploadBox?.querySelector(".direction");
        
        if (direction) {
            direction.textContent = `✓ ${filename} uploaded successfully`;
            direction.style.color = "#28a745";
        }
    }

    showError(id, message) {
        const errorElement = document.getElementById(`error-${id}`);
        const uploadBox = this.getUploadBox(id);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.color = "#dc3545";
        }
        
        if (uploadBox) {
            uploadBox.classList.add("error");
            const direction = uploadBox.querySelector(".direction");
            if (direction) {
                direction.style.color = "#dc3545";
            }
        }
    }

    clearError(id) {
        const errorElement = document.getElementById(`error-${id}`);
        if (errorElement) {
            errorElement.textContent = "";
        }
        this.clearUploadBoxError(id);
    }

    clearUploadBoxError(id) {
        const uploadBox = this.getUploadBox(id);
        if (uploadBox) {
            uploadBox.classList.remove("error");
        }
    }

    // Image preview functionality
    setupPreviewContainer(input, id) {
        let preview = document.getElementById(`preview-${id}`);
        if (!preview) {
            preview = document.createElement('div');
            preview.id = `preview-${id}`;
            preview.className = 'image-preview-container';
            preview.style.cssText = `
                display: none;
                margin-top: 15px;
                padding: 10px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                background: #f9f9f9;
                text-align: center;
            `;
            
            const uploadBox = input.closest('.upload-box');
            if (uploadBox) {
                uploadBox.appendChild(preview);
            }
        }
    }

    showImagePreview(id, file) {
        const preview = document.getElementById(`preview-${id}`);
        if (preview && file.type.startsWith('image/')) {
            preview.innerHTML = `
                <img src="${URL.createObjectURL(file)}" 
                     alt="Preview" 
                     style="max-width: 200px; max-height: 150px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">${file.name}</p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #999;">${this.formatFileSize(file.size)}</p>
            `;
            preview.style.display = 'block';
        }
    }

    hideImagePreview(id) {
        const preview = document.getElementById(`preview-${id}`);
        if (preview) {
            preview.style.display = 'none';
            preview.innerHTML = '';
        }
    }

    // Utility methods
    getUploadBox(id) {
        const input = document.getElementById(id);
        return input?.closest(".upload-box");
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Check if all required files are uploaded
    validateAllUploads(requiredIds) {
        const missing = [];
        
        requiredIds.forEach(id => {
            const filePath = localStorage.getItem(`${id}_path`);
            if (!filePath || filePath === 'null') {
                missing.push(id);
            }
        });
        
        return {
            isValid: missing.length === 0,
            missing: missing
        };
    }

    // Get upload status for debugging
    getUploadStatus(ids) {
        const status = {};
        ids.forEach(id => {
            status[id] = {
                path: localStorage.getItem(`${id}_path`),
                filename: localStorage.getItem(`${id}_filename`),
                hasFile: !!document.getElementById(id)?.files[0]
            };
        });
        return status;
    }
}

// Export for use in other files
window.ImageUploadHandler = ImageUploadHandler;
