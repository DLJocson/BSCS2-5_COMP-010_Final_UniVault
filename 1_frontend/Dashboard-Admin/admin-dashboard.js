document.addEventListener("DOMContentLoaded", async function () {
  console.log("🚀 Admin Dashboard initializing...");
  
  // Check if user is logged in
  const employeeId = localStorage.getItem("employee_id");
  const employeeUsername = localStorage.getItem("employee_username");

  if (!employeeId || !employeeUsername) {
    console.log("❌ No valid session found, redirecting to login");
    window.location.href = "admin-login.html";
    return;
  }

  console.log(`✅ Valid session found for ${employeeUsername}`);

  // Update all date labels with current date
  updateDateLabels();

  // Run connectivity test first
  if (window.ConnectivityTest) {
    await ConnectivityTest.runFullDiagnostic();
  }

  // Load dashboard statistics
  loadDashboardStats();

  // Logout functionality is handled by logout-fix.js
});

function updateDateLabels() {
  const today = new Date();
  const formattedDate = `${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;

  const dateElements = [
    "rejected-date",
    "pending-applications-date",
    "pending-approvals-date",
    "monthly-stats-date",
    "new-accounts-date",
    "verified-date",
    "total-customers-date",
  ];

  dateElements.forEach((elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = `as of ${formattedDate}`;
    }
  });
}

async function loadDashboardStats() {
  console.log("🔄 Loading dashboard statistics...");
  
  try {
    // Show loading state
    showLoadingState();

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log("⏰ Dashboard request timed out");
    }, 10000); // 10 second timeout

    const response = await fetch("/admin/dashboard-stats", {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log("📡 Dashboard response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const stats = await response.json();
    console.log("📊 Dashboard stats received:", stats);

    // Show dashboard content
    showDashboardContent();

    // Update the statistics cards with proper IDs
    updateStatById("rejected-count", stats.rejectedApplications || 0);
    updateStatById(
      "pending-applications-count",
      stats.pendingVerifications || 0
    );
    updateStatById("pending-approvals-count", stats.pendingApprovals || 0);
    updateStatById("new-accounts-count", stats.newAccounts || 0);
    updateStatById("verified-count", stats.verifiedCustomers || 0);
    updateStatById("total-customers-count", stats.totalCustomers || 0);

    // Create chart if data is available
    if (stats.monthlyStats && stats.monthlyStats.length > 0) {
      createMonthlyChart(stats.monthlyStats);
    } else {
      // Show empty chart with message
      createEmptyChart();
    }

    console.log("✅ Dashboard stats loaded successfully");
    
  } catch (error) {
    console.error("❌ Error loading dashboard stats:", error);
    
    let errorMessage = "Unable to connect to server. Please try again later.";
    
    if (error.name === 'AbortError') {
      errorMessage = "Request timed out. Please check your connection and try again.";
    } else if (error.message.includes('HTTP')) {
      errorMessage = `Server error: ${error.message}`;
    } else if (error.message.includes('JSON')) {
      errorMessage = "Server returned invalid data. Please try again.";
    }
    
    showErrorState(errorMessage);
  }
}

function showLoadingState() {
  // Hide dashboard content and error state
  const dashboardContent = document.getElementById("dashboardContent");
  const errorState = document.getElementById("errorState");
  const loadingState = document.getElementById("loadingState");

  if (dashboardContent) dashboardContent.style.display = "none";
  if (errorState) errorState.style.display = "none";
  if (loadingState) loadingState.style.display = "flex";

  // Also update individual count elements to show loading
  const countElements = [
    "rejected-count",
    "pending-applications-count",
    "pending-approvals-count",
    "new-accounts-count",
    "verified-count",
    "total-customers-count",
  ];

  countElements.forEach((elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = "...";
      element.style.color = ""; // Reset any error styling
    }
  });
}

function showDashboardContent() {
  // Hide loading and error states, show dashboard content
  const dashboardContent = document.getElementById("dashboardContent");
  const errorState = document.getElementById("errorState");
  const loadingState = document.getElementById("loadingState");

  if (loadingState) loadingState.style.display = "none";
  if (errorState) errorState.style.display = "none";
  if (dashboardContent) {
    dashboardContent.style.display = "block";
    // Add loaded class for animation
    setTimeout(() => {
      dashboardContent.classList.add("loaded");
    }, 100);
  }
}

function showErrorState(message) {
  // Hide loading state and dashboard content, show error state
  const dashboardContent = document.getElementById("dashboardContent");
  const errorState = document.getElementById("errorState");
  const loadingState = document.getElementById("loadingState");

  if (dashboardContent) dashboardContent.style.display = "none";
  if (loadingState) loadingState.style.display = "none";
  if (errorState) {
    errorState.style.display = "flex";
    // Update error message if element exists
    const errorText = errorState.querySelector("p");
    if (errorText) {
      errorText.textContent = message || "Error loading dashboard data. Please refresh the page.";
    }
  }

  const countElements = [
    "rejected-count",
    "pending-applications-count",
    "pending-approvals-count",
    "new-accounts-count",
    "verified-count",
    "total-customers-count",
  ];

  countElements.forEach((elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = "--";
      element.style.color = "#dc3545";
    }
  });

  // Show error message to user
  console.error("Dashboard Error:", message);
}

function updateStatById(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value || "0";
    element.style.color = ""; // Reset any error styling
  }
}

function createMonthlyChart(monthlyData) {
  const ctx = document.getElementById("myChart");
  if (!ctx) return;

  // Clear any existing chart
  if (
    window.dashboardChart &&
    typeof window.dashboardChart.destroy === "function"
  ) {
    window.dashboardChart.destroy();
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const data = new Array(12).fill(0);

  // Fill data array with actual values
  monthlyData.forEach((item) => {
    if (item.month >= 1 && item.month <= 12) {
      data[item.month - 1] = item.registrations;
    }
  });

  console.log("📊 Creating chart with data:", data);

  window.dashboardChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "New Registrations",
          data: data,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        title: {
          display: true,
          text: "Monthly Customer Registrations",
        },
      },
    },
  });
}

function createEmptyChart() {
  const ctx = document.getElementById("myChart");
  if (!ctx) return;

  // Clear any existing chart
  if (
    window.dashboardChart &&
    typeof window.dashboardChart.destroy === "function"
  ) {
    window.dashboardChart.destroy();
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const data = new Array(12).fill(0);

  console.log("📊 Creating empty chart");

  window.dashboardChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "New Registrations",
          data: data,
          backgroundColor: "rgba(31, 101, 180, 0.1)",
          borderColor: "rgba(31, 101, 180, 0.3)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        title: {
          display: true,
          text: "No data available for this period",
          color: "#666",
          font: {
            size: 14
          }
        },
      },
      layout: {
        padding: 10
      }
    },
  });
}

// Make loadDashboardStats globally accessible for retry button
window.loadDashboardStats = loadDashboardStats;
