const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const redis = require('redis')
const cors = require('cors')
let RedisStore  = require('connect-redis')(session)

const { MONGO_IP, MONGO_USER, MONGO_PASSWORD, MONGO_PORT, REDIS_URL, SESSION_SECRET, REDIS_PORT } = require('./config/config')

let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT
})


const postRouter = require('./routes/postRoutes')
const userRouter = require('./routes/userRoutes')
const app = express()
const port = process.env.PORT || 3000
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`

const connectWithRetry = () => {
    mongoose.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => console.log('connected to DB.'))
        .catch(() => {
            console.log('error connecting to DB.')
            setTimeout(connectWithRetry, 5000);
        })
}

connectWithRetry()
app.enable('trust proxy')
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 300000
    }
}))
app.use(cors())
app.use(express.json())
app.use('/api/v1/users', userRouter)
app.use('/api/v1/posts', postRouter)
app.get('/api/v1', (req, res) => {
    res.send('<h1>Hi there!</h1>')
    console.log('yep');
})
app.listen(port, () => console.log(`listing on port ${port}`))
