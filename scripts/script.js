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
  var rainSize = { width: null, minHeight: null, maxHeight: null };
  var snowSize = { minRadius: null, maxRadius: null };
  var atmosphere = null;
  let atmosphereColor = { first: null, middle: null, last: null };
  var lightningChance = null;
  var isLightning = false;
  var isRaining = false;
  var isSnowing = false;
  var isAtmosphere = false;
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
  var valueContainers = [];
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
      this.y = Math.random() * 5 + 1;
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
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
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
  class Atmosphere {
    constructor(firstColor, secondColor, thirdColor) {
      this.width = canvas.width;
      this.height = canvas.height;
      this.firstColor = firstColor;
      this.secondColor = secondColor;
      this.thirdColor = thirdColor;
      this.gradient = ctx.createLinearGradient(
        this.width / 2,
        0,
        this.width / 2,
        this.height
      );

      this.gradient.addColorStop(0, this.firstColor);
      this.gradient.addColorStop(0.3, this.secondColor);
      this.gradient.addColorStop(1, this.thirdColor);
    }

    update() {
      this.width = canvas.width;
      this.height = canvas.height;
      this.gradient = ctx.createLinearGradient(
        this.width / 2,
        0,
        this.width / 2,
        this.height
      );
      this.gradient.addColorStop(0, this.firstColor);
      this.gradient.addColorStop(0.3, this.secondColor);
      this.gradient.addColorStop(1, this.thirdColor);
    }

    draw() {
      ctx.fillStyle = this.gradient;
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }
  function init() {
    listTextValueContainers();
    animate();
    addListener();
    canvas.width = weatherVisualizerContainer.clientWidth;
    canvas.height = weatherVisualizerContainer.clientHeight;
    getWeatherData(DEFAULT_CITY, KEY);
  }

  function listTextValueContainers() {
    valueContainers.push(cityText.parentNode);
    valueContainers.push(tempCelsiusText.parentNode);
    valueContainers.push(tempFeelsLikeText.parentNode);
    valueContainers.push(mainWeatherText);
    valueContainers.push(weatherDescriptionText);
    valueContainers.push(sunriseText);
    valueContainers.push(sunsetText);
    valueContainers.push(windSpeedText.parentNode);
    valueContainers.push(humidityText.parentNode);
    valueContainers.push(pressureText.parentNode);
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
      // mainWeather: "Snow",
      // weatherDescription: "snow",
      temperature: Math.floor(data.main.temp),
      feelsLike: Math.floor(data.main.feels_like),
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      timezone: data.timezone,
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

  function getTime(sunriseUTC, sunsetUTC, timezone) {
    let UTCDate = new Date().getTime() / 1000;
    let currTime = new Date((UTCDate + timezone) * 1000);
    let sunrise = new Date((sunriseUTC + timezone) * 1000);
    let sunset = new Date((sunsetUTC + timezone) * 1000);
    daynight = "";
    //current time
    let timeHour =
      currTime.getUTCHours() < 10
        ? "0" + currTime.getUTCHours()
        : currTime.getUTCHours();
    let timeMinutes =
      currTime.getUTCMinutes() < 10
        ? "0" + currTime.getUTCMinutes()
        : currTime.getUTCMinutes();
    let timeSeconds =
      currTime.getUTCSeconds() < 10
        ? "0" + currTime.getUTCSeconds()
        : currTime.getUTCSeconds();
    //sunrise format
    let sunriseHour =
      sunrise.getUTCHours() < 10
        ? "0" + sunrise.getUTCHours()
        : sunrise.getUTCHours();
    let sunriseMinutes =
      sunrise.getUTCMinutes() < 10
        ? "0" + sunrise.getUTCMinutes()
        : sunrise.getUTCMinutes();
    let sunriseSeconds =
      sunrise.getUTCSeconds() < 10
        ? "0" + sunrise.getUTCSeconds()
        : sunrise.getUTCSeconds();
    //sunset format
    let sunsetHour =
      sunset.getUTCHours() < 10
        ? "0" + sunset.getUTCHours()
        : sunset.getUTCHours();
    let sunsetMinutes =
      sunset.getUTCMinutes() < 10
        ? "0" + sunset.getUTCMinutes()
        : sunset.getUTCMinutes();
    let sunsetSeconds =
      sunset.getUTCSeconds() < 10
        ? "0" + sunset.getUTCSeconds()
        : sunset.getUTCSeconds();

    let timezoneTime = `${timeHour}:${timeMinutes}:${timeSeconds}`;
    let sunriseTime = `${sunriseHour}:${sunriseMinutes}:${sunriseSeconds}`;
    let sunsetTime = `${sunsetHour}:${sunriseMinutes}:${sunsetSeconds}`;

    if (timezoneTime < sunriseTime || timezoneTime > sunsetTime) {
      daynight = "night";
    } else {
      daynight = "day";
    }

    return {
      daynight,
      sunriseHour,
      sunriseMinutes,
      sunsetHour,
      sunsetMinutes,
    };
    // let sunriseTime = new Date(sunrise * 1000);
    // let sunsetTime = new Date(sunset * 1000);
    // if (currTime < sunriseTime || currTime > sunsetTime) {
    //   return "night";
    // } else {
    //   return "day";
    // }
  }

  function changeAppStylesAndValues(data) {
    let times = getTime(data.sunrise, data.sunset, data.timezone);
    let weather = data.mainWeather.toLowerCase();
    let description = data.weatherDescription.toLowerCase();

    changeParallax(weather, description);
    changeColors(times, weather);
    changeCanvasValues(weather, description);
    changeValues(times, data);
  }

  function changeColors(time, weather) {
    let modifierText = "";

    if (weather == "thundestorm" || weather == "rain" || weather == "drizzle") {
      modifierText = "-rain";
    } else if (weather == "snow") {
      modifierText = "-snow";
    }

    if (time.daynight == "day") {
      sun.classList.add(sun.classList[0] + "--visible");
      moon.className = "c-visualization__moon";
    } else {
      moon.classList.add(moon.classList[0] + "--visible");
      sun.className = "c-visualization__sun";
    }

    skies.forEach((sky) => {
      if (
        sky.classList[1] ==
        sky.classList[0] + `--${time.daynight}${modifierText}`
      ) {
        sky.classList.add(sky.classList[0] + "--visible");
      } else {
        sky.classList.remove(sky.classList[0] + "--visible");
      }
    });

    clouds.forEach((cloud) => {
      cloud.className = cloud.classList[0];
      cloud.classList.add(
        cloud.classList[0] + `--${time.daynight}${modifierText}`
      );
    });

    if (
      weather == "fog" ||
      weather == "smoke" ||
      weather == "haze" ||
      weather == "mist" ||
      weather == "sand" ||
      weather == "dust" ||
      weather == "ash" ||
      weather == "squall" ||
      weather == "tornado"
    ) {
      blurs.forEach((blur) => {
        blur.className = blur.classList[0];
        blur.classList.add(blur.classList[0] + `--${weather}`);
      });
    }

    labelIcons.forEach((icon) => {
      icon.classList.remove(icon.classList[3]);
      icon.classList.add(
        icon.classList[2] + `--${time.daynight}${modifierText}`
      );
    });

    searchButton.classList.remove(searchButton.classList[3]);
    searchButton.classList.add(
      searchButton.classList[2] + `--${time.daynight}${modifierText}`
    );

    gradLogoText.className = gradLogoText.classList[0];
    gradLogoText.classList.add(
      gradLogoText.classList[0] + `--${time.daynight}${modifierText}`
    );
  }

  function changeValues(time, data) {
    cityText.textContent = data.cityName;
    countryText.textContent = data.country;
    tempCelsiusText.textContent = data.temperature;
    tempFeelsLikeText.textContent = data.feelsLike;
    sunriseText.textContent = `${time.sunriseHour}:${time.sunriseMinutes}`;
    sunsetText.textContent = `${time.sunsetHour}:${time.sunsetMinutes}`;
    mainWeatherText.textContent = data.mainWeather;
    weatherDescriptionText.textContent = data.weatherDescription;
    windSpeedText.textContent = data.windSpeed;
    humidityText.textContent = data.humidity;
    pressureText.textContent = data.pressure;

    valueContainers.forEach((container) => {
      container.classList.add(container.classList[0] + "--fadein");
    });
  }

  function changeParallax(weather, description) {
    let parallaxViz = "";

    if (weather == "clouds") {
      parallaxViz = description.toLowerCase().split(" ").join("-");
    } else if (weather == "clear") {
      parallaxViz = "clear-sky";
    } else if (
      weather == "rain" ||
      weather == "thunderstorm" ||
      weather == "drizzle" ||
      weather == "snow"
    ) {
      parallaxViz = "rain-clouds";
    } else if (
      weather == "mist" ||
      weather == "haze" ||
      weather == "smoke" ||
      weather == "fog" ||
      weather == "dust" ||
      weather == "sand" ||
      weather == "ash" ||
      weather == "squall" ||
      weather == "tornado"
    ) {
      parallaxViz = "atmosphere";
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
    let atmosphereColors = {
      blurs: {
        color1: "rgba(255, 255, 255, 0)",
        color2: "rgba(226, 226, 226, 0.5)",
        color3: "rgba(213, 213, 213, 1)",
      },
      dusts: {
        color1: "rgba(235, 202, 151, 0.3)",
        color2: "rgba(162, 127, 71, 0.5)",
        color3: "rgba(190, 116, 55, 1)",
      },
      ash: {
        color1: "rgba(193, 193, 193, 0.3)",
        color2: "rgba(148, 148, 148, 0.5)",
        color3: "rgba(85, 85, 85, 1)",
      },
      squalls: {
        color1: "rgba(177, 177, 177, 0.3)",
        color2: "rgba(139, 139, 139, 0.5)",
        color3: "rgba(93, 93, 93, 1)",
      },
    };
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
      snow: { minRadius: 0.5, maxRadius: 2.5 },
    };

    if (weather == "thunderstorm") {
      isLightning = true;
      isAtmosphere = false;
      if (description == "thunderstorm with light rain") {
        lightningChance = lightningChances.normal;
        maxLightnings = lightningCounts.light;
        isSnowing = false;
        isRaining = true;

        maxParticles = particleCounts.light.max;
        particleSpawnCount = particleCounts.light.spawnCount;
        rainSize.width = particleSizes.rain.width;
        rainSize.minHeight = particleSizes.rain.minHeight;
        rainSize.maxHeight = particleSizes.rain.maxHeight;
      } else if (description == "thunderstorm with rain") {
        lightningChance = lightningChances.normal;
        maxLightnings = lightningCounts.light;
        isSnowing = false;
        isRaining = true;
        maxParticles = particleCounts.medium.max;
        particleSpawnCount = particleCounts.medium.spawnCount;
        rainSize.width = particleSizes.rain.width;
        rainSize.minHeight = particleSizes.rain.minHeight;
        rainSize.maxHeight = particleSizes.rain.maxHeight;
      } else if (description == "thunderstorm with heavy rain") {
        lightningChance = lightningChances.normal;
        maxLightnings = lightningCounts.light;
        isSnowing = false;
        isRaining = true;
        maxParticles = particleCounts.heavy.max;
        particleSpawnCount = particleCounts.heavy.spawnCount;
        rainSize.width = particleSizes.rain.width;
        rainSize.minHeight = particleSizes.rain.minHeight;
        rainSize.maxHeight = particleSizes.rain.maxHeight;
      } else if (description == "light thunderstorm") {
        lightningChance = lightningChances.low;
        maxLightnings = lightningCounts.light;
        isRaining = false;
        isSnowing = false;
      } else if (description == "thunderstorm") {
        lightningChance = lightningChances.normal;
        maxLightnings = lightningCounts.medium;
        isRaining = false;
        isSnowing = false;
      } else if (description == "heavy thunderstorm") {
        console.log("true");
        lightningChance = lightningChances.high;
        maxLightnings = lightningCounts.heavy;
        isRaining = false;
        isSnowing = false;
      } else if (description == "ragged thunderstorm") {
        lightningChance = lightningChances.normal;
        maxLightnings = lightningCounts.medium;
        isRaining = false;
        isSnowing = false;
      } else if (description == "thunderstorm with light drizzle") {
        lightningChance = lightningChances.low;
        maxLightnings = lightningCounts.light;
        isRaining = true;
        isSnowing = false;
        maxParticles = particleCounts.light.max;
        particleSpawnCount = particleCounts.light.spawnCount;
        rainSize.width = particleSizes.drizzle.width;
        rainSize.minHeight = particleSizes.drizzle.minHeight;
        rainSize.maxHeight = particleSizes.drizzle.maxHeight;
      } else if (description == "thunderstorm with drizzle") {
        lightningChance = lightningChances.low;
        maxLightnings = lightningCounts.light;
        isRaining = true;
        isSnowing = false;
        maxParticles = particleCounts.medium.max;
        particleSpawnCount = particleCounts.medium.spawnCount;
        rainSize.width = particleSizes.drizzle.width;
        rainSize.minHeight = particleSizes.drizzle.minHeight;
        rainSize.maxHeight = particleSizes.drizzle.maxHeight;
      } else if (description == "thunderstorm with heavy drizzle") {
        lightningChance = lightningChances.low;
        maxLightnings = lightningCounts.light;
        isRaining = true;
        isSnowing = false;
        maxParticles = particleCounts.heavy.max;
        particleSpawnCount = particleCounts.heavy.spawnCount;
        rainSize.width = particleSizes.drizzle.width;
        rainSize.minHeight = particleSizes.drizzle.minHeight;
        rainSize.maxHeight = particleSizes.drizzle.maxHeight;
      }
    } else if (weather == "drizzle") {
      isLightning = false;
      isSnowing = false;
      isRaining = true;
      isAtmosphere = false;
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
    } else if (weather == "rain") {
      isLightning = false;
      isSnowing = false;
      isRaining = true;
      isAtmosphere = false;
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
    } else if (weather == "snow") {
      isLightning = false;
      isSnowing = true;
      isRaining = false;
      isAtmosphere = false;
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
    } else if (
      weather == "fog" ||
      weather == "smoke" ||
      weather == "haze" ||
      weather == "mist" ||
      weather == "sand" ||
      weather == "dust" ||
      weather == "ash" ||
      weather == "squall" ||
      weather == "tornado"
    ) {
      isAtmosphere = true;
      isRaining = false;
      isLightning = false;
      isSnowing = false;

      if (
        description == "mist" ||
        description == "smoke" ||
        description == "haze" ||
        description == "fog"
      ) {
        atmosphereColor.first = atmosphereColors.blurs.color1;
        atmosphereColor.middle = atmosphereColors.blurs.color2;
        atmosphereColor.last = atmosphereColors.blurs.color3;
      } else if (
        description == "sand" ||
        description == "dust" ||
        description == "sand/ dust whirls"
      ) {
        atmosphereColor.first = atmosphereColors.dusts.color1;
        atmosphereColor.middle = atmosphereColors.dusts.color2;
        atmosphereColor.last = atmosphereColors.dusts.color3;
      } else if (description == "squalls" || description == "tornado") {
        atmosphereColor.first = atmosphereColors.squalls.color1;
        atmosphereColor.middle = atmosphereColors.squalls.color2;
        atmosphereColor.last = atmosphereColors.squalls.color3;
      } else if (description == "volcanic ash") {
        atmosphereColor.first = atmosphereColors.ash.color1;
        atmosphereColor.middle = atmosphereColors.ash.color2;
        atmosphereColor.last = atmosphereColors.ash.color3;
      }
    } else {
      isRaining = false;
      isLightning = false;
      isSnowing = false;
      isAtmosphere = false;
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

      if (
        particles[i].y > canvas.height ||
        particles[i].x > canvas.width ||
        particles[i].x < 0
      ) {
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
    if (atmosphere && isAtmosphere) {
      atmosphere.update();
      atmosphere.draw();
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
      if (chance < lightningChance && lightnings.length <= maxLightnings) {
        ln = new Lightning();
        lightnings.push(ln);
        ln.makePaths();
      }
    }

    if (isAtmosphere) {
      atmosphere = new Atmosphere(
        atmosphereColor.first,
        atmosphereColor.middle,
        atmosphereColor.last
      );
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
    valueContainers.forEach((container) => {
      container.addEventListener("animationend", function () {
        this.classList.remove(this.classList[0] + "--fadein");
      });
    });
    window.addEventListener("resize", resizeCanvas);
    searchInput.addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        searchButton.click();
      }
    });
  }
})();
