// IIFE
const WEATHER_APP = (function () {
  document.addEventListener("DOMContentLoaded", init);

  const DEFAULT_CITY = "plaridel";
  const KEY = "fb8a6e54599109cdbd0a3679746a5ec9";
  //logo
  var gradLogoText = document.getElementById("text-logo-grad");
  //visuals
  var weatherVisualizerContainer =
    document.getElementById("weather-visualizer");
  var weatherVisualizers = document.querySelectorAll(
    ".c-visualization__weather"
  );
  var skies = document.querySelectorAll(".c-sky-background");
  var clouds = document.querySelectorAll(".c-visualization__cloud-image");
  var blurs = document.querySelectorAll(".c-visualization__blurry-image");
  var sun = document.getElementById("sun");
  var moon = document.getElementById("moon");
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var particles = [];
  var lightnings = [];
  var maxParticles = null;
  var particleSpawnCount = null;
  var maxLightnings = null;
  var lightningSpawnCount = null;
  var rainSize = { width: null, minHeight: null, maxHeight: null };
  var snowSize = { minRadius: null, maxRadius: null };
  var lightningChance = null;
  var isLightning = false;
  var isRaining = false;
  var isSnowing = false;
  //main info
  var searchInput = document.getElementById("search-input");
  var searchButton = document.getElementById("search-button");
  var cityText = document.getElementById("city-name");
  var countryText = document.getElementById("country");
  var tempCelsiusText = document.getElementById("temperature-celsius");
  var tempFeelsLikeText = document.getElementById("feels-like");
  var mainWeatherText = document.getElementById("weather-name");
  var weatherDescriptionText = document.getElementById("weather-description");
  //more info
  var labelIcons = document.querySelectorAll(".c-more-info__icon");
  var sunriseText = document.getElementById("sunrise");
  var sunsetText = document.getElementById("sunset");
  var windSpeedText = document.getElementById("wind-speed");
  var humidityText = document.getElementById("humidity");
  var pressureText = document.getElementById("pressure");
  //classes
  class RainParticle {
    constructor(width, heightMin, heightMax) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * 10;
      this.width = width;
      this.height = Math.random() * heightMax + heightMin;
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
  function init() {
    addListener();
    animate();
    canvas.width = weatherVisualizerContainer.clientWidth;
    canvas.height = weatherVisualizerContainer.clientHeight;
    getWeatherData(DEFAULT_CITY, KEY);
  }

  function getWeatherData(city, key) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${key}`
    )
      .then((res) => res.json())
      .then((data) => handleWeatherData(data));
  }

  function handleWeatherData(data) {
    let normalized = {
      cityName: data.name,
      country: data.sys.country,
      mainWeather: data.weather[0].main,
      weatherDescription: data.weather[0].description,
      // mainWeather: "Haze",
      // weatherDescription: "haze",
      temperature: Math.floor(data.main.temp),
      feelsLike: Math.floor(data.main.feels_like),
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      windSpeed: data.wind.speed,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
    };
    changeAppStylesAndValues(normalized);
  }

  function searchWeatherData() {
    let city = searchInput.value.split(" ").join("+");
    let key = KEY;
    getWeatherData(city, key);
  }

  function changeAppStylesAndValues(data) {
    let UTC = Math.floor(new Date().getTime() / 1000);
    let date = new Date().valueOf() / 1000;
    // let dayOrNight = date < data.sunset ? "day" : "night";
    let dayOrNight = null;
    let currUTC = new Date(UTC * 1000);
    let sunrise = new Date(data.sunrise * 1000);
    let sunset = new Date(data.sunset * 1000);
    if (currUTC < sunrise || currUTC > sunset) {
      console.log("night");
      dayOrNight = "night";
    } else {
      dayOrNight = "day";
    }
    let weather = data.mainWeather.toLowerCase();

    changeParallax(data);
    changeColors(dayOrNight, weather);
    changeCanvasValues(data.mainWeather, data.weatherDescription.toLowerCase());
    changeValues(data);
  }

  function changeColors(dayOrNight, weather) {
    if (weather == "thundestorm" || weather == "rain" || weather == "drizzle") {
      weather = "-rain";
    } else if (weather == "snow") {
      weather = "-snow";
    } else {
      weather = "";
    }

    if (dayOrNight == "day") {
      sun.classList.add(sun.classList[0] + "--visible");
      moon.className = "c-visualization__moon";
    } else {
      moon.classList.add(moon.classList[0] + "--visible");
      sun.className = "c-visualization__sun";
    }

    skies.forEach((sky) => {
      if (sky.classList[1] == sky.classList[0] + `--${dayOrNight}${weather}`) {
        sky.classList.add(sky.classList[0] + "--visible");
      } else {
        sky.classList.remove(sky.classList[0] + "--visible");
      }
    });

    clouds.forEach((cloud) => {
      cloud.className = cloud.classList[0];
      cloud.classList.add(cloud.classList[0] + `--${dayOrNight}${weather}`);
      // if (
      //   window.getComputedStyle(cloud.parentNode.parentNode).visibility !==
      //   "hidden"
      // ) {
      //   cloud.className = cloud.classList[0];
      //   cloud.classList.add(cloud.classList[0] + `--${dayOrNight}${weather}`);
      // }
    });

    if (
      weather == "fog" ||
      weather == "smoke" ||
      weather == "haze" ||
      weather == "mist"
    ) {
      blurs.forEach((blur) => {
        blur.className = blur.classList[0];
        blur.classList.add(blur.classList[0] + `--${weather}`);
      });
    }

    labelIcons.forEach((icon) => {
      icon.classList.remove(icon.classList[3]);
      icon.classList.add(icon.classList[2] + `--${dayOrNight}${weather}`);
    });

    searchButton.classList.remove(searchButton.classList[3]);
    searchButton.classList.add(
      searchButton.classList[2] + `--${dayOrNight}${weather}`
    );

    gradLogoText.className = gradLogoText.classList[0];
    gradLogoText.classList.add(
      gradLogoText.classList[0] + `--${dayOrNight}${weather}`
    );
  }

  function changeValues(data) {
    cityText.textContent = data.cityName;
    countryText.textContent = data.country;
    tempCelsiusText.textContent = data.temperature;
    tempFeelsLikeText.textContent = data.feelsLike;
    mainWeatherText.textContent = data.mainWeather;
    weatherDescriptionText.textContent = data.weatherDescription;
    windSpeedText.textContent = data.windSpeed;
    humidityText.textContent = data.humidity;
    pressureText.textContent = data.pressure;
  }

  function changeParallax(data) {
    let parallaxViz = null;

    if (data.mainWeather == "Clouds") {
      parallaxViz = data.weatherDescription.toLowerCase().split(" ").join("-");
    } else if (data.mainWeather == "Clear") {
      parallaxViz = "clear-sky";
    } else if (
      data.mainWeather == "Rain" ||
      data.mainWeather == "Thunderstorm" ||
      data.mainWeather == "Drizzle" ||
      data.mainWeather == "Snow"
    ) {
      parallaxViz = "rain-clouds";
    } else if (
      data.mainWeather == "Mist" ||
      data.mainWeather == "Haze" ||
      data.mainWeather == "Smoke" ||
      data.mainWeather == "Fog"
    ) {
      parallaxViz = "blurry";
    }

    weatherVisualizers.forEach((viz) => {
      if (viz.id == parallaxViz) {
        viz.classList.add(viz.classList[0] + "--visible");
      } else {
        viz.classList.remove(viz.classList[0] + "--visible");
      }
    });
  }

  function changeCanvasValues(weather, description) {
    let lightningChances = { low: 0.003, normal: 0.005, high: 0.007 };
    let lightningCounts = { light: 5, medium: 7, heavy: 9 };
    let particleCounts = {
      light: { spawnCount: 1, max: 100 },
      medium: { spawnCount: 5, max: 200 },
      heavy: { spawnCount: 10, max: 300 },
      veryHeavy: { spawnCount: 20, max: 400 },
      extreme: { spawnCount: 30, max: 500 },
    };
    let particleSizes = {
      drizzle: { width: 1, minHeight: 10, maxHeight: 20 },
      drizzleRain: { width: 1.5, minHeight: 15, maxHeight: 25 },
      rain: { width: 2, minHeight: 20, maxHeight: 30 },
      snow: { minRadius: 1, maxRadius: 5 },
    };

    if (weather == "Thunderstorm") {
      isLightning = true;
      if (description == "thunderstorm with light rain") {
        lightningChance = lightningChances.normal;
        lightningSpawnCount = lightningCounts.light;
        isSnowing = false;
        isRaining = true;
        maxParticles = particleCounts.light.max;
        particleSpawnCount = particleCounts.light.spawnCount;
        rainSize.width = particleSizes.rain.width;
        rainSize.minHeight = particleSizes.rain.minHeight;
        rainSize.maxHeight = particleSizes.rain.maxHeight;
      } else if (description == "thunderstorm with rain") {
        lightningChance = lightningChances.normal;
        lightningSpawnCount = lightningCounts.light;
        isSnowing = false;
        isRaining = true;
        maxParticles = particleCounts.medium.max;
        particleSpawnCount = particleCounts.medium.spawnCount;
        rainSize.width = particleSizes.rain.width;
        rainSize.minHeight = particleSizes.rain.minHeight;
        rainSize.maxHeight = particleSizes.rain.maxHeight;
      } else if (description == "thunderstorm with heavy rain") {
        lightningChance = lightningChances.normal;
        lightningSpawnCount = lightningCounts.light;
        isSnowing = false;
        isRaining = true;
        maxParticles = particleCounts.heavy.max;
        particleSpawnCount = particleCounts.heavy.spawnCount;
        rainSize.width = particleSizes.rain.width;
        rainSize.minHeight = particleSizes.rain.minHeight;
        rainSize.maxHeight = particleSizes.rain.maxHeight;
      } else if (description == "light thunderstorm") {
        lightningChance = lightningChances.low;
        lightningSpawnCount = lightningCounts.light;
        isRaining = false;
        isSnowing = false;
      } else if (description == "thunderstorm") {
        lightningChance = lightningChances.normal;
        lightningSpawnCount = lightningCounts.medium;
        isRaining = false;
        isSnowing = false;
      } else if (description == "heavy thunderstorm") {
        console.log("true");
        lightningChance = lightningChances.high;
        lightningSpawnCount = lightningCounts.heavy;
        isRaining = false;
        isSnowing = false;
      } else if (description == "ragged thunderstorm") {
        lightningChance = lightningChances.normal;
        isRaining = false;
        isSnowing = false;
      } else if (description == "thunderstorm with light drizzle") {
        lightningChance = lightningChances.low;
        lightningSpawnCount = lightningCounts.light;
        isRaining = true;
        isSnowing = false;
        maxParticles = particleCounts.light.max;
        particleSpawnCount = particleCounts.light.spawnCount;
        rainSize.width = particleSizes.drizzle.width;
        rainSize.minHeight = particleSizes.drizzle.minHeight;
        rainSize.maxHeight = particleSizes.drizzle.maxHeight;
      } else if (description == "thunderstorm with drizzle") {
        lightningChance = lightningChances.low;
        lightningSpawnCount = lightningCounts.light;
        isRaining = true;
        isSnowing = false;
        maxParticles = particleCounts.medium.max;
        particleSpawnCount = particleCounts.medium.spawnCount;
        rainSize.width = particleSizes.drizzle.width;
        rainSize.minHeight = particleSizes.drizzle.minHeight;
        rainSize.maxHeight = particleSizes.drizzle.maxHeight;
      } else if (description == "thunderstorm with heavy drizzle") {
        lightningChance = lightningChances.low;
        lightningSpawnCount = lightningCounts.light;
        isRaining = true;
        isSnowing = false;
        maxParticles = particleCounts.heavy.max;
        particleSpawnCount = particleCounts.heavy.spawnCount;
        rainSize.width = particleSizes.drizzle.width;
        rainSize.minHeight = particleSizes.drizzle.minHeight;
        rainSize.maxHeight = particleSizes.drizzle.maxHeight;
      }
    } else if (weather == "Drizzle") {
      isLightning = false;
      isSnowing = false;
      isRaining = true;
      rainSize.width = particleSizes.drizzle.width;
      rainSize.minHeight = particleSizes.drizzle.minHeight;
      rainSize.maxHeight = particleSizes.drizzle.maxHeight;
      if (description == "light intensity drizzle") {
        maxParticles = particleCounts.light.max;
        particleSpawnCount = particleCounts.light.spawnCount;
      } else if (description == "drizzle" || description == "shower drizzle") {
        maxParticles = particleCounts.medium.max;
        particleSpawnCount = particleCounts.medium.spawnCount;
      } else if (description == "heavy intensity drizzle") {
        maxParticles = particleCounts.heavy.max;
        particleSpawnCount = particleCounts.heavy.spawnCount;
      } else if (description == "light intensity drizzle rain") {
        maxParticles = particleCounts.light.max;
        particleSpawnCount = particleCounts.light.spawnCount;
        rainSize.width = particleSizes.drizzleRain.width;
        rainSize.minHeight = particleSizes.drizzleRain.minHeight;
        rainSize.maxHeight = particleSizes.drizzleRain.maxHeight;
      } else if (
        description == "drizzle rain" ||
        description == "shower rain and drizzle"
      ) {
        maxParticles = particleCounts.medium.max;
        particleSpawnCount = particleCounts.medium.spawnCount;
        rainSize.width = particleSizes.drizzleRain.width;
        rainSize.minHeight = particleSizes.drizzleRain.minHeight;
        rainSize.maxHeight = particleSizes.drizzleRain.maxHeight;
      } else if (
        description == "heavy intensity drizzle rain" ||
        description == "heavy shower rain and drizzle"
      ) {
        maxParticles = particleCounts.heavy.max;
        particleSpawnCount = particleCounts.heavy.spawnCount;
        rainSize.width = particleSizes.drizzleRain.width;
        rainSize.minHeight = particleSizes.drizzleRain.minHeight;
        rainSize.maxHeight = particleSizes.drizzleRain.maxHeight;
      }
    } else if (weather == "Rain") {
      isLightning = false;
      isSnowing = false;
      isRaining = true;
      rainSize.width = particleSizes.rain.width;
      rainSize.minHeight = particleSizes.rain.minHeight;
      rainSize.maxHeight = particleSizes.rain.maxHeight;
      if (
        description == "light rain" ||
        description == "light intensity shower rain"
      ) {
        maxParticles = particleCounts.light.max;
        particleSpawnCount = particleCounts.light.spawnCount;
      } else if (
        description == "moderate rain" ||
        description == "freezing rain" ||
        description == "shower rain"
      ) {
        maxParticles = particleCounts.medium.max;
        particleSpawnCount = particleCounts.medium.spawnCount;
      } else if (
        description == "heavy intensity rain" ||
        description == "heavy intensity shower rain"
      ) {
        maxParticles = particleCounts.heavy.max;
        particleSpawnCount = particleCounts.heavy.spawnCount;
      } else if (description == "very heavy rain") {
        maxParticles = particleCounts.veryHeavy.max;
        particleSpawnCount = particleCounts.veryHeavy.spawnCount;
      } else if (description == "extreme rain") {
        maxParticles = particleCounts.extreme.max;
        particleSpawnCount = particleCounts.extreme.spawnCount;
      }
    } else if (weather == "Snow") {
      isLightning = false;
      isSnowing = true;
      snowSize.minRadius = particleSizes.snow.minRadius;
      snowSize.maxRadius = particleSizes.snow.maxRadius;
      if (
        description == "light snow" ||
        description == "light shower sleet" ||
        description == "light shower snow"
      ) {
        maxParticles = particleCounts.light.max;
        particleSpawnCount = particleCounts.light.spawnCount;
      } else if (
        description == "snow" ||
        description == "sleet" ||
        description == "shower sleet" ||
        description == "shower snow"
      ) {
        maxParticles = particleCounts.medium.max;
        particleSpawnCount = particleCounts.medium.spawnCount;
      } else if (
        description == "heavy snow" ||
        description == "heavy shower snow"
      ) {
        maxParticles = particleCounts.heavy.max;
        particleSpawnCount = particleCounts.heavy.spawnCount;
      } else if (description == "light rain and snow") {
        isRaining = true;
        maxParticles = particleCounts.light.max;
        particleSpawnCount = particleCounts.light.spawnCount;
        rainSize.width = particleSizes.rain.width;
        rainSize.minHeight = particleSizes.rain.minHeight;
        rainSize.maxHeight = particleSizes.rain.maxHeight;
      } else if (description == "rain and snow") {
        isRaining = true;
        maxParticles = particleCounts.medium.max;
        particleSpawnCount = particleCounts.medium.spawnCount;
        rainSize.width = particleSizes.rain.width;
        rainSize.minHeight = particleSizes.rain.minHeight;
        rainSize.maxHeight = particleSizes.rain.maxHeight;
      }
    } else {
      isRaining = false;
      isLightning = false;
      isSnowing = false;
    }
  }

  function resizeCanvas() {
    canvas.width = weatherVisualizerContainer.clientWidth;
    canvas.height = weatherVisualizerContainer.clientHeight;
  }

  function drawingHandler() {
    for (let i = 0; i < particles.length; i++) {
      particles[i].draw();
      particles[i].update();

      if (particles[i].y > canvas.height) {
        particles.splice(i, 1);
        i--;
      }
    }
    for (let i = 0; i < lightnings.length; i++) {
      lightnings[i].draw();
      lightnings[i].update();

      if (lightnings[i].opacity <= 0) {
        lightnings.splice(i, 1);
        i--;
      }
    }
  }

  function createCanvasElements() {
    if (isRaining) {
      if (particles.length <= maxParticles) {
        for (i = 0; i < particleSpawnCount; i++) {
          particles.push(
            new RainParticle(
              rainSize.width,
              rainSize.minHeight,
              rainSize.maxHeight
            )
          );
        }
      }
    }
    if (isSnowing) {
      if (particles.length <= maxParticles) {
        for (i = 0; i < particleSpawnCount; i++) {
          particles.push(
            new SnowParticle(snowSize.minRadius, snowSize.maxRadius)
          );
        }
      }
    }

    if (isLightning) {
      let chance = Math.random();
      if (chance < lightningChance && lightnings.length <= 0) {
        for (i = 0; i < lightningSpawnCount; i++) {
          ln = new Lightning();
          lightnings.push(ln);
          ln.makePaths();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    createCanvasElements();
    drawingHandler();
    requestAnimationFrame(animate);
  }

  function addListener() {
    searchButton.addEventListener("click", searchWeatherData);
    window.addEventListener("resize", resizeCanvas);
  }
})();
