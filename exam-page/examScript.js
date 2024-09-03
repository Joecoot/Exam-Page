const nextButton = document.getElementById(`next-button`);
const previousButton = document.getElementById(`previous-button`);
const flagButton = document.getElementById(`flag-button`);
const logoutButton = document.getElementById(`logout-button`);
const submitButton = document.getElementById(`submit-button`);
const examTimerContainer = document.querySelector(`#exam-timer-container`);
const menuButton = document.getElementById(`menu-button`);
const menuButtonLabel = document.getElementById(`menu-button-label`);
const questionsContainer = document.getElementById(`questions-container`);

if (localStorage.getItem(`logged`) !== `true`) {
  window.location.href = `../login/index.html`;
}

class Exam {
  constructor() {

    this.maxQuestions = 30; // Used to set the max amount of questions the user is going to get.
    this.questionsArray = []; // The array for keeping the questions.
    this.maxTime = 30 * 60; // The max time the user is going to get to solve the questions (In seconds)
    this.showResult = this.checkIfFinished(); // Controls the current state of the page (Exam or show result)
    this.responsive = this.checkResponsive();

    this.currentQuestion = 1; // The current question the user is on.
    this.currentTime = this.maxTime; // The current time the user is on.
    this.score = 0; // the score of the user
    this.getScore(); // get the score of the user.
    this.menuOpened = false;

    this.updateName(); // Updates the name of the user on the Page.
    this.addEvents();

    if (!this.showResult) {
      this.getQuestions();
      this.updateTimer();
      this.timer = setInterval(() => this.updateTimer(), 1000);
    }
    else {
      this.displayScore();
      this.updateDom();
    }

    if (this.responsive) {
      this.updateResponsive();
    }

  }

  updateName() {
    const nameElement = document.getElementById(`user-name`);
    nameElement.textContent = JSON.parse(localStorage.getItem(`user`))[`name`];
  }

  checkResponsive() {
    const RESPONSIVE_WIDTH = 1300;

    if (innerWidth <= RESPONSIVE_WIDTH) {
      return true;
    }
  }

  checkIfFinished () {
    // This method is used to check if the user has finished the exam and submitted it.
    if (localStorage.getItem(`finished`) === `true`) {
      this.questionsArray = JSON.parse(localStorage.getItem(`questions`));
      this.updateElements();
      return true;
    }
  }

  updateElements() {
    // Used to remove the unused elements like buttons when showing the results to the user, Also to add some new elements

    flagButton.classList.add(`display-none`);
    examTimerContainer.querySelector(`h1`).classList.add(`display-none`);
    examTimerContainer.querySelector(`#exam-timer-contents`).classList.add(`display-none`);
    submitButton.textContent = `Finish`

    examTimerContainer.querySelector(`#score-container`).classList.remove(`display-none`);
    examTimerContainer.classList.add(`centered`);
  }

  displayScore() {
    const scoreSpan = document.getElementById(`score-span`);
    const totalScoreSpan = document.getElementById(`total-score-span`);

    totalScoreSpan.textContent = String(this.questionsArray.length);
    scoreSpan.textContent = String(this.score);

    if (this.score > this.questionsArray.length/2) {
      scoreSpan.classList.add(`green-text`);
    }
    else {
      scoreSpan.classList.add(`red-text`);
    }
  }

  getQuestions() {
    fetch("./Questions.json")
      .then((request) => {
        return request.json();
      })
      .then((data) => {
        let allQuestions = data[`questions`];

        for (let i = 0; i < this.maxQuestions; i++) {
          let rand = Math.floor(Math.random() * allQuestions.length);
          this.questionsArray.push({
            ...allQuestions[rand],
            userChoice: 0,
            flagged: false,
          });
          allQuestions.splice(rand, 1);
        }
        this.updateDom();
      });
  }

  updateDom() {
    this.updateQuestionsNumber();
    this.updateQuestion();
  }

  updateResponsive() {
    menuButtonLabel.classList.remove(`display-none`);
    questionsContainer.style.maxHeight = `0`;
  }

  updateQuestionsNumber() {
    const questionsContainer = document.getElementById(
      `questions-number-container`
    );
    questionsContainer.innerHTML = ``;

    for (let i = 0; i < this.maxQuestions; i++) {
      let element = document.createElement(`div`);
      element.classList.add(`question-number`);

      if (i + 1 === this.currentQuestion) {
        element.classList.add(`active`);
        setTimeout(function () {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }

      let paragraph = document.createElement(`p`);
      paragraph.textContent = String(i + 1);
      element.append(paragraph);

      let flagDiv = document.createElement(`div`);
      flagDiv.classList.add(`not-flagged`);
      flagDiv.innerHTML = `<i class="fa-solid fa-flag"></i>`;
      element.append(flagDiv);

      if (this.questionsArray[i][`userChoice`]) {
        element.classList.add(`solved`);
      }
      if (!this.showResult) {
        if (this.questionsArray[i][`flagged`]) {
          flagDiv.classList.remove(`not-flagged`);
          if (i + 1 === this.currentQuestion) {
            flagDiv.classList.add(`flagged-active`);
            flagButton.classList.add(`active`);
          }
          flagDiv.classList.add(`flagged`);
        } else {
          if (i + 1 === this.currentQuestion) {
            flagButton.classList.remove(`active`);
          }
        }
      }

      if (this.showResult) {
        if (this.questionsArray[i][`userChoice`] === this.questionsArray[i][`correct`]) {
          element.classList.add(`correct`);
        }
        else {
          element.classList.add(`wrong`);
        }
      }

      element.addEventListener(`click`, () => {
        if (this.responsive) {
          menuButton.checked = false;
          this.toggleMenu();
        }
        this.moveQuestion(i + 1);
      });

      questionsContainer.append(element);
    }
  }

  addEvents() {
    nextButton.addEventListener(`click`, () => {
      if (this.currentQuestion < this.maxQuestions) {
        this.moveQuestion(this.currentQuestion + 1);
      }
      nextButton.classList.add("clicked");
      setTimeout(() => {
        nextButton.classList.remove("clicked");
      }, 300);
    });

    previousButton.addEventListener(`click`, () => {
      if (this.currentQuestion > 1) {
        this.moveQuestion(this.currentQuestion - 1);
      }
      previousButton.classList.add("clicked");
      setTimeout(() => {
        previousButton.classList.remove("clicked");
      }, 300);
    });

    if (!this.showResult) {
      const choicesElements = document.getElementsByClassName(`choice`);
      [...choicesElements].forEach((currentElement) => {
        currentElement.addEventListener(`click`, () => {
          this.questionsArray[this.currentQuestion - 1][`userChoice`] =
              currentElement.querySelector(`p`).textContent;
          this.updateQuestion();
        });
      });

      flagButton.addEventListener(`click`, (e) => {
        this.questionsArray[this.currentQuestion - 1][`flagged`] =
            !this.questionsArray[this.currentQuestion - 1][`flagged`];
        this.updateDom();
      });

      submitButton.onclick = () => {
        this.submitTest();
      }
    }

    if (this.showResult) {
      submitButton.onclick = () => {
        localStorage.removeItem(`finished`);
        window.location.href = `../get-started-page/getStartedPage.html`;
      }
    }

    logoutButton.addEventListener("click", () => {
      localStorage.removeItem(`logged`);
      window.location.href = "../login/index.html";
    });

    menuButton.onclick = () => { // Took us 3 hours to solve this bug (I hate arrow functions)
      this.toggleMenu();
    }
  }

  toggleMenu() {
    if (this.menuOpened) {
      this.menuOpened = false;
      questionsContainer.style.maxHeight = `0`;
      questionsContainer.querySelector(`#submit-button`).style.visibility = `hidden`;
      questionsContainer.style.padding = `0 2rem`;
      questionsContainer.style.visibility = `hidden`;
    }
    else {
      this.menuOpened = true;
      questionsContainer.style.maxHeight = `1000px`;
      questionsContainer.querySelector(`#submit-button`).style.visibility = `visible`;
      questionsContainer.style.padding = `2rem 2rem 0 2rem`;
      questionsContainer.style.visibility = `visible`;
    }
  }

  moveQuestion(value) {
    this.currentQuestion = value;

    if (this.currentQuestion === this.maxQuestions) {
      nextButton.classList.add(`disabled`);
    } else {
      nextButton.classList.remove(`disabled`);
    }

    if (this.currentQuestion === 1) {
      previousButton.classList.add(`disabled`);
    } else {
      previousButton.classList.remove(`disabled`);
    }

    this.updateDom();
  }

  updateQuestion() {
    const questionNumberElement = document
      .getElementById(`question-container`)
      .querySelector(`h2`);
    const questionElement = document
      .getElementById(`question-container`)
      .querySelector(`p`);
    const choicesElements = document.getElementsByClassName(`choice`);

    questionNumberElement.textContent = `Question (${this.currentQuestion})`;
    questionElement.textContent =
      this.questionsArray[this.currentQuestion - 1]["question"];

    [...choicesElements].forEach((element, index) => {
      let choices = this.questionsArray[this.currentQuestion - 1][`choices`];
      element.querySelector(`p`).textContent = choices[index];

      let choosed = element.querySelector(`p`).textContent ===
          this.questionsArray[this.currentQuestion - 1][`userChoice`];

      if (
        choosed
      ) {
        if (!this.showResult) {
          element.classList.add(`choosed`);
        }
      } else {
        element.classList.remove(`choosed`);
      }

      // Reset the elements' classes
      element.classList.remove(`correct`);
      element.classList.remove(`wrong`);

      element.getElementsByClassName(`choices-icons`)[0].classList.add(`display-none`);
      element.getElementsByClassName(`choices-icons`)[1].classList.add(`display-none`);

      // Add the classes for the wrong and right choices
      if (this.showResult) {
        if (element.querySelector(`p`).textContent === this.questionsArray[this.currentQuestion - 1][`correct`]) {
          element.classList.add(`correct`);
          element.getElementsByClassName(`choices-icons`)[0].classList.remove(`display-none`)
        }
        else {
          if (choosed) {
            element.classList.add(`wrong`);
            element.getElementsByClassName(`choices-icons`)[1].classList.remove(`display-none`);
          }
        }
      }
    });
  }

  updateTimer() {
    const timerElement = document.getElementById(`exam-time`);
    this.currentTime -= 1;
    const hours = Math.floor(this.currentTime / 3600);
    const minutes = Math.floor((this.currentTime % 3600) / 60);
    const remainingSeconds = this.currentTime % 60;
    let formattedTime = `${hours < 10 ? `0${hours}` : hours}:${
      minutes < 10 ? `0${minutes}` : minutes
    }:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
    timerElement.textContent = String(formattedTime);

    if (this.currentTime <= 0) {
      localStorage.setItem(`finished`, `time`);
      window.location.href= `../finish-page/finishPage.html`;
    }
  }

  submitTest() {
    // This method is used to handle the actions when the user clicks the submit button.

    // check if the user answered all the questions.
    let isAllQuestionsAnswered = this.questionsArray.reduce((previousValue, currentValue) => {
      return previousValue && Boolean(currentValue[`userChoice`]);
    }, true);

    // store the questions in the local storage
    if (isAllQuestionsAnswered) {
      localStorage.setItem(`finished`, `true`);
      localStorage.setItem(`questions`, JSON.stringify(this.questionsArray));
      this.getScore();
      window.location.href= `../finish-page/finishPage.html`;
    }
  }

  getScore() {
    // This method is user to POST the score to the local storage or GET the score.
    if (!this.showResult) {
      let score = this.questionsArray.reduce((previousValue, currentValue) => {
        let correct = currentValue[`userChoice`] === currentValue[`correct`];
        return previousValue + (correct ? 1 : 0);
      }, 0);

      localStorage.setItem(`score`, score);
    }
    else  {
      this.score = Number(localStorage.getItem(`score`));
    }
  }
}

const exam = new Exam();
