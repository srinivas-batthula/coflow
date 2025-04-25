require('dotenv').config({path:'../config.env'})


const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'

    res.status(statusCode).json({
        success: false,
        details: message,
        stack: process.env.MODE === 'development' ? err.stack : undefined
    })
}

module.exports = errorHandler
