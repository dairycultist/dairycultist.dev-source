// nohup sudo node index.js &

const HOMEPAGE_FILEPATH = "./homepage.html";

const fs = require("fs");

if (process.argv.includes("--insecure")) {

	console.log("Opening on HTTP (--insecure)");

	require("node:http").createServer(handler).listen(80, "0.0.0.0", () => { console.log(`Starting @ http://dairycultist.dev/`); });
	
} else {

	console.log("Opening on HTTPS");

	require("node:https").createServer({
		key: fs.readFileSync("../private.key.pem"),  // path to ssl PRIVATE key from Porkbun
		cert: fs.readFileSync("../domain.cert.pem"), // path to ssl certificate from Porkbun
	}, handler).listen(443, "0.0.0.0", () => { console.log(`Starting @ https://dairycultist.dev/`); });
}

function handler(req, res) {

	console.log("\x1b[90m" + req.method + " " + req.url + "\x1b[0m");

	if (req.method == "GET" || req.method == "HEAD") {

		if (req.url == "/") {
			
			res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
			res.end(fs.readFileSync(HOMEPAGE_FILEPATH, "utf-8"));
			
		} else if (req.url == "/cow.png") {

			try {
				const img = fs.readFileSync("./cow.png");
				res.writeHead(200, { "Content-Type": "image/png" });
				res.end(img);
			} catch (err) {
				res.writeHead(404, { "Content-Type": "text/plain" });
    			res.end("cow.png not found");
			}
			
		} else {
			
			res.writeHead(404, { "Content-Type": "text/plain" });
			res.end(req.url + " Not Found");
		}

	} else {

		res.writeHead(501, { "Content-Type": "text/plain; charset=utf-8" });
		res.end("501 Not Implemented");
	}

}