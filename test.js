const fetch = require("node-fetch");


(async () => {
			const response = await fetch('https://i.ytimg.com/vi/MPV2METPeJU/maxresdefault.jpg');
			const body = await response.blob()			
			const ar = await body.arrayBuffer()
			console.log(ar);
			console.log(body.type)
})();
