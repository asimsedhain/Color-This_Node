// Getting all the dependencies
const app = require("./app")
const redis = require("async-redis")
const MongoClient = require('mongodb').MongoClient
const dotenv = require("dotenv").config()

// Getting the envirionment varibles
const PORT = process.env.PORT
const LISTNAME = process.env.LIST_NAME
const COLLECTION = process.env.DB_COLLECTION
const DBURI = process.env.DB_URI
const DBNAME = process.env.DB_NAME
const REDISURL = process.env.REDIS_URL
const REDISPASSWORD = process.env.REDIS_PASSWORD
const REDISPORT = process.env.REDIS_PORT


// Passing environment variables to the app
app.set("LISTNAME", LISTNAME)
app.set("COLLECTION", COLLECTION)



// connecting to the redis server and attaching it to the app
// const redisPublisher = redis.createClient({ host: REDISURL, port: REDISPORT, password: REDISPASSWORD })
const redisPublisher= redis.createClient({host: "redis", port: 6379})
app.set("redis", redisPublisher)

// connecting to the redis finishedList and attaching it to the app
// Due to limitation, we will be using the same redis connection for redispublisher and finished list
// const finishedList = redis.createClient({host: "finishedList", port: 6379})
app.set("finishedList", redisPublisher)

// Connecting to the database and attaching it to the app
MongoClient.connect(DBURI, async function (err, client) {
	console.log(`${new Date().toLocaleString()}Connected successfully to server`)

	const db = client.db(DBNAME)

	app.set("db", db)
});


// Listening
app.listen(PORT, () => {
	console.log(`${new Date().toLocaleString()}: Listening on: http://localhost:${PORT}`)
})

