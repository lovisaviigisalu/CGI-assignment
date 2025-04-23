document.addEventListener("DOMContentLoaded", () => {
  // Finds required elements from the HTML file
  const intro   = document.getElementById("intro");
  const startBtn = document.getElementById("startBtn");
  const form    = document.getElementById("applicationForm");

  // Finds all <fieldset> elements (questions) and stores them in an array
  const questions = form.querySelectorAll("fieldset");

  // Hides the form until "Start" is clicked
  form.style.display = "none";

  startBtn.addEventListener("click", () => {
    // Hide intro, show form and first question
    intro.style.display = "none";
    form.style.display  = "block";
    questions.forEach((fs, i) => fs.style.display = i === 0 ? "block" : "none");
  });

  const nextBtn = document.getElementById("nextBtn"); // Next button
  const prevBtn = document.getElementById("prevBtn"); // Previous button
  const summary = document.getElementById("summary"); // Summary container

  let current = 0; // Tracks which question is currently shown

  const answers = {}; // Stores user responses

  // Disable 'previous' button for the first question
  prevBtn.disabled = true;

  // When the "Next" button is clicked
  nextBtn.addEventListener("click", () => {
    // Checks if the current question is valid
    if (!isCurrentQuestionValid(current)) {
      return;
    }

    // Collect user response
    collectAnswer(current);

    // Loop until last question is reached
    if (current < questions.length - 1) {
      questions[current].style.display = "none"; // Hide current question
      current++; // Move to next question
      questions[current].style.display = "block"; // Show new question

      prevBtn.disabled = false; // Enable "Previous" button

      // Change "Next" button to "Submit" on last question
      if (current === questions.length - 1) {
        nextBtn.textContent = "Submit";
      }
    } else {
      // When "Submit" is clicked after the last question
      document.querySelector("form").style.display = "none"; // Hide the form
      summary.style.display = "block"; // Show the summary section
      buildSummary(); // Trigger summary building function
    }
  });

  // When the "Previous" button is clicked
  prevBtn.addEventListener("click", () => {
    questions[current].style.display = "none"; // Hide current question
    current--; // Move to previous question
    questions[current].style.display = "block"; // Show previous question

    nextBtn.textContent = "Next"; // Revert "Submit" back to "Next" if needed
    nextBtn.disabled = false;

    // Disable "Previous" button if back to first question
    if (current === 0) {
      prevBtn.disabled = true;
    }
  });

  // Function to check if the current question is filled in
  function isCurrentQuestionValid(index) {
    const fieldset = questions[index];
    const requiredInputs = fieldset.querySelectorAll("input, select, textarea");
    let isValid = true;

    // Hide all error messages at start
    const errorMessages = fieldset.querySelectorAll(".error-message");
    errorMessages.forEach((msg) => (msg.style.display = "none"));

    requiredInputs.forEach((input) => {
        let inputValid = false;

        if (input.type === "radio" || input.type === "checkbox") {
            const group = fieldset.querySelectorAll(`input[name="${input.name}"]`);
            if ([...group].some((el) => el.checked)) {
                inputValid = true;
            }
        } else if (input.tagName === "SELECT") {
            if (input.value !== "") {
                inputValid = true;
            }
        } else if (input.tagName === "TEXTAREA") {
            if (input.value.trim() !== "") {
                inputValid = true;
            }
        }

        // If invalid, display the error message
        if (!inputValid) {
            const errorMsg = fieldset.querySelector(".error-message");
            if (errorMsg) {
                errorMsg.style.display = "block";
            }
            isValid = false;
        }
    });

    return isValid;
  }

  // Function to collect the answer from the current question
  function collectAnswer(index) {
    const fieldset = questions[index];
    const inputs = fieldset.querySelectorAll("input, select, textarea");
    const answersForQuestion = [];

    inputs.forEach((input) => {
      if (input.type === "radio" || input.type === "checkbox") {
        if (input.checked) {
          answersForQuestion.push(input.value);
        }
      } else if (input.tagName === "SELECT") {
        // For SELECT, get the selected option text
        const selectedOption = input.options[input.selectedIndex];
        answersForQuestion.push(
          selectedOption.textContent || selectedOption.innerText
        );
      } else if (input.tagName === "TEXTAREA") {
        answersForQuestion.push(input.value);
      }
    });

    // Store the response by question
    answers[`question${index + 1}`] = answersForQuestion.join(", ");
  }

  function buildSummary() {
    const summaryContent = document.getElementById("summaryContent"); // Summary output container
    summaryContent.innerHTML = "";
    questions.forEach((fieldset, index) => {
      const legendElement = fieldset.querySelector("legend"); // Get the question text

      // Extract only the text content, excluding tooltips
      const legendText = Array.from(legendElement.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent.trim())
        .join(" ");

      const answer = answers[`question${index + 1}`] || "No answer";

      const summaryItem = document.createElement("div");
      summaryItem.classList.add("summary-item");

      const questionTitle = document.createElement("h3");
      questionTitle.textContent = legendText;

      const answerText = document.createElement("p");
      answerText.textContent = answer;

      summaryItem.appendChild(questionTitle);
      summaryItem.appendChild(answerText);

      summaryContent.appendChild(summaryItem);
    });
  }

  // Selects the textarea element
  const textarea = document.querySelector("textarea");

  // Adjusts textarea height based on its content
  function adjustHeight() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  }

  // Listen to input events on the textarea
  textarea.addEventListener('input', adjustHeight);  
});

// Find all elements with class 'help-icon'
document.querySelectorAll('.help-icon').forEach(icon => {
  // Function to toggle tooltip visibility
  const toggle = () => {
    const tip = icon.parentElement.querySelector('.tooltip');
    tip.classList.toggle('visible');
  };

  // Toggle tooltip on icon click
  icon.addEventListener('click', toggle);
});

// Hide tooltip when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.tooltip-container')) {
    document.querySelectorAll('.tooltip.visible').forEach(t => {
      t.classList.remove('visible');
    });
  }
});
