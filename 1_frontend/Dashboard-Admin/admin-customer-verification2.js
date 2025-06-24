const verifyButtons = document.querySelectorAll(".verify");

verifyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("clicked");
  });
});
