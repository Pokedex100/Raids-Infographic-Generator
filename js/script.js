let storage;
// let shinyStorage;
let pokedexData;
// let shinyPokemonsMap = new Map();
let timeStamp = new Date().getMonth() + "" + new Date().getFullYear(); // Update data timeStamp monthly
// let shinyTimeStamp = new Date().getFullYear() + "shiny" + new Date().getMonth();
let button = document.querySelector("button.sync");

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

// const fetchShinyList = async () => {
//   await fetch(
//     // FREE PROXIES https://nordicapis.com/10-free-to-use-cors-proxies/
//     `https://api.allorigins.win/get?url=${encodeURIComponent(
//       "https://raw.githubusercontent.com/Rplus/Pokemon-shiny/0eacd51d7b0959f24ef3e2a3e48d693eb9586171/assets/pms.json"
//     )}`
//   )
//     .then((response) => {
//       if (response.ok) return response.json();
//       throw new Error("Network response was not ok.");
//     })
//     .then((data) => {
//       localStorage.setItem(shinyTimeStamp, JSON.stringify(data.contents));
//       return data.contents;
//     });
// };

button.addEventListener("click", async () => {
  // Update local data from server and clear old cache
  try {
    let localData = JSON.parse(localStorage.getItem(timeStamp));
    // let shinyData = JSON.parse(localStorage.getItem(shinyTimeStamp));
    localStorage.clear(); // clear old stored data
    storage = (await fetchDataMonthly()) || localData;
    // shinyStorage = (await fetchShinyList()) || shinyData;
    // localStorage.setItem(timeStamp, JSON.stringify(localData));
    // localStorage.setItem(shinyTimeStamp, JSON.stringify(shinyData));
  } catch {
    storage = JSON.parse(localStorage.getItem(timeStamp)) || "";
    // shinyStorage = JSON.parse(localStorage.getItem(shinyTimeStamp)) || "";
  } finally {
    parseDataIntoPokemon(storage);
    // convertShinyDataToMap(shinyStorage);
    Toastify({
      text: "Raids Data Updated",
      duration: 3000,
      style: {
        background:
          "linear-gradient(to right, rgb(93, 61, 255), rgba(31, 0, 236, 0.815))",
        borderRadius: "7px",
      },
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
  // shinyStorage =
  //   JSON.parse(localStorage.getItem(shinyTimeStamp)) ||
  //   (await fetchShinyList());
  parseDataIntoPokemon(storage);
  // convertShinyDataToMap(shinyStorage);
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
const fixColor = (color) => {
  if (color.includes("94a3b8") && color.includes("7dd3fc"))
    return "background: #00C052;";
  if (color.includes("16a34a") && color.includes("4ade80"))
    return "background: #d9d030;";
  if (color.includes("d97706") && color.includes("fbbf24"))
    return "background: #d98730;";
  if (color.includes("be123c") && color.includes("f43f5e"))
    return "background: #B80E0E;";
  if (color.includes("94a3b8") && color.includes("cbd5e1"))
    return "background: #474747;";
  return color;
};

// const convertShinyDataToMap = async (data) => {
//   JSON.parse(data).forEach((element) => {
//     shinyPokemonsMap.set(element.dex, element.released_date ?? false);
//   });
// };

const parseDataIntoPokemon = async (data) => {
  // Shows 2 options that work, Beautiful Soup and DOMParser
  // I went with DOMParser to avoid extra dependency on libraries for stuff that can be done using Vanilla JS
  // I know comments are bad :)
  const html = data;
  const parser = new DOMParser();
  // const soup = new BeautifulSoup(data);
  // console.log(soup.contents);
  const parsed = parser.parseFromString(html, "text/html");
  const sortedList = [
    "Tier 1",
    "Shadow Tier 1",
    "Tier 3",
    "Shadow Tier 3",
    "Tier 4",
    "Mega",
    "Tier 5",
    "Ultra Beasts",
    "Shadow Tier 5",
    "Mega Legendary",
    "Primal Legendary",
    "Elite",
  ];
  let tierList = [];
  let tierNodes = parsed.querySelectorAll(
    ".header-default>div>div:first-child"
  );
  let pokemonGroups = parsed.querySelectorAll(".grid.w-full");
  for (const tier of tierNodes) {
    tierList.push(tier.textContent);
  }
  await getPokedexData();

  const toDataURL = async (url) =>
    fetch(url)
      .then((response) => response.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      )
      .then((dataUrl) => {
        return dataUrl;
      });

  const stealColors = async () => {
    let color_thief = new ColorThief();
    let sample_image = new Image();
    let co_sample_image = new Image();

    sample_image.onload = () => {
      let result = ntc.name(
        "#" +
          color_thief
            .getColor(sample_image)
            .map((x) => {
              const hex = x.toString(16);
              return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")
      );
      document
        .querySelector(".chart-container")
        .setAttribute(
          "style",
          `background-color: ${result[0]}; background-image: radial-gradient(at 19% 66%, ${result[1]} 0px, transparent 50%), radial-gradient(at 2% 30%, ${result[2]} 0px, transparent 50%), radial-gradient(at 49% 84%, ${result[3]} 0px, transparent 50%)`
        );
    };
    co_sample_image.onload = () => {
      let result = ntc.name(
        "#" +
          color_thief
            .getColor(sample_image)
            .map((x) => {
              const hex = x.toString(16);
              return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")
      );
      document
        .querySelector(".chart-container")
        .setAttribute(
          "style",
          `background-color: ${result[0]}; background-image: radial-gradient(at 19% 66%, ${result[1]} 0px, transparent 50%), radial-gradient(at 2% 30%, ${result[2]} 0px, transparent 50%), radial-gradient(at 49% 84%, ${result[3]} 0px, transparent 50%)`
        );
    };

    sample_image.crossOrigin = "anonymous";
    sample_image.src = await toDataURL(
      document.querySelector(".Tier-5 img")?.src ||
        document.querySelector(".Shadow-Tier-5 img")?.src
    );
    co_sample_image.crossOrigin = "anonymous";
    co_sample_image.src = await toDataURL(
      document.querySelector(".Mega-Legendary img")?.src ||
        document.querySelector(".Primal-Legendary img")?.src
    );
  };

  const sortedArrays = tierList
    .map((element, index) => ({ element, index }))
    .sort(
      (a, b) => sortedList.indexOf(a.element) - sortedList.indexOf(b.element)
    )
    .reduce(
      (acc, { element, index }) => {
        acc.sortedTierList.push(element);
        acc.sortedPokemonGroups.push(pokemonGroups[index]);
        return acc;
      },
      { sortedTierList: [], sortedPokemonGroups: [] }
    );

  pokemonGroups = sortedArrays.sortedPokemonGroups;
  tierList = sortedArrays.sortedTierList;

  for (let i = 0; i < tierList.length; i++)
    buildTier(pokemonGroups[i], tierList[i]);
  let image = document.createElement("img");
  image.classList.add("image-logo");
  image.setAttribute("height", "80px");
  image.src = "./pokedexDark.png";
  let difficultyLegend = document.createElement("img");
  difficultyLegend.classList.add("difficultyLegend");
  difficultyLegend.setAttribute("height", "85px");
  difficultyLegend.src = "./images/Difficulty.svg";
  let shadowTierInfo = document.createElement("div");
  shadowTierInfo.classList.add("info-tier");
  shadowTierInfo.textContent =
    "Shadow Legendaries will only appear in Shadow Raids during the weekends.";
  shadowTierInfo.addEventListener("click", () => shadowTierInfo.remove());
  document.querySelector(".Shadow-Tier-5")?.appendChild(shadowTierInfo);
  let container = document.querySelector(".chart-container");
  let div = document.createElement("div");
  div.classList.add("flex-div");
  div.appendChild(difficultyLegend);
  div.appendChild(image);
  container.appendChild(div);
  stealColors();
};

const buildTier = (group, tier) => {
  let div = document.createElement("div");
  let h1 = document.createElement("h1");
  h1.textContent = tier;
  h1.classList.add("tier-strip");
  h1.addEventListener("click", () => div.remove());
  div.appendChild(h1);
  div.classList.add(tier.replace(/[\ ]/g, "-"));
  div.classList.add("tier");
  for (const pokemon of group.querySelectorAll(".bg-slate-700"))
    buildPokemonUnderTier(pokemon, div, tier);
};

const buildPokemonUnderTier = async (pokemon, parentEl, tier) => {
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

  let shinyDot = document.createElement("img");
  // if (shinyPokemonsMap.get(Number(dexNumber)))
  shinyDot.src = "./images/shiny.png";
  shinyDot.setAttribute("height", "40px");
  shinyDot.classList.add("shiny");
  shinyDot.addEventListener("click", () => shinyDot.remove());
  article.addEventListener("click", (e) => {
    if (e.target !== shinyDot) article.remove();
  });
  article.appendChild(shinyDot);

  for (const type of pokemonType) {
    boostedWeatherSet.add(boostedWeatherMap.get(type));
  }
  let defaultCP = pokemon.querySelector("span").textContent.replace("CP", "");
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
      article,
      tier
    )
  );
  document.querySelector(".chart-container").appendChild(parentEl);
};

const buildUI = (
  defaultCP,
  boostedCP,
  difficultyMeter,
  name,
  form,
  types,
  boostedWeather,
  article,
  tier
) => {
  let h3 = document.createElement("h3");
  if (tier.includes("Mega")) form = "mega";
  if (form === "o") form = "";
  h3.textContent = form || `empty`;
  let h2 = document.createElement("h2");
  h2.textContent = name;
  if (!form) h3.classList.add("empty");
  let categoryImage = document.createElement("img");
  categoryImage.classList.add("categoryImage");
  categoryImage.setAttribute("height", "25px");
  if (tier.includes("Shadow")) {
    categoryImage.src = "./images/shadow.png";
  } else if (tier.includes("Mega")) {
    categoryImage.src = "./images/megaRaid.png";
  }
  let imgWrapper = document.createElement("div");
  imgWrapper.classList.add("disc-container");
  let pokemon = document.createElement("img");
  let weatherWrapper = document.createElement("div");
  weatherWrapper.classList.add("weather-wrapper");
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
    name + form.replace("dusk", "").replace(/(.+)/g, "-$1").replace("-o", "")
  ).toLowerCase()}.png`;
  pokemon.classList.add("pokemon-image");
  let span1 = document.createElement("span");
  span1.classList.add("non-boosted-cp");
  span1.textContent = defaultCP;
  let span2 = document.createElement("span");
  span2.classList.add("boosted-cp");
  span2.textContent = boostedCP;
  let ul = document.createElement("ul");
  ul.classList.add("difficulty-icons");
  for (let i = 0; i < 5; i++) {
    let li = document.createElement("li");
    li.textContent = i + 1;
    li.setAttribute("style", fixColor(difficultyMeter[i]));
    ul.appendChild(li);
  }
  article.append(
    h2,
    h3,
    pokemon,
    weatherWrapper,
    imgWrapper,
    categoryImage,
    span1,
    span2,
    ul
  );
  return article;
};

let color1 = document.getElementById("color1");
let color2 = document.getElementById("color2");
let title = document.querySelector(".title");

const changeBg = () => {
  document
    .querySelector(".chart-container")
    .setAttribute(
      "style",
      `background-color: ${color1.value}; background-image: radial-gradient(at 19% 66%, ${color2.value} 0px, transparent 50%), radial-gradient(at 2% 30%, ${color1.value} 0px, transparent 50%), radial-gradient(at 49% 84%, ${color2.value} 0px, transparent 50%)`
    );
  let color;
  color = tinycolor(color1.value).isLight() ? "#1a171d" : "#e1d7f6";
  title.setAttribute("style", `color: ${color};`);
  document.querySelector(".image-logo").src = tinycolor(color1.value).isLight()
    ? "./pokedexDark.png"
    : "./pokedex.png";
};

color1.addEventListener("input", changeBg);
color2.addEventListener("input", changeBg);
