document.addEventListener("DOMContentLoaded", function () {
  // --- AUTO-FILL REMOVED ---
  // (No auto-fill code here; user will fill out manually)
});
  if (proceedBtn) {
    proceedBtn.onclick = function (e) {
      // Save all relevant fields to localStorage here
      localStorage.setItem('fieldName1', document.getElementById('fieldId1').value);
      localStorage.setItem('fieldName2', document.getElementById('fieldId2').value);
      // ...repeat for all relevant fields...
    };
  }
