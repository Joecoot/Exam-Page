const nameElement = document.getElementById(`name-text`);
const startButton = document.getElementById(`start-button`);

nameElement.textContent = JSON.parse(localStorage.getItem(`user`))[`name`];
if (localStorage.getItem(`logged`) !== `true`) {
  window.location.href = `../login/index.html`;
}
startButton.onclick = () => {
  window.location.href = "../exam-page/examPage.html";
};
