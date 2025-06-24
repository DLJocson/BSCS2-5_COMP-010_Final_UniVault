const deleteButton = document.getElementById("delete-account");
const pageBody = document.querySelector(".page-body");

deleteButton.addEventListener("click", () => {
  pageBody.classList.toggle("hover-enabled");
});
