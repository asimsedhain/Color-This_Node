// Getting all the dependencies
const app = require("./app")
const redis = require("async-redis")
const MongoClient = require('mongodb').MongoClient

// Getting the envirionment varibles
const PORT = process.env.PORT
const LISTNAME = process.env.list_name
const COLLECTION = process.env.collection
const DBURI = process.env.DBURI
const DBNAME = process.env.dbname


// Passing environment variables to the app
app.set("LISTNAME", LISTNAME)
app.set("COLLECTION", COLLECTION)



// connecting to the redis server and attaching it to the app
const redisPublisher = redis.createClient({ host: "redis", port: 6379 })
app.set("redis", redisPublisher)

// connecting to the redis finishedList and attaching it to the app
const finishedList = redis.createClient({host: "finishedList", port: 6379})
app.set("finishedList", finishedList)

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

