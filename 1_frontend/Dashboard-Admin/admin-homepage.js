document.addEventListener("DOMContentLoaded", () => {
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const errorMessages = document.querySelectorAll(".error-message");
  const proceedBtn = document.getElementById("proceed");

  function isPasswordValid(pw) {
    const lengthOK = pw.length >= 8 && pw.length <= 30;
    const hasNumber = /\d/.test(pw);
    const hasSpecial = /[-!@#$%^&*_+]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const noCommonSeq = !/(abc|123|9999|password|qwerty)/i.test(pw);
    return (
      lengthOK && hasNumber && hasSpecial && hasUpper && hasLower && noCommonSeq
    );
  }

  function validate() {
    const uname = username.value.trim();
    const pw = password.value.trim();
    let isValid = true;

    errorMessages.forEach((msg) => (msg.textContent = ""));

    username.classList.remove("error");
    password.classList.remove("error");

    if (uname === "") {
      errorMessages[0].textContent = "Username is required.";
      username.classList.add("error");
      isValid = false;
    }

    if (pw === "") {
      errorMessages[1].textContent = "Password is required.";
      password.classList.add("error");
      isValid = false;
    } else if (!isPasswordValid(pw)) {
      errorMessages[1].textContent =
        "Password does not meet the required criteria.";
      password.classList.add("error");
      isValid = false;
    }

    return isValid;
  }

  username.addEventListener("input", validate);
  password.addEventListener("input", validate);

  proceedBtn.addEventListener("click", (e) => {
    if (!validate()) {
      e.preventDefault();
    } else {
      window.location.href = "admin-dashboard.html";
    }
  });
});
