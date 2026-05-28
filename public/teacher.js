window.addEventListener("load", initTeacherPage);

function initTeacherPage() {
  var teacherButton = document.getElementById("teacher-button");

  if (teacherButton !== null) {
    teacherButton.addEventListener("click", askTeacher);
  }
}

async function askTeacher() {
  var traditionChoice = document.getElementById("teacher-tradition");
  var questionBox = document.getElementById("teacher-question");
  var output = document.getElementById("teacher-output");
  var question = questionBox.value.trim();
  var selectedTheme = localStorage.getItem("selectedTheme") || "default";

  if (question === "") {
    output.textContent = "Please ask the teacher a question first.";
    return;
  }

  output.innerHTML = "<p>The teacher is studying the question...</p>";

  try {
    // fetch sends the question to the Express backend.
    // The backend sends it to Gemini and returns a simple JSON response.
    var response = await fetch("/api/teacher", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question,
        tradition: traditionChoice.value,
        theme: selectedTheme,
      }),
    });

    var data = await response.json();

    if (!response.ok) {
      output.textContent = data.error || "The teacher could not answer.";
      return;
    }

    // The result from the server is displayed as clean HTML sections.
    renderTeacherAnswer(data.result);
  } catch (error) {
    output.textContent = "The teacher could not connect right now.";
  }
}

function renderTeacherAnswer(answer) {
  var output = document.getElementById("teacher-output");

  output.innerHTML = "";
  output.classList.add("teacher-answer");

  if (typeof answer === "string") {
    var fallbackParagraph = document.createElement("p");
    fallbackParagraph.textContent = answer;
    output.appendChild(fallbackParagraph);
    return;
  }

  var title = document.createElement("h3");
  title.textContent = answer.title || "Teacher Response";
  output.appendChild(title);

  var summary = document.createElement("p");
  summary.textContent = answer.summary || "The teacher returned a response.";
  output.appendChild(summary);

  if (answer.keyPoints && answer.keyPoints.length > 0) {
    var list = document.createElement("ul");
    list.className = "answer-points";

    for (var i = 0; i < answer.keyPoints.length; i++) {
      var item = document.createElement("li");
      item.textContent = answer.keyPoints[i];
      list.appendChild(item);
    }

    output.appendChild(list);
  }

  if (answer.reflection) {
    var reflection = document.createElement("p");
    reflection.className = "answer-reflection";
    reflection.textContent = answer.reflection;
    output.appendChild(reflection);
  }

  if (answer.studyNote) {
    var studyNote = document.createElement("p");
    studyNote.className = "answer-note";
    studyNote.textContent = answer.studyNote;
    output.appendChild(studyNote);
  }
}
