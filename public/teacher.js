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

  output.textContent = "The teacher is studying the question...";

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

    // The result from the server is displayed inside the output paragraph.
    output.textContent = data.result;
  } catch (error) {
    output.textContent = "The teacher could not connect right now.";
  }
}
