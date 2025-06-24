document.addEventListener("DOMContentLoaded", () => {
  const proceedBtn = document.getElementById("proceed");

  // Define keys for localStorage for each question
  const checkboxGroups = [
    { container: ".first-container", checkbox: ".checkbox", key: "reg_political_affiliation" },
    { container: ".second-container", checkbox: ".checkbox", key: "reg_fatca" },
    { container: ".third-container", checkbox: ".third-checkbox", key: "reg_dnfbp" },
    { container: ".third-container", checkbox: ".checkbox:nth-of-type(2)", key: "reg_online_gaming" },
    { container: ".fourth-container", checkbox: ".fourth-checkbox", key: "reg_beneficial_owner" },
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

  if (proceedBtn) {
    proceedBtn.onclick = function (e) {
      let allValid = true;
      checkboxGroups.forEach(({ container, checkbox, key }) => {
        const group = document.querySelector(container).querySelector(checkbox);
        const yes = group.querySelector(".yes input[type='checkbox']");
        const no = group.querySelector(".no input[type='checkbox']");
        const errorMsg = document.querySelector(container).nextElementSibling;
        // Save answer to localStorage
        if (yes.checked) {
          localStorage.setItem(key, "Yes");
        } else if (no.checked) {
          localStorage.setItem(key, "No");
        } else {
          errorMsg.style.display = "block";
          allValid = false;
        }
        if (yes.checked || no.checked) {
          errorMsg.style.display = "none";
        }
      });
      if (allValid) {
        window.location.href = "registration9.html";
      } else {
        e.preventDefault();
      }
    };
  }

  // Production ready - no auto-fill test data
});
