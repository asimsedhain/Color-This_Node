const express = require("express")
const router = express.Router();
const multer = require("multer");
const objectId = require("mongodb").ObjectID;
const path = require("path");

const storage = multer.memoryStorage()



// Setting multer for uploading files
const upload = multer({
	storage: storage,
	limits: { fileSize: 16000000 },
	fileFilter: function (req, file, cb) {
		checkFileType(file, cb);
	}
}).single("Original");



// Endpoint for uploading pictures
// Uploads the picture to the queue
// Uploads the metadata to the database
// Sends the id back to the client 
router.post('/', upload, async (req, res) => {
	if (!req.file) {
		res.status(404).contentType("application/json").send(JSON.stringify({ "Image": null }));
	} else {

		req.file.fieldname = `${Date.now()}${path.extname(req.file.originalname)}`

		image = { _id: objectId(), fieldname: req.file.fieldname, originalname: req.file.originalname, encoding: req.file.encoding, mimetype: req.file.mimetype, size: req.file.size, original: req.file.buffer }

		// Inserting the file to the queue
		req.app.get("redis").lpush(req.app.get("LISTNAME"), JSON.stringify(image));

		// Logging
		console.log(`${new Date().toLocaleString()}: File inserted in queue with id: ${image._id}`);

		// Sending the id back to the client
		res.contentType("application/json");
		res.send(JSON.stringify({ "imageId": image._id }));
	}
});


// Endpoint that handles the request for the image
// Needs to have a id query param
// type: original | color
// Sends the requested image of the type and id
router.get("/:type", async (req, res) => {
	try {

		if ((await req.app.get("finishedList").get(req.query.id)) || req.query.skipDictionary) {

			let cursor = await req.app.get("db").collection(req.app.get("COLLECTION")).find({ "_id": objectId(req.query.id) }).limit(1);
			let doc = await cursor.next();
			res.status(200)
			res.contentType("jpeg")
			res.end(doc[req.params.type.toLocaleLowerCase()].buffer, "binary")
		} else {
			throw "Image still being processed"
		}




	} catch (e) {
		console.log(`${new Date().toLocaleString()}: ${e}`)
		res.status(404).contentType("application/json").send(JSON.stringify({ "Image": null }));

	}

})

// Check File Type
// Middleware helper function
function checkFileType(file, cb) {
	// Allowed ext
	const filetypes = /jpeg|jpg|png/;
	// Check ext
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	// Check mime
	const mimetype = filetypes.test(file.mimetype);

	if (mimetype && extname) {
		return cb(null, true);
	} else {
		cb('Error: Images Only!');
	}
}

module.exports = router