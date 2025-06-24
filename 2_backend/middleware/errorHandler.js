// Global error handling middleware
const errorHandler = (err, req, res, next) => {
    // Log error details
    console.error(`[${new Date().toISOString()}] Error in ${req.method} ${req.path}:`, err.message);
    
    if (process.env.NODE_ENV === 'development' && err.stack) {
        console.error('Stack trace:', err.stack);
    }

    // Default error response
    let statusCode = 500;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    // Handle specific error types
    if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 409;
        message = 'Duplicate entry - resource already exists';
        errorCode = 'DUPLICATE_ENTRY';
    } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        statusCode = 400;
        message = 'Invalid reference - related resource not found';
        errorCode = 'INVALID_REFERENCE';
    } else if (err.code === 'ER_BAD_NULL_ERROR') {
        statusCode = 400;
        message = 'Required field is missing';
        errorCode = 'MISSING_REQUIRED_FIELD';
    } else if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
        statusCode = 400;
        message = 'Invalid value provided';
        errorCode = 'CONSTRAINT_VIOLATION';
    } else if (err.code === 'ECONNREFUSED') {
        statusCode = 503;
        message = 'Database connection failed';
        errorCode = 'DATABASE_CONNECTION_ERROR';
    } else if (err.message) {
        message = err.message;
    }

    const response = { 
        message,
        error: errorCode,
        timestamp: new Date().toISOString()
    };

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
