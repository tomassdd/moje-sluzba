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
		const response = await fetch("https://kurim.ithope.eu/v1/chat/completions", {
		method: "POST",
		headers: {
		 "Content-Type": "application/json",
		  "Authorization": "Bearer sk--doFqwqtDa8xaBYqlDJJpg"
		},
		body: JSON.stringify({
    	model: "gemma3:27b",
   		messages: [
      	{ role: "user", content: prompt }
    ]
  })
});
		
	const data = await response.json();

	res.json({
	 odpoved: data.choices[0].message.content
});
} catch (err) {
	res.json({ error: "AI chyba" });
}
});

app.listen(port,"0.0.0.0", () => {
	console.log("Server bezi na portu  " + port);
});
