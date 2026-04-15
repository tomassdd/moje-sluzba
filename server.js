const path = require("path");
const express = require("express");
const app = express();
const port = 8081;


app.use(express.json());
app.use(express.static(__dirname));

app.get("/ping", (req, res) => {
	res.send("pong ");
});

app.get("/status", (req, res) => {
	res.json({
		status: "ok",
		autor: "Tom",
		cas: new Date()
	});
});

const fetch = require("node-fetch");

app.post("/ai", async (req, res) => {
	const prompt = req.body.prompt || "Ahoj";

	try {
		const response = await fetch("http://localhost:11434/api/generate", {
		method: "POST",
		headers: {
		 "Content-Type": "application/json"
		},
		body: JSON.stringify({
		 model: "llama3.2:3b",
		 prompt: prompt,
		 stream: false
		})
	});
	const data = await response.json();

	res.json({
	 odpoved: data.response
});
} catch (err) {
	res.json({ error: "AI chyba" });
}
});

app.listen(port,"0.0.0.0", () => {
	console.log("Server bezi na portu  " + port);
});
