let storage;
let pokedexData;
let timeStamp = new Date().getMonth() + "" + new Date().getFullYear(); // Update data timeStamp monthly
let button = document.querySelector("button");

// HELPFUL RESOURCES REGARDING DATA SCRAPPING
//  https://github.com/gzj666-scy/beautiful-soup-js/blob/master/build/min/beautiful.soup.min.js
//  https://stackoverflow.com/questions/10932226/how-do-i-get-source-code-from-a-webpage
//  https://stackoverflow.com/questions/69289275/web-parser-in-javascript-like-beautifulsoup-in-python

const fetchDataMonthly = async () => {
  await fetch(
    // FREE PROXIES https://nordicapis.com/10-free-to-use-cors-proxies/
    `https://api.allorigins.win/get?url=${encodeURIComponent(
      "https://beta.malte.im/raids"
    )}`
  )
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error("Network response was not ok.");
    })
    .then((data) => {
      localStorage.setItem(timeStamp, JSON.stringify(data.contents));
      return data.contents;
    });
};
const getPokedexData = async () => {
  // Replace ./data.json with your JSON feed
  await fetch("./data/pokedex.json")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // Work with JSON data here
      pokedexData = data;
    })
    .catch((err) => {
      console.log(err);
      // Do something for an error here
    });
};

button.addEventListener("click", async () => {
  // Update local data from server and clear old cache
  try {
    let localData = JSON.parse(localStorage.getItem(timeStamp));
    localStorage.clear(); // clear old stored data
    storage = (await fetchDataMonthly()) || localData;
    localStorage.setItem(timeStamp, JSON.stringify(localData));
  } catch {
    storage = JSON.parse(localStorage.getItem(timeStamp)) || "";
  } finally {
    parseDataIntoPokemon(storage);
    Toastify({
      text: "Raids Data Updated",
      duration: 3000,
    }).showToast();
    button.setAttribute("disabled", true);
    setTimeout(() => {
      button.removeAttribute("disabled");
    }, 15000);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  storage =
    JSON.parse(localStorage.getItem(timeStamp)) || (await fetchDataMonthly());
  parseDataIntoPokemon(storage);
});

const boostedWeatherMap = new Map([
  ["Fire", "Sunny/Clear"],
  ["Grass", "Sunny/Clear"],
  ["Ground", "Sunny/Clear"],
  ["Water", "Rain"],
  ["Electric", "Rain"],
  ["Bug", "Rain"],
  ["Fairy", "Cloudy"],
  ["Fighting", "Cloudy"],
  ["Poison", "Cloudy"],
  ["Dragon", "Windy"],
  ["Flying", "Windy"],
  ["Psychic", "Windy"],
  ["Dark", "Fog"],
  ["Ghost", "Fog"],
  ["Ice", "Snow"],
  ["Steel", "Snow"],
  ["Rock", "PartlyCloudy"],
  ["Normal", "PartlyCloudy"],
]);

const parseDataIntoPokemon = async (data) => {
  // Shows 2 options that work, Beautiful Soup and DOMParser
  // I went with DOMParser to avoid extra dependency on libraries for stuff that can be done using Vanilla JS
  // I know comments are bad :)

  const html = data;
  const parser = new DOMParser();
  // const soup = new BeautifulSoup(data);
  // console.log(soup.contents);
  const parsed = parser.parseFromString(html, "text/html");
  let tierList = [];
  let tierNodes = parsed.querySelectorAll(
    ".header-default>div>div:first-child"
  );
  let pokemonGroups = parsed.querySelectorAll(".grid.w-full");
  for (const tier of tierNodes) {
    tierList.push(tier.textContent);
  }
  await getPokedexData();
  for (let i = 0; i < tierList.length; i++)
    buildTier(pokemonGroups[i], tierList[i]);
};

const buildTier = (group, tier) => {
  let div = document.createElement("div");
  let h1 = document.createElement("h1");
  h1.textContent = tier;
  div.appendChild(h1);
  div.classList.add(tier.replace(/[\ ]/g, "-"));
  div.classList.add("tier");
  for (const pokemon of group.querySelectorAll(".bg-slate-700"))
    buildPokemonUnderTier(pokemon, div);
};

const buildPokemonUnderTier = async (pokemon, parentEl) => {
  let article = document.createElement("article");
  article.classList.add("raid-pokemon");
  let dexNumber = pokemon.querySelector("img").src.split("_")[2];
  let variant =
    pokemon
      .querySelector("img")
      ?.alt?.split("_")[1]
      ?.toLowerCase()
      ?.replace("alola", "alolan")
      ?.replace("unset", "") || "";
  let pokemonData = pokedexData.find((pokemon) => pokemon.id == dexNumber);
  let pokemonName = pokemonData.name.english;
  let pokemonType = variant
    ? pokemonData[variant] || pokemonData.type
    : pokemonData.type;
  let boostedWeatherSet = new Set();
  for (const type of pokemonType) {
    boostedWeatherSet.add(boostedWeatherMap.get(type));
  }
  let defaultCP = pokemon.querySelector("span").textContent;
  let boostedCP = pokemon.querySelectorAll("span")[1].textContent;
  let difficultyMeter = [];
  for (const color of pokemon.querySelectorAll("a>div>div")) {
    difficultyMeter.push(color.getAttribute("style"));
  }
  parentEl.appendChild(
    buildUI(
      defaultCP,
      boostedCP,
      difficultyMeter,
      pokemonName,
      variant,
      pokemonType,
      [...boostedWeatherSet].sort(),
      article
    )
  );
  document.body.appendChild(parentEl);
};

const buildUI = (
  defaultCP,
  boostedCP,
  difficultyMeter,
  name,
  form,
  types,
  boostedWeather,
  article
) => {
  let h2 = document.createElement("h2");
  h2.textContent = `${name} ${form}`;
  let imgWrapper = document.createElement("div");
  let pokemon = document.createElement("img");
  let weatherWrapper = document.createElement("div");
  for (const type of types) {
    let img = document.createElement("img");
    img.classList.add("type-disc");
    img.classList.add(type.toLowerCase());
    img.src = `./icons/${type.toLowerCase()}.svg`;
    imgWrapper.appendChild(img);
  }
  for (const weather of boostedWeather) {
    if (weather === "Sunny/Clear") {
      let sunnyIcon = document.createElement("img");
      sunnyIcon.classList.add("weather");
      sunnyIcon.classList.add("Sunny");
      sunnyIcon.src = "./images/Sunny.webp";
      weatherWrapper.appendChild(sunnyIcon);
      let clearIcon = document.createElement("img");
      clearIcon.classList.add("weather");
      clearIcon.classList.add("Clear");
      clearIcon.src = "./images/Clear.webp";
      weatherWrapper.appendChild(clearIcon);
      continue;
    }
    let weatherIcon = document.createElement("img");
    weatherIcon.classList.add("weather");
    weatherIcon.classList.add(weather);
    weatherIcon.src = `./images/${weather}.webp`;
    weatherWrapper.appendChild(weatherIcon);
  }
  pokemon.src = `https://img.pokemondb.net/sprites/home/normal/${(
    name + form.replace("dusk", "").replace(/(.+)/g, "-$1")
  ).toLowerCase()}.png`;
  let span1 = document.createElement("span");
  span1.textContent = defaultCP;
  let span2 = document.createElement("span");
  span2.textContent = boostedCP;
  let ul = document.createElement("ul");
  for (let i = 0; i < 5; i++) {
    let li = document.createElement("li");
    li.textContent = i + 1;
    li.setAttribute("style", difficultyMeter[i]);
    ul.appendChild(li);
  }

  article.append(h2, pokemon, weatherWrapper, imgWrapper, span1, span2, ul);
  return article;
};
