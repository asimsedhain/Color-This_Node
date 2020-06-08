const app = require("../app")
const expect = require('chai').expect
const request = require("supertest")
const redis = require("async-redis")
const MongoClient = require('mongodb').MongoClient
const path = require("path")
const dotenv = require("dotenv").config()


describe("API Tests", () => {

	// Env Varibales
	const COLLECTION = process.env.DB_COLLECTION
	const DBURI = process.env.DB_URI
	const DBNAME = process.env.DB_NAME
	const LISTNAME = process.env.LIST_NAME



	const sampleIDs = ["5ec14ad608db08b724a2b4e0", "5ec14be608db082acaa2b4e1", "5ec14c1608db080a3ca2b4e3"]


	let dbClient
	let redisPublisher
	let finishedList



	before("Setting up", async () => {

		// Passing the env varibles to app
		app.set("COLLECTION", COLLECTION)
		app.set("LISTNAME", LISTNAME)

		// Creates a redis client
		// Redis server does not need to be there
		// All the events are queued until server is connected
		// No server is needed for the tests to work
		redisPublisher = redis.createClient({ port: 6379 })
		app.set("redis", redisPublisher)

		// connecting to the redis finishedList and attaching it to the app
		// finishedList = redis.createClient({ host: "finishedList", port: 6379 })
		// finishedList = redis.createClient({port:5000})
		// app.set("finishedList", finishedList)
		await redisPublisher.flushall()
		app.set("finishedList", redisPublisher)

		// Connecting to the database
		// Database needs to be connected to get the data
		const client = await MongoClient.connect(DBURI)
		const db = client.db(DBNAME)
		app.set("db", db)
		dbClient = client
	})



	// Testing all the GET endpoints
	describe("GET /upload", async () => {

		// Testing all the sample image ids that skips all the dictionary.
		describe("Get all the images by skipping the dictionary", () => {
			for (let id of sampleIDs) {
				for (let type of ["original", "color"]) {
					it(`should get ${type} sample image with id: ${id}`, async () => {
						const res = await request(app).get(`/upload/${type}?id=${id}&skipDictionary=True`)
						expect(res.statusCode).to.equal(200)
						expect(res.headers["content-type"]).to.eql("image/jpeg")
						expect(res.body).to.be.an("Uint8Array")
					})
				}
			}
		})

		// Testing all the sample image ids that don't skip dictionary
		describe("Get fail all the images from the dictionary", () => {
			for (let id of sampleIDs) {
				for (let type of ["original", "color"]) {
					it(`should fail to get ${type} sample image with id: ${id}`, async () => {
						const res = await request(app).get(`/upload/${type}?id=${id}`)
						expect(res.statusCode).to.equal(404)
						expect(res.headers["content-type"]).to.eql("application/json; charset=utf-8")
						expect(res.body).to.be.a("object")
						expect(res.body).to.have.property("Image")
						expect(res.body.Image).to.be.null
					})
				}
			}
		})




		// Testing all the sample image ids after adding the values
		describe("Get all the images after it is in the dictionary", () => {
			before("Loading finished list data", () => {
				app.get("finishedList").flushall()
				sampleIDs.forEach(async (value) => { await app.get("finishedList").set(value, "true") })

			})
			for (let id of sampleIDs) {
				for (let type of ["original", "color"]) {
					it(`should get ${type} sample image with id: ${id}`, async () => {
						const res = await request(app).get(`/upload/${type}?id=${id}`)
						expect(res.statusCode).to.equal(200)
						expect(res.headers["content-type"]).to.eql("image/jpeg")
						expect(res.body).to.be.an("Uint8Array")
					})
				}
			}
		})




		// Testing invalid id
		it("should return object with image field and null value", async () => {
			const res = await request(app).get("/upload/color?id=asdfaf")
			expect(res.statusCode).to.equal(404)
			expect(res.headers["content-type"]).to.eql("application/json; charset=utf-8")
			expect(res.body).to.be.a("object")
			expect(res.body).to.have.property("Image")
			expect(res.body.Image).to.be.null
		})


	})

	// Testing all the post endpoints
	describe("POST /upload", () => {

		// Testing image uploads
		for (let imagePath of ["./test/sample_image_0.jpg", "./test/sample_image_1.jpg", "./test/sample_image_2.jpg"]) {
			it("should upload the image and return a imageId", async () => {
				const res = await request(app).post("/upload").attach("Original", path.resolve(imagePath))
				expect(res.statusCode).to.equal(200)
				expect(res.headers["content-type"]).to.eql("application/json; charset=utf-8")
				expect(res.body).to.have.property("imageId")
				expect(res.body.imageId).to.be.a("string")
			})
		}

		// Testing invalid images
		it("should fail and return an error", async () => {
			const res = await request(app).post("/upload").attach("Original", path.resolve("./test/sample_image_3.gif"))
			expect(res.statusCode).to.equal(404)
			expect(res.body).to.have.property("error")
			expect(res.body.error).to.be.a("string")
			console.log(res.body)
		})

		describe("POST /upload/url", () => {

			// Testing passing the image URL
			it("should return an image id", async () => {
				const res = await request(app).post("/upload/url").send({ url: "http://www.santoramediagroup.com/wp-content/uploads/2011/09/Pug_puppy-low-res-300x214.jpg" })
				expect(res.statusCode).to.equal(200)
				expect(res.headers["content-type"]).to.eql("application/json; charset=utf-8")
				expect(res.body).to.have.property("imageId")
				expect(res.body.imageId).to.be.a("string")
			})

			// Testing invalid url
			it("should fail and retun an error", async () => {
				const res = await request(app).post("/upload/url")
				expect(res.statusCode).to.equal(404)
				expect(res.body).to.have.property("error")
				expect(res.body.error).to.be.a("string")
				console.log(res.body)

			})

		// Testing the Image URL 
			it("should fail and return an error", async () => {
				const res = await request(app).post("/upload").send({ url: "github.com" })
				expect(res.statusCode).to.equal(404)
				expect(res.body).to.have.property("error")
				expect(res.body.error).to.be.a("string")
				console.log(res.body)
			})
		})


	})


	after("Closing Connections", () => {
		dbClient.close()
		redisPublisher.quit()
		// finishedList.quit()
	})


})