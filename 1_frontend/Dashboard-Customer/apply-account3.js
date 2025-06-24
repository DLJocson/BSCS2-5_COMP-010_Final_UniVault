document.addEventListener("DOMContentLoaded", () => {
  const proceedBtn = document.getElementById("proceed");

  const checkboxGroups = [
    { container: ".first-container", checkbox: ".checkbox" },
    { container: ".second-container", checkbox: ".checkbox" },
    { container: ".third-container", checkbox: ".third-checkbox" },
    { container: ".third-container", checkbox: ".checkbox:nth-of-type(2)" }, // 2nd question in third
    { container: ".fourth-container", checkbox: ".fourth-checkbox" },
  ];

  checkboxGroups.forEach(({ container, checkbox }) => {
    const group = document.querySelector(container).querySelector(checkbox);
    const yes = group.querySelector(".yes input[type='checkbox']");
    const no = group.querySelector(".no input[type='checkbox']");

    yes.addEventListener("change", () => {
      if (yes.checked) no.checked = false;
    });
    no.addEventListener("change", () => {
      if (no.checked) yes.checked = false;
    });

    const containerEl = document.querySelector(container);
    const error = document.createElement("div");
    error.classList.add("error-message");
    error.style.display = "none";
    error.textContent = "Please select either Yes or No.";
    containerEl.insertAdjacentElement("afterend", error);
  });

  proceedBtn.addEventListener("click", (e) => {
    let allValid = true;

    checkboxGroups.forEach(({ container, checkbox }) => {
      const group = document.querySelector(container).querySelector(checkbox);
      const yes = group.querySelector(".yes input[type='checkbox']");
      const no = group.querySelector(".no input[type='checkbox']");
      const errorMsg = document.querySelector(container).nextElementSibling;

      if (!yes.checked && !no.checked) {
        errorMsg.style.display = "block";
        allValid = false;
      } else {
        errorMsg.style.display = "none";
        window.location.href = "apply-account4.html";
      }
    });

    if (!allValid) {
      e.preventDefault();
    }
  });
});
