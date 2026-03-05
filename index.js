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

	if (fs.existsSync("./guestbook.txt"))
		guestbookContent = fs.readFileSync("./guestbook.txt", "utf-8");

	if (req.method == "GET") {

		replyWithHomepage(res, guestbookContent);

	} else if (req.method == "POST" && req.url == "/guestbook") {

		let body = "";

		req.on("data", chunk => {
			body += chunk.toString();
		});

		req.on("end", () => {

			let parts = body.substring(10).split("\r\nmessage=");

			console.log(body);
			console.log(parts);

			let signature = sanitizeHtml(parts[0].trim());
			let message = sanitizeHtml(parts[1].trim());

			if (signature.length == 0)
				signature = "anonymous";
			
			guestbookContent = message + "<br><i> — " + signature + "</i><br><br>" + guestbookContent;

			replyWithHomepage(res, guestbookContent);

			fs.writeFileSync("./guestbook.txt", guestbookContent, "utf-8");
		});

	} else {

		res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
		res.end("404 error");
	}

}).listen(443, "129.153.2.165", () => { console.log(`Starting @ https://dairycultist.dev/`); });

function replyWithHomepage(res, guestbookContent) {

	res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
	res.end(`
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>dairycultist.dev</title>
</head>
<body>
	<p>I like Minecraft clones, medieval fantasy, boomer shooters, and drawings of inordinately fat women (anime/furry/pony).</p>

	<p>Do I blog? No. Am I active on forums? No. But do I have any finished projects for you to see? Also no.</p>

	<h2>Guestbook</h2>
	<form action="/guestbook" method="POST" enctype="text/plain">

		<label for="signature">Signature:</label>
		<input type="text" id="signature" name="signature" placeholder="anonymous"><br><br>

		<label for="message">Message:</label>
		<input type="text" id="message" name="message"><br><br>

		<input type="submit" value="Submit">
	</form>
	<div>` + guestbookContent + `</div>
</body>
</html>
	`);
}