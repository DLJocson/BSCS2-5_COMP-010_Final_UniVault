document.addEventListener("DOMContentLoaded", () => {
  // Load pending changes and display them
  const pendingChanges = localStorage.getItem('pendingProfileChanges');
  const originalData = localStorage.getItem('originalCustomerData');
  
  if (pendingChanges && originalData) {
    const changes = JSON.parse(pendingChanges);
    const customerData = JSON.parse(originalData);
    displayPendingChanges(changes, customerData);
  }
  
  function displayPendingChanges(changes, customerData) {
    // You can add code here to display what changes will be made
    console.log('Pending changes:', changes);
    console.log('Original data:', customerData);
    
    // For now, just show a summary
    const changeCount = Object.keys(changes).length;
    const summaryElement = document.createElement('div');
    summaryElement.innerHTML = `
      <div style="background: #f0f8ff; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #2a4d8f;">
        <h3 style="color: #2a4d8f; margin-top: 0;">Profile Update Summary</h3>
        <p>${changeCount} field(s) will be updated.</p>
        <small style="color: #666;">Please review and confirm your changes.</small>
      </div>
    `;
    
    // Insert the summary at the top of the main content
    const mainContent = document.querySelector('.main-content') || document.querySelector('.container') || document.body;
    if (mainContent && mainContent.firstChild) {
      mainContent.insertBefore(summaryElement, mainContent.firstChild);
    }
  }
  
  const proceedBtn = document.getElementById("proceed");
  const checkboxes = document.querySelectorAll(
    ".second-container input[type='checkbox']"
  );
  const errorMessage = document.getElementById("error-message");

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      if (cb.checked) {
        // Uncheck all others
        checkboxes.forEach((otherCb) => {
          if (otherCb !== cb) {
            otherCb.checked = false;
          }
        });
        errorMessage.textContent = ""; // Clear error if one is selected
      }
    });
  });

  proceedBtn.addEventListener("click", (e) => {
    const oneChecked = Array.from(checkboxes).some((cb) => cb.checked);

    if (!oneChecked) {
      e.preventDefault();
      errorMessage.textContent =
        "Please select either 'I give consent' or 'I do not give consent.'";
    } else {
      errorMessage.textContent = "";
      // Continue to the next confirmation page
      window.location.href = "update-profile7.html";
    }
  });
});
