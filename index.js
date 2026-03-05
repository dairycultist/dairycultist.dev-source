// sudo node index.js

const HOMEPAGE_FILEPATH = "./homepage.html";
const GUESTBOOK_FILEPATH = "../guestbook.txt";

const fs = require("fs");
const { createServer } = require("node:https");

const sanitizeHtml = require("sanitize-html"); // npm install sanitize-html

const options = {
    key: fs.readFileSync("../private.key.pem"),  // path to ssl PRIVATE key from Porkbun
    cert: fs.readFileSync("../domain.cert.pem"), // path to ssl certificate from Porkbun
};

createServer(options, (req, res) => {

	console.log("\x1b[90m" + req.method + " " + req.url + "\x1b[0m");

	let guestbookContent = "";

	if (fs.existsSync(GUESTBOOK_FILEPATH))
		guestbookContent = fs.readFileSync(GUESTBOOK_FILEPATH, "utf-8");

	if (req.method == "GET" || req.method == "HEAD") {

		replyWithHomepage(res, guestbookContent);

	} else if (req.method == "POST" && req.url == "/guestbook") {

		let body = "";

		req.on("data", chunk => body += chunk.toString());

		req.on("end", () => {

			let parts = body.substring(10).split("\r\nmessage=");

			let signature = sanitizeHtml(parts[0].trim(), { allowedTags: [], allowedAttributes: {} });
			let message   = sanitizeHtml(parts[1].trim(), { allowedTags: [], allowedAttributes: {} });

			if (signature.length == 0)
				signature = "anonymous";

			if (message.length != 0)			
				guestbookContent = message + "<br><i> — " + signature + "</i><br><br>" + guestbookContent;

			replyWithHomepage(res, guestbookContent);

			fs.writeFileSync(GUESTBOOK_FILEPATH, guestbookContent, "utf-8");
		});

	} else {

		res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
		res.end("404 error");
	}

}).listen(443, "0.0.0.0", () => { console.log(`Starting @ https://dairycultist.dev/`); });

function replyWithHomepage(res, guestbookContent) {

	res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
	res.end(fs.readFileSync(HOMEPAGE_FILEPATH, "utf-8").replace("[[[guestbookContent]]]", guestbookContent));
}