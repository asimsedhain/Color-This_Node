<p align="center">
	<h1 align="center">
		Color This
	</h1>
	<p align="center"
	Web Application for Image Colorization using Deep Generative Adversarial Networks.
	</p>
	<p align="center">
	This repo contains the frontend.
	</p>
	<p align="center">
		<a href="https://github.com/asimsedhain/Color-This/graphs/commit-activity">
			<img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
		</a>
		<a href="https://colorthis.z13.web.core.windows.net/">
			<img src="https://img.shields.io/website-up-down-green-red/http/shields.io.svg" />
		</a>
		<a href="/">
			<img src="https://img.shields.io/github/license/Naereen/StrapDown.js.svg" />
		</a>
			<img src="https://github.com/asimsedhain/Color-This/workflows/Continious%20Integration/badge.svg?event=push" />
	</p>
	<p align="center">
	<kbd>
		<img src="https://github.com/asimsedhain/Color-This/raw/master/screen_shot.jpg" />
	</kbd>
	</p>
</p>




## [Demo](https://colorthis.z13.web.core.windows.net/)

The site is hosted [here](https://colorthis.z13.web.core.windows.net/).

## [Model](https://github.com/asimsedhain/Image-Colorization-GAN)

The colorization model is based off of this [paper](https://richzhang.github.io/ideepcolor/).
You can learn more about our training process by heading over to the model repo [here](https://github.com/asimsedhain/Image-Colorization-GAN).

Currenlty our model has the following features:
* 128x128 Image resolution (Advisable to resize your image for improved quality)
* Automatic Colorization
* Great for animal images
* Suffers when there are structures in the image

## Usage

The API can be accessed using the https://colorthis.azurewebsites.net/upload endpoint.

|Type | Endpoint | Description |
|---|---|---|
| POST | `/` | endpoint for uploading the image data. A form data should be passed with the name `original` |
| GET | `/IMAGE_TYPE/ID` | returns the image for the specified `ID`. The `IMAGE_TYPE` should be either `orignal` or `color` for the specific image. It will send a 404 status code if the image is still being processed|

### Examples with JavaScript

### POST `/`
```javascript

// Creating a new form object and passing it using a POST request.

const data = new FormData()
data.append('Original', element.target.files[0])
const response = await fetch('https://colorthis.azurewebsites.net/upload', {
	method: 'POST',
	body: data
	});

// Receiving the IMAGE_ID from the response
const imageId = (await response.json()).imageId;			

```

### GET `/IMAGE_TYPE/ID`
```javascript

<IMG src="https://colorthis.azurewebsites.net/upload/IMAGE_TYPE/ID" />

```

## System Architecture
![system_architecture.jpg](https://github.com/asimsedhain/Color-This/raw/master/system_architecture.jpg)

Our system follows a simple producer-consumer model. Static files and file uploads are handled by a Node server. When a file is uploaded, the Node server pushes the image into the Redis queue and returns an image ID to the client. On the other end, a Python worker is listening for jobs from the Redis queue. When there a job arrives, the worker processes the job and uploads the processed image to the MongoDB. The client can then retrieve the final image by using the image ID. 

## TODO
- [x] Improve UI
- [x] Change queue to get the whole image
- [ ] Add User Interaction
- [x] Add Documentation
- [x] Refactor
- [x] Skin Discoloration
- [x] Move to HTTPS
- [ ] Deploy to Azure Kubernetes
