export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    let code = 'INTERNAL_ERROR';
    if (statusCode === 400) code = 'BAD_REQUEST';
    if (statusCode === 401) code = 'UNAUTHORIZED';
    if (statusCode === 403) code = 'FORBIDDEN';
    if (statusCode === 404) code = 'NOT_FOUND';

    res.status(statusCode).json({
        message: statusCode === 500 && process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
        code,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};

export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
