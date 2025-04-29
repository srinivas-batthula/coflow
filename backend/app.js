        //app.js
const express = require('express')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const cors = require('cors')
const helmet = require('helmet')
const errorHandler = require('./utils/errorHandler')
require('./services/cron_jobs/hackathonsUpdater')       // Starting Cron-Jobs...
const MainRouter = require('./routes/MainRouter')


const app = express()

app.use(express.urlencoded({ extended: true }))

app.use(express.json())

app.use(cookieParser())

app.use(express.static('public'))

const corsOptions = {
    origin: ['*'], // Allow frontend domain
    credentials: true,               // Allow credentials (cookies)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    maxAge: 600,
}
app.use(cors(corsOptions))

app.options('*', cors(corsOptions))

const limiter = rateLimit({                                  //Must to be used in production to prevent attacks...
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per windowMs
    message: 'Too many requests from this IP, please try again after 2 minutes',
    headers: true,
})
app.use(limiter)

app.use(helmet())


app.get('/', async(req, res) => {
    return res.status(200).json({ 'status': 'success', 'details': `You are Viewing a Non-API Route (${req.url}), Use '/api/' for all other endpoints to access them` })
})

// API Starter...
app.use('/api', MainRouter)


app.use((req, res) => {
    return res.status(404).json({ 'status': 'Not Found', 'details': `Requested path/method {${req.url} & ${req.method}} Not Found` })
})

app.use(errorHandler)


module.exports = app
