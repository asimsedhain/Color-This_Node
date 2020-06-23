const fetch = require("node-fetch");


(async () => {
			const response = await fetch('https://media.giphy.com/media/ZnRLfAh6A6h8Y/giphy.gif');
			const body = await response.blob()			
			const ar = await body.arrayBuffer()
})();
