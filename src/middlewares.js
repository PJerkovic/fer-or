const notFound = (req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (error, req, res, next) => {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);

    const ret = {
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    }

    if (process.env.NODE_ENV === "production") {
        delete ret.stack
    }

    res.json(ret)
};

module.exports = {
    notFound,
    errorHandler,
};
