window.addEventListener("load", initPage);

// initPage runs after the page loads, so the HTML buttons already exist.
function initPage() {
  var savedTheme = localStorage.getItem("selectedTheme");

  // localStorage remembers small pieces of information after a refresh.
  // Here it remembers which theme the visitor picked last.
  if (savedTheme !== null) {
    applyTheme(savedTheme);
  }

  setupThemeButtons();
  setupCursorButtons();
  setupScribeButton();
  setupMagicEffects();
}

function setupThemeButtons() {
  var moonlightButton = document.getElementById("moonlight-theme-button");
  var solarButton = document.getElementById("solar-theme-button");
  var forestButton = document.getElementById("forest-theme-button");
  var desertButton = document.getElementById("desert-theme-button");

  // These checks let this shared file work on pages without theme buttons.
  if (moonlightButton !== null) {
    moonlightButton.addEventListener("click", function () {
      applyTheme("moonlight");
    });
  }

  if (solarButton !== null) {
    solarButton.addEventListener("click", function () {
      applyTheme("solar");
    });
  }

  if (forestButton !== null) {
    forestButton.addEventListener("click", function () {
      applyTheme("forest");
    });
  }

  if (desertButton !== null) {
    desertButton.addEventListener("click", function () {
      applyTheme("desert");
    });
  }
}

function applyTheme(themeName) {
  // Remove old themes before adding the new one.
  document.body.classList.remove("moonlight", "solar", "forest", "desert");
  document.body.classList.add(themeName);

  // Save the theme so the page can use it again after refreshing.
  localStorage.setItem("selectedTheme", themeName);
}

function setupCursorButtons() {
  var savedCursor = localStorage.getItem("selectedCursor") || "default";
  var defaultButton = document.getElementById("default-cursor-button");
  var wandButton = document.getElementById("wand-cursor-button");
  var bladeButton = document.getElementById("blade-cursor-button");

  applyCursor(savedCursor);

  if (defaultButton !== null) {
    defaultButton.addEventListener("click", function () {
      applyCursor("default");
    });
  }

  if (wandButton !== null) {
    wandButton.addEventListener("click", function () {
      applyCursor("wand");
    });
  }

  if (bladeButton !== null) {
    bladeButton.addEventListener("click", function () {
      applyCursor("blade");
    });
  }
}

function applyCursor(cursorName) {
  document.body.classList.remove("cursor-default", "cursor-wand", "cursor-blade");
  document.body.classList.add("cursor-" + cursorName);
  localStorage.setItem("selectedCursor", cursorName);
}

function setupMagicEffects() {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    return;
  }

  document.addEventListener("mousemove", function (event) {
    if (Math.random() < 0.35) {
      createSparkle(event.clientX, event.clientY);
    }
  });

  document.addEventListener("click", function (event) {
    createClickGlow(event.clientX, event.clientY);
  });
}

function createSparkle(xPosition, yPosition) {
  var sparkle = document.createElement("span");
  sparkle.className = "cursor-sparkle";
  sparkle.textContent = "*";
  sparkle.style.left = xPosition + "px";
  sparkle.style.top = yPosition + "px";
  document.body.appendChild(sparkle);

  setTimeout(function () {
    sparkle.remove();
  }, 700);
}

function createClickGlow(xPosition, yPosition) {
  var glow = document.createElement("span");
  glow.className = "click-glow";
  glow.style.left = xPosition + "px";
  glow.style.top = yPosition + "px";
  document.body.appendChild(glow);

  setTimeout(function () {
    glow.remove();
  }, 650);
}

function setupScribeButton() {
  var scribeButton = document.getElementById("scribe-button");

  if (scribeButton !== null) {
    scribeButton.addEventListener("click", askScribe);
  }
}

async function askScribe() {
  var phraseBox = document.getElementById("scribe-phrase");
  var styleChoice = document.getElementById("scribe-style");
  var output = document.getElementById("scribe-output");
  var phrase = phraseBox.value.trim();
  var selectedTheme = localStorage.getItem("selectedTheme") || "default";

  if (phrase === "") {
    output.textContent = "Please enter a phrase for the scribe first.";
    return;
  }

  output.textContent = "The scribe is thinking...";

  try {
    // fetch sends the phrase to our own server endpoint.
    // The server talks to Gemini so the API key stays hidden from the browser.
    var response = await fetch("/api/scribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phrase: phrase,
        style: styleChoice.value,
        theme: selectedTheme,
      }),
    });

    var data = await response.json();

    if (!response.ok) {
      output.textContent = data.error || "Something went wrong.";
      return;
    }

    // The server sends back JSON with a result, then this displays it on the page.
    output.textContent = data.result;
  } catch (error) {
    output.textContent = "The scribe could not connect right now.";
  }
}
