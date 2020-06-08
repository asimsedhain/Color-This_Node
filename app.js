const express = require("express");
const path = require("path");
const cookie = require("cookie-parser");
const objectId = require("mongodb").ObjectID;
const cors = require("cors");

// Creating the express, mongoclient and also the port from environment varible
const app = express();
const uploadRoute = require("./routes/upload")


// Using middleware
app.use(cookie());
app.use(cors());



app.use("/upload", uploadRoute)



// Handling the first endpoint
// This will return the homepage
app.get("/", (req, res) => {
	res.statusCode = 200;
	res.contentType("application/json");
	res.send(JSON.stringify({"Status": "Working"}))
});




module.exports = app

