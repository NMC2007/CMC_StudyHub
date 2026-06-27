export const toAPIResponse = (status, message, data = null, errors = null, timestamp = new Date().toISOString()) => {
    return {
        data: data,
        errors: errors,
        message: message,
        status: status,
        timestamp: timestamp,
    };
};