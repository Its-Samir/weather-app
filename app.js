require("dotenv").config();
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();

let weatherTemp,
	weatherDesc,
	weatherIcon,
	iconUrl,
	inputCityName,
	weatherCountry,
	weatherHumidity,
	errorMsg;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.render("home");
});

app.get("/credits", (req, res) => {
	res.render("credits");
});

app.get("/weather", (req, res) => {
	res.render("weather", {
		theTemp: weatherTemp,
		theHaze: weatherDesc,
		imageUrl: iconUrl,
		currentCity: inputCityName,
		currentCountry: weatherCountry,
		theHumidity: weatherHumidity,
	});
});

app.get("/error", (req, res) => {
	res.render("errorpage", {
		currentCity: inputCityName,
		errorMessage: errorMsg,
	});
});

app.post("/", function (req, res) {
	const weatherAPI = process.env.WEATHER_API;

	inputCityName = req.body.location;

	const apiUrl =
		"https://api.openweathermap.org/data/2.5/weather?q=" +
		inputCityName +
		"&appid=" +
		weatherAPI +
		"&units=metric";

	https.get(apiUrl, (response) => {
		response.on("data", (data) => {
			const parsedData = JSON.parse(data);

			if (parsedData.message) {
				errorMsg = parsedData.message;
				res.redirect("/error");
			} else {
				weatherIcon = parsedData.weather[0].icon;
				weatherTemp = Math.round(parsedData.main.temp);
				weatherHumidity = parsedData.main.humidity;
				weatherCountry = parsedData.sys.country;
				weatherDesc = _.upperFirst(parsedData.weather[0].description);
				iconUrl =
					"https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";
				res.redirect("/weather");
			}
		});
	});
});

app.listen(3000, () => {
	console.log("Running...");
});
