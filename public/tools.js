window.addEventListener("load", initToolsPage);

function initToolsPage() {
  var birthNumberButton = document.getElementById("birth-number-button");
  var zodiacButton = document.getElementById("zodiac-button");

  if (birthNumberButton !== null) {
    birthNumberButton.addEventListener("click", calculateBirthNumber);
  }

  if (zodiacButton !== null) {
    zodiacButton.addEventListener("click", calculateZodiacSign);
  }
}

function calculateBirthNumber() {
  var birthDate = document.getElementById("birth-date").value;
  var output = document.getElementById("birth-number-output");

  if (birthDate === "") {
    output.textContent = "Please choose a birth date first.";
    return;
  }

  var numbersOnly = birthDate.replaceAll("-", "");
  var total = 0;

  for (var i = 0; i < numbersOnly.length; i++) {
    total = total + Number(numbersOnly[i]);
  }

  while (total > 9) {
    total = reduceNumber(total);
  }

  output.textContent =
    "Your birth number is " + total + ". " + getBirthNumberMeaning(total);
}

function reduceNumber(number) {
  var numberText = String(number);
  var total = 0;

  for (var i = 0; i < numberText.length; i++) {
    total = total + Number(numberText[i]);
  }

  return total;
}

function getBirthNumberMeaning(number) {
  var meanings = {
    1: "This can symbolize beginnings, independence, and personal direction.",
    2: "This can symbolize balance, partnership, and sensitivity.",
    3: "This can symbolize creativity, expression, and learning through voice.",
    4: "This can symbolize structure, patience, and building foundations.",
    5: "This can symbolize change, movement, and curiosity.",
    6: "This can symbolize care, responsibility, and harmony.",
    7: "This can symbolize study, mystery, and inward reflection.",
    8: "This can symbolize ambition, power, and material lessons.",
    9: "This can symbolize completion, compassion, and wisdom."
  };

  return meanings[number];
}

function calculateZodiacSign() {
  var month = Number(document.getElementById("zodiac-month").value);
  var day = Number(document.getElementById("zodiac-day").value);
  var output = document.getElementById("zodiac-output");

  if (day < 1 || day > 31) {
    output.textContent = "Please enter a day between 1 and 31.";
    return;
  }

  var sign = getZodiacSign(month, day);

  if (sign === "") {
    output.textContent = "Please check that the month and day are valid.";
    return;
  }

  output.textContent = "Your Western sun sign is " + sign + ". " + getZodiacMeaning(sign);
}

function getZodiacSign(month, day) {
  var maxDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (day > maxDays[month - 1]) {
    return "";
  }

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return "Aries";
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return "Taurus";
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return "Gemini";
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return "Cancer";
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return "Leo";
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return "Virgo";
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return "Libra";
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return "Scorpio";
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return "Sagittarius";
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return "Capricorn";
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return "Aquarius";
  } else {
    return "Pisces";
  }
}

function getZodiacMeaning(sign) {
  var meanings = {
    Aries: "A basic meaning is courage, action, and beginning.",
    Taurus: "A basic meaning is steadiness, beauty, and patience.",
    Gemini: "A basic meaning is curiosity, communication, and movement.",
    Cancer: "A basic meaning is emotion, memory, and protection.",
    Leo: "A basic meaning is confidence, creativity, and warmth.",
    Virgo: "A basic meaning is service, detail, and improvement.",
    Libra: "A basic meaning is balance, fairness, and relationship.",
    Scorpio: "A basic meaning is depth, transformation, and intensity.",
    Sagittarius: "A basic meaning is exploration, belief, and learning.",
    Capricorn: "A basic meaning is discipline, ambition, and structure.",
    Aquarius: "A basic meaning is originality, community, and vision.",
    Pisces: "A basic meaning is imagination, compassion, and spirituality."
  };

  return meanings[sign];
}
