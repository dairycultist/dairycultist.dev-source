const fs = require("fs");
// const { createServer } = require("node:https");
const { createServer } = require("node:http");

// const options = {
//     key: fs.readFileSync("../private.key.pem"),  // path to ssl PRIVATE key from Porkbun
//     cert: fs.readFileSync("../domain.cert.pem"), // path to ssl certificate from Porkbun
// };

createServer((req, res) => {
// createServer(options, (req, res) => {

    const request = req.method + " " + req.url;

    console.log("      \x1b[90m" + request + "\x1b[0m");

	res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>dairycultist.dev</title>
	</head>
	<body>
		I like Minecraft, medieval fantasy, boomer shooters, and inordinately fat women.
	</body>
</html>
	`);

}).listen(3000, "localhost", () => { console.log(`Starting @ http://localhost:3000`); });
// }).listen(443, "129.153.2.165", () => { console.log(`Starting @ https://dairycultist.dev/`); });

