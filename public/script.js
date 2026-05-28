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
  setupScribeButton();
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
