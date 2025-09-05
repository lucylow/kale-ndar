const { logger } = require('../utils/logger');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      
      logger.warn('Validation error:', {
        path: req.path,
        method: req.method,
        errors: error.details,
      });

      return res.status(400).json({
        error: 'Validation Error',
        message: errorMessage,
        details: error.details,
      });
    }

    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      
      logger.warn('Query validation error:', {
        path: req.path,
        method: req.method,
        errors: error.details,
      });

      return res.status(400).json({
        error: 'Validation Error',
        message: errorMessage,
        details: error.details,
      });
    }

    // Replace req.query with validated data
    req.query = value;
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      
      logger.warn('Params validation error:', {
        path: req.path,
        method: req.method,
        errors: error.details,
      });

      return res.status(400).json({
        error: 'Validation Error',
        message: errorMessage,
        details: error.details,
      });
    }

    // Replace req.params with validated data
    req.params = value;
    next();
  };
};

module.exports = {
  validateRequest,
  validateQuery,
  validateParams,
};
