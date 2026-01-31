// Multi-language support logic
let currentLang = localStorage.getItem("portfolioLang") || "nl";

const translationsPath = "./content/translations.json";
let translations = {};

const itemsPath = () => {
  return `./content/items.${currentLang}.json`;
};

fetch(translationsPath)
  .then((res) => res.json())
  .then((t) => {
    translations = t;
    ["title", "firstname", "lastname"].forEach((x) => {
      let el = document.getElementById(x);
      if (el) document.getElementById(x).innerHTML = translations[x];
    });
    addSocials();
    addLocaleSwitcher();
    setLanguage(currentLang);
    addItems();
  });

let data = [];

if (
  [
    "/portfolioNew/index.html",
    "/portfolioNew/",
    "/",
    "/index.html",
    "/preview/index.html",
    "/preview/",
    "/preview",
  ].includes(window.location.pathname) &&
  window.innerWidth > 768
) {
  document.addEventListener("scroll", function () {
    const behindPic = document.getElementById("behindPic");
    const scrollPosition = window.scrollY;
    behindPic.style.right = `-${scrollPosition}px`;
    behindPic.style.opacity = 1 - scrollPosition / 1000;
  });
}

function addItems() {
  fetch(itemsPath())
    .then((Response) => Response.json())
    .then((data) => {
      this.data = data;
      if (
        [
          "/portfolioNew/index.html",
          "/portfolioNew/projects.html",
          "/projects.html",
          "/preview/projects.html",
        ].includes(window.location.pathname)
      ) {
        data.forEach((e, index) => {
          createMiniCard(
            index,
            e.imageSrc[0],
            e.Description,
            e.Title,
            e.segment,
          );
        });
        document.querySelectorAll("main * .mini_card").forEach((card) => {
          card.addEventListener("click", () => {
            goToProject(card.id);
          });
        });
      }

      if (
        [
          "/portfolioNew/project.html",
          "/project.html",
          "/preview/project.html",
        ].includes(window.location.pathname)
      ) {
        changeMainContent();
      }

      if (
        [
          "/portfolioNew/index.html",
          "/portfolioNew/",
          "/",
          "/index.html",
          "/preview/index.html",
          "/preview/",
          "/preview",
        ].includes(window.location.pathname) &&
        window.innerWidth > 768
      ) {
        document.querySelector(".projects-list").innerHTML = "";

        let indexes = [];
        while (indexes.length < 2) {
          let randomIndex = Math.floor(Math.random() * data.length);
          if (!indexes.includes(randomIndex)) {
            indexes.push(randomIndex);
            createMiniCard(
              randomIndex,
              data[randomIndex].imageSrc[0],
              data[randomIndex].Description,
              data[randomIndex].Title,
            );
          }
        }
        document
          .querySelectorAll(".projects-list .mini_card")
          .forEach((card) => {
            card.addEventListener("click", () => {
              goToProject(card.id);
            });
          });

        let comp = document.querySelector(".projects-list");
        comp.insertAdjacentHTML(
          "beforeend",
          '<p class="ubuntu-regular" style="text-align:center; width:100%; margin: 1em 0 0 0;"><a href="./projects.html" >More</a></p>',
        );
      }
    });
}

function addSocials() {
  const items = Object.keys(translations.socials).map(
    (key) =>
      `<a class="social-icon" href="${translations.socials[key]}"><img src="./svg/${key}.svg"></img></a>`,
  );
  const socials = document.getElementById("socials");
  if (socials) socials.innerHTML += items.join("");
  const footerSocials = document.getElementById("footer-socials");
  if (footerSocials)
    footerSocials.innerHTML += items.map((x) => `<li>${x}</li>`).join("");
}

function addLocaleSwitcher() {
  const options = Object.keys(translations.locale).map(
    (l) => `<option value="${l}">${l}</option>`,
  );
  document.querySelector("nav").innerHTML += `<select id="language-select">
    ${options.join("")}   
  </select>`;

  const langSelect = document.getElementById("language-select");
  if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener("change", (e) => {
      currentLang = e.target.value;
      localStorage.setItem("portfolioLang", currentLang);
      setLanguage(currentLang);
      addItems();
    });
  }
}

function setLanguage(lang) {
  // About section
  const aboutContent = document.querySelector(".about-content");
  if (aboutContent && translations.locale[lang]) {
    aboutContent.innerHTML = "";

    Object.values(translations.locale[lang].index).forEach((item) => {
      aboutContent.innerHTML =
        aboutContent.innerHTML + `<p class=\"ubuntu-regular\">${item}</p>`;
    });
  }

  [
    "subtitle",
    "age",
    "location",
    "experiences-title",
    "projects-title",
    "misc-title",
    "events-title",
  ].forEach((x) => {
    const el = document.getElementById(x);
    if (el) document.getElementById(x).innerHTML = translations.locale[lang][x];
  });

  ["experience-list", "project-list", "misc-list", "event-list"].forEach(
    (x) => {
      const comp = document.querySelector(`.${x}`);
      if (comp) comp.innerHTML = "";
    },
  );
}

function createMiniCard(
  id,
  imageSrc,
  cardDescription,
  cardTitle,
  segment = ".projects-list",
) {
  let miniCard = `
        <div class="mini_card" id="${id}">
            <div class="image">
                <img src="${imageSrc}" alt="placeholder">
            </div>
            <div class="info">
                <p class="data ubuntu-regular-italic">${cardDescription}</p>
                <h2 class="ubuntu-bold">${cardTitle}</h2>
            </div>
        </div>
    `;

  let comp = document.querySelector(segment);
  comp.insertAdjacentHTML("beforeend", miniCard);
}

function goToProject(id) {
  window.location.href = "./project.html?id=" + id;
}

function changeMainContent() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const id = urlParams.get("id");

  console.log(id);
  document.querySelector(".imageCarousel").innerHTML = "";
  this.data[id].imageSrc.forEach((src, index) => {
    document
      .querySelector(".imageCarousel")
      .insertAdjacentHTML("beforeend", `<img src="${src}" alt="placeholder">`);
  });

  document.querySelectorAll(".imageCarousel img").forEach((img) => {
    img.addEventListener("click", (event) => {
      showImage(event.target.src);
    });
  });

  document.querySelector("title").innerHTML =
    this.data[id].Title + " | Jeroen Roelant";

  document.querySelector("main .mainBox .title").innerHTML =
    this.data[id].Title;
  document.querySelector("main .mainBox .description").innerHTML =
    this.data[id].Description;
  document.querySelector("main .mainBox .content").innerHTML =
    this.data[id].Content;

  document.querySelector("main").scrollTop = 0;
}

function showImage(src) {
  document.querySelector("body").insertAdjacentHTML(
    "beforeend",
    `
    <div class="blurred">
        <img class="big-image" src="${src}" alt="placeholder">
    </div>`,
  );

  document.querySelector(".blurred").addEventListener("click", () => {
    document.querySelector(".blurred").remove();
  });
}
