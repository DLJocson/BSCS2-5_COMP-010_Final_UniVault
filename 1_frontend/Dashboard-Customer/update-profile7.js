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

  proceedBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    // Show loading state
    proceedBtn.textContent = 'Processing...';
    proceedBtn.disabled = true;
    
    try {
      // Get the pending changes from localStorage
      const pendingChanges = localStorage.getItem('pendingProfileChanges');
      const originalData = localStorage.getItem('originalCustomerData');
      
      if (!pendingChanges || !originalData) {
        throw new Error('No pending changes found. Please start from the profile page.');
      }
      
      const changes = JSON.parse(pendingChanges);
      const customerData = JSON.parse(originalData);
      const cif = customerData.customer.cif_number;
      
      console.log('Applying changes:', changes);
      
      // Send the changes to the backend
      const response = await fetch(`/api/customer/${cif}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Update failed'}`);
      }
      
      // Clear the temporary data
      localStorage.removeItem('pendingProfileChanges');
      localStorage.removeItem('originalCustomerData');
      
      // Show success and redirect
      alert('Profile updated successfully!');
      window.location.href = "profile-update-success.html"; // or wherever you want to redirect
      
    } catch (error) {
      console.error('Error saving profile changes:', error);
      alert(`Failed to update profile: ${error.message}`);
      
      // Reset button
      proceedBtn.textContent = 'Proceed';
      proceedBtn.disabled = false;
    }
  });
});
