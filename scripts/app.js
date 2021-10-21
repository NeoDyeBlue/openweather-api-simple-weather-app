// fetch(
//   "https://api.openweathermap.org/data/2.5/weather?q=plaridel&units=metric&appid=fb8a6e54599109cdbd0a3679746a5ec9"
// )
//   .then((res) => res.json())
//   .then((data) => {
//     city.textContent = data.name;
//     country.textContent = data.sys.country;
//     temp.textContent = data.main.temp;
//   });

//tests
var currentWeather = "cloudy";
var weatherDescription = "broken";

//logo
const gradLogoText = document.getElementById("weather-logo-grad");
//visuals
const weatherVisualizerContainer =
  document.getElementById("weather-visualizer");
const sun = document.getElementById("sun");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = weatherVisualizerContainer.clientWidth;
canvas.height = weatherVisualizerContainer.clientHeight;
//light rain || drizzle || snow 1, 100
//medium rain || drizzle || snow 5, 200
//heavy rain || drizzle || snow 10, 300
//veryheavy rain 20 400
//extreme rain 30 500
var maxParticlesCount = 100; //10
var particleSpawnCount = 1;
var particles = [];
var maxLightning = 5;
var lightningSpawnCount = 1;
var lightnings = [];
//main info
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const cityText = document.getElementById("city-name");
const countryText = document.getElementById("country");
const tempCelsiusText = document.getElementById("temperature-celsius");
const tempFeelsLikeText = document.getElementById("feels-like");
const conditionContainer = document.getElementById("condition-container");
const mainWeatherText = document.getElementById("weather-name");
const weatherDescriptionText = document.getElementById("weather-description");
//more info
const labelIcons = document.querySelectorAll(".c-more-info__icon");
const sunriseText = document.getElementById("sunrise");
const sunsetText = document.getElementById("sunset");
const windSpeedText = document.getElementById("wind-speed");
const humidityText = document.getElementById("humidity");
const pressureText = document.getElementById("pressure");

class RainParticle {
  constructor(width, heigntMin, heightMax) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * 10;
    this.width = width;
    this.height = Math.random() * heightMax + heigntMin;
    this.speedY = Math.random() * 40 + 10;
  }

  update() {
    this.y += this.speedY;
  }

  draw() {
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`;
    ctx.strokeStyle = "white";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class SnowParticle {
  constructor(radiusMin, radiusMax) {
    this.x = Math.random() * canvas.width + 1;
    this.y = Math.random() * 10 + 1;
    this.radius = Math.random() * radiusMax + radiusMin;
    this.color = `rgba(255, 255, 255, ${Math.random() * 0.75 + 0.5})`;
    this.speedX = Math.random() * 1 - 0.5;
    this.speedY = Math.random() * 0.5 + 0.3;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
  }

  draw() {
    ctx.fillStyle = this.color;
    // ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    // ctx.shadowColor = "white";
    ctx.shadowBlur = "100";
    ctx.fill();
  }
}

class Lightning {
  constructor() {
    this.x = Math.random() * canvas.width + 1;
    this.y = 0;
    this.roughnessX = Math.floor(Math.random() * 20 + 10);
    this.roughnessY = Math.floor(Math.random() * 5 + 10);
    this.opacity = Math.random() * 1 + 0.5;
    this.color = `rgba(255,255,255,${this.opacity})`;
  }

  makePaths() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    while (this.y < canvas.height) {
      this.x += Math.floor(
        Math.random() * this.roughnessX + 1 - this.roughnessX / 2
      );
      this.y += Math.floor(this.roughnessY + 1);
      ctx.lineTo(this.x, this.y);
    }
  }

  update() {
    this.opacity -= 0.05;
    if (this.opacity <= 0.1) {
      this.opacity = 0;
    }
    this.color = `rgba(255,255,255,${this.opacity})`;
  }

  draw() {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

window.addEventListener("resize", function () {
  canvas.width = weatherVisualizerContainer.clientWidth;
  canvas.height = weatherVisualizerContainer.clientHeight;
});

function getWeatherData(city) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=fb8a6e54599109cdbd0a3679746a5ec9`
  )
    .then((res) => res.json())
    .then((data) => {
      city.textContent = data.name;
      country.textContent = data.sys.country;
      temp.textContent = data.main.temp;
    });
}

function createParticle() {
  if (particles.length <= maxParticlesCount) {
    for (i = 0; i < particleSpawnCount; i++) {
      //drizzle 1 10 20
      //rain 2 20 30
      //drizzle/rain 1.5 15 25
      //
      particles.push(new RainParticle(2, 20, 30));
      // particles.push(new SnowParticle(1, 5));
    }
  }
}

function createLightning() {
  var d = Math.random();
  if (d < 0.005 && lightnings.length <= 0) {
    for (i = 0; i < lightningSpawnCount; i++) {
      ln = new Lightning();
      lightnings.push(ln);
      ln.makePaths();
    }
  }
}

function particleHandler() {
  for (let i = 0; i < particles.length; i++) {
    particles[i].draw();
    particles[i].update();

    if (
      particles[i].y > canvas.height ||
      particles[i].x < 0 ||
      particles[i].x > canvas.width
    ) {
      particles.splice(i, 1);
      i--;
    }
  }
}

function lightningHandler() {
  for (let i = 0; i < lightnings.length; i++) {
    lightnings[i].draw();
    lightnings[i].update();

    if (lightnings[i].opacity <= 0) {
      lightnings.splice(i, 1);
      i--;
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  createParticle();
  particleHandler();
  createLightning();
  lightningHandler();
  requestAnimationFrame(animate);
}

animate();
