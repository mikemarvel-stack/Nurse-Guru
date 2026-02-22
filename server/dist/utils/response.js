"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendValidationError = exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, statusCode = 200, message) => {
    const response = {
        success: true,
        data,
        ...(message && { message })
    };
    res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, error, statusCode = 400, message) => {
    const response = {
        success: false,
        error,
        ...(message && { message })
    };
    res.status(statusCode).json(response);
};
exports.sendError = sendError;
const sendValidationError = (res, errors) => {
    res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors
    });
};
exports.sendValidationError = sendValidationError;
exports.default = {
    sendSuccess: exports.sendSuccess,
    sendError: exports.sendError,
    sendValidationError: exports.sendValidationError
};
//# sourceMappingURL=response.js.map