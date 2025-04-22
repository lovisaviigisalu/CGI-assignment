document.addEventListener("DOMContentLoaded", () => {
  //Leiab vajalikud elemendid Html failist
  const intro   = document.getElementById("intro");
  const startBtn = document.getElementById("startBtn");
  const form    = document.getElementById("applicationForm");
  //Leiab kõik <fieldset> elemendid ehk küsimused ja salvestab need massiivi
  const questions = form.querySelectorAll("fieldset");

  // Peidab vormi kuni klikitakse "Start" peal
  form.style.display = "none";

  startBtn.addEventListener("click", () => {
    // Hide intro, show form and first question
    intro.style.display = "none";
    form.style.display  = "block";
    questions.forEach((fs, i) => fs.style.display = i === 0 ? "block" : "none");
  });

  const nextBtn = document.getElementById("nextBtn"); // Next nupp
  const prevBtn = document.getElementById("prevBtn"); // Previous nupp
  const summary = document.getElementById("summary"); // Summary konteiner

  let current = 0; // Näitab, milline küsimus kuvatakse

  const answers = {}; // Salvestab kasutaja valikud

  // 1.küsimuse juures pole 'previous' nuppu vaja, deactivateme selle
  prevBtn.disabled = true;

  // Kui klikitakse "Next" nupule
  nextBtn.addEventListener("click", () => {
    // Kontrollib, kas praegune küsimus on täidetud
    if (!isCurrentQuestionValid(current)) {
      return;
    }

    // Kogume kasutaja vastuse
    collectAnswer(current);

    // Ketrab seda niikaua kuni pole jõutud viimase küsimuseni
    if (current < questions.length - 1) {
      questions[current].style.display = "none"; // Peidame praeguse küsimuse
      current++; // Liigume järgmise küsimuse juurde
      questions[current].style.display = "block"; // Näitame uut küsimust

      prevBtn.disabled = false; // Aktiveerime "Previous" nupu

      // Kui jõuame viimase küsimuseni, muudame "Next" nupu tekstiks "Submit"
      if (current === questions.length - 1) {
        nextBtn.textContent = "Submit";
      }
    } else {
      // Kui vajutatakse "Submit" peale viimast küsimust
      document.querySelector("form").style.display = "none"; // Peidame vormi
      summary.style.display = "block"; // Näitame kokkuvõtte sektsiooni
      buildSummary(); // Käivitame kokkuvõtte loomise funktsiooni
    }
  });

  // Kui klikitakse "Previous" nupule
  prevBtn.addEventListener("click", () => {
    questions[current].style.display = "none"; // Peidame praeguse küsimuse
    current--; // Liigume eelmise küsimuse juurde
    questions[current].style.display = "block"; // Näitame eelmist küsimust

    nextBtn.textContent = "Next"; // Kui olime "Submit" peal, muudame tagasi "Next"
    nextBtn.disabled = false;

    // Kui on jõudnud esimese küsimuseni, siis deaktiveerib "Previous" nupu
    if (current === 0) {
      prevBtn.disabled = true;
    }
  });

  // Funktsioon, mis kontrollib, kas küsimus on täidetud
  function isCurrentQuestionValid(index) {
    const fieldset = questions[index];
    const requiredInputs = fieldset.querySelectorAll("input, select, textarea");
    let isValid = true;

    // Peidame kõik error-sõnumid alguses
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
  // Funktsioon, mis kogub vastuse praegusest küsimusest
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
        // Kui on SELECT, siis otsime valitud optioni sise
        const selectedOption = input.options[input.selectedIndex];
        answersForQuestion.push(
          selectedOption.textContent || selectedOption.innerText
        );
      } else if (input.tagName === "TEXTAREA") {
        answersForQuestion.push(input.value);
      }
    });

    // Salvestame vastuse küsimuse järgi
    answers[`question${index + 1}`] = answersForQuestion.join(", ");
  }

  function buildSummary() {
    const summaryContent = document.getElementById("summaryContent"); //Siia lisatakse kokkuvõte
    summaryContent.innerHTML = "";
    questions.forEach((fieldset, index) => { // Käib läbi kõik küsimused
      const legendElement = fieldset.querySelector("legend"); // Leiab iga küsimuse sisu
      
      // Väljastab küsimuste tekstisisu, eemaldades sealt tooltipi
      const legendText = Array.from(legendElement.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE) // Filtreerib
        .map(node => node.textContent.trim()) // Eemaldab tühikud
        .join(" "); // Ühendab need üheks tekstiks
  
      const answer = answers[`question${index + 1}`] || "No answer"; // Otsib vastuse küsimusele

      const summaryItem = document.createElement("div"); // Loob konteineri iga küsimuse kokkuvõtte jaoks
      summaryItem.classList.add("summary-item"); // Lisab CSS klassi stiilimiseks
  
      const questionTitle = document.createElement("h3"); // Loob küsimuse pealkirja elemendi
      questionTitle.textContent = legendText; // Paneb legendi teksti sinna sisse
  
      const answerText = document.createElement("p"); // Loob vastuse elemendi
      answerText.textContent = answer; // Paneb sinna vastuse teksti
  
      // Lisab küsimuse ja vastuse kokkuvõtte blokki
      summaryItem.appendChild(questionTitle);
      summaryItem.appendChild(answerText);
  
      // Lisame selle kokkuvõtte blokina peamise sisu konteinerisse
      summaryContent.appendChild(summaryItem);
    });
  }
  
// Valib textarea elemendi
const textarea = document.querySelector("textarea");

//muudab textarea kõrgust vastavalt sisule
function adjustHeight() {
  // Eemaldab eelmised kõrguse muutused
  this.style.height = 'auto';
  
  // Seab kõrguseks 'scrollHeight', mis on täpselt vajalik teksti mahutamiseks
  this.style.height = this.scrollHeight + 'px';
}

// Kuulame sisestamise sündmust textarea-l
textarea.addEventListener('input', adjustHeight);  
});

// Leib kõik elemendid, millel on klass 'help-icon'
document.querySelectorAll('.help-icon').forEach(icon => {
  // Funktsioon tooltipi (vihjeakna) nähtavuse lülitamiseks
  const toggle = () => {
    const tip = icon.parentElement.querySelector('.tooltip'); // Otsib tooltipi
    tip.classList.toggle('visible'); // Kui tooltip on nähtav, peidab selle; kui pole, muudab nähtavaks
  };

  // Kui kasutaja klikib ikoonile, käivitab toggle-funktsioon
  icon.addEventListener('click', toggle);

});

//Kui kasutaja klikib mujale, suletakse nähtav tooltip
document.addEventListener('click', e => {
  if (!e.target.closest('.tooltip-container')) { // Kui klõps ei toimunud tooltipi sees
    document.querySelectorAll('.tooltip.visible').forEach(t => {
      t.classList.remove('visible'); // Peidab tooltipid
    });
  }
});
