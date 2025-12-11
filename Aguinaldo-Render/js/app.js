// app.js - Main Application Logic
const App = {
  // DOM Elements
  landingScreen: null,
  spinnerScreen: null,
  resultModal: null,
  settingsModal: null,
  confirmModal: null,
  toast: null,

  confirmCallback: null,

  // SVG HTML for spin button states
  spinIconHTMLs: {
    idle: `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="inline-block align-middle">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M12 7v13" />
        <path d="M7 7l5-4 5 4" />
      </svg>
      <span class="ml-2 align-middle">SPIN</span>
    `,
    spinning: `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="inline-block align-middle">
        <g>
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M22 12a10 10 0 0 0-10-10" />
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite" />
        </g>
      </svg>
      <span class="ml-2 align-middle">Spinning...</span>
    `,
  },

  // Initialize app
  init() {
    // Get DOM elements
    this.landingScreen = document.getElementById("landingScreen");
    this.spinnerScreen = document.getElementById("spinnerScreen");
    this.resultModal = document.getElementById("resultModal");
    this.settingsModal = document.getElementById("settingsModal");
    this.confirmModal = document.getElementById("confirmModal");
    this.toast = document.getElementById("toast");

    // Initialize modules
    ItemManager.init();
    Spinner.init();

    // Setup event listeners
    this.setupEventListeners();

    // Setup shake detection (optional)
    this.setupShakeDetection();
  },

  // Setup event listeners
  setupEventListeners() {
    // Landing screen buttons
    document.getElementById("getAguinaldoBtn").addEventListener("click", () => {
      this.showSpinner();
    });

    document.getElementById("settingsBtn").addEventListener("click", () => {
      this.openSettings();
    });

    // Spinner controls
    document.getElementById("stopSpinBtn").addEventListener("click", (e) => {
      const btn = e.currentTarget;
      // Show spinning state and prevent double clicks
      btn.disabled = true;
      // use SVG + label
      btn.innerHTML = this.spinIconHTMLs.spinning;
      Spinner.stop();
    });

    // Allow tapping anywhere on spinner screen to stop
    this.spinnerScreen.addEventListener("click", (e) => {
      if (e.target.id !== "stopSpinBtn" && Spinner.isSpinning) {
        // Reflect disabled/spinning state on the footer button as well
        const stopBtn = document.getElementById("stopSpinBtn");
        if (stopBtn) {
          stopBtn.disabled = true;
          stopBtn.innerHTML = this.spinIconHTMLs.spinning;
        }
        Spinner.stop();
      }
    });

    // Result modal buttons
    document.getElementById("tryAgainBtn").addEventListener("click", () => {
      this.closeResult();
      this.showSpinner();
    });

    document.getElementById("closeResultBtn").addEventListener("click", () => {
      this.closeResult();
      this.showLanding();
    });

    // Settings modal buttons
    document
      .getElementById("closeSettingsBtn")
      .addEventListener("click", () => {
        this.closeSettings();
      });

    document.getElementById("addItemBtn").addEventListener("click", () => {
      this.handleAddOrUpdateItem();
    });

    document.getElementById("resetItemsBtn").addEventListener("click", () => {
      this.handleResetItems();
    });

    // Confirm modal buttons
    document.getElementById("confirmYesBtn").addEventListener("click", () => {
      if (this.confirmCallback) {
        this.confirmCallback();
      }
      this.closeConfirm();
    });

    document.getElementById("confirmNoBtn").addEventListener("click", () => {
      this.closeConfirm();
    });

    // Close modals when clicking outside
    this.resultModal.addEventListener("click", (e) => {
      if (e.target === this.resultModal) {
        this.closeResult();
        this.showLanding();
      }
    });

    this.settingsModal.addEventListener("click", (e) => {
      if (e.target === this.settingsModal) {
        this.closeSettings();
      }
    });

    // Form enter key submission
    document
      .getElementById("newItemValue")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.handleAddOrUpdateItem();
        }
      });

    document
      .getElementById("newItemWeight")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.handleAddOrUpdateItem();
        }
      });
  },

  // Setup shake detection
  setupShakeDetection() {
    if (!window.DeviceMotionEvent) return;

    let lastX, lastY, lastZ;
    let lastTime = 0;
    const shakeThreshold = 15;

    window.addEventListener("devicemotion", (e) => {
      const current = e.accelerationIncludingGravity;

      if (!current.x || !current.y || !current.z) return;

      const currentTime = Date.now();

      if (lastX !== undefined && lastY !== undefined && lastZ !== undefined) {
        const deltaX = Math.abs(current.x - lastX);
        const deltaY = Math.abs(current.y - lastY);
        const deltaZ = Math.abs(current.z - lastZ);

        if (
          (deltaX > shakeThreshold ||
            deltaY > shakeThreshold ||
            deltaZ > shakeThreshold) &&
          currentTime - lastTime > 1000
        ) {
          // Shake detected!
          if (
            this.landingScreen.style.display !== "none" &&
            !this.landingScreen.classList.contains("hidden")
          ) {
            this.showSpinner();
          }

          lastTime = currentTime;
        }
      }

      lastX = current.x;
      lastY = current.y;
      lastZ = current.z;
    });
  },

  // Show landing screen
  showLanding() {
    this.landingScreen.classList.remove("hidden");
    this.spinnerScreen.classList.add("hidden");
  },

  // Show spinner screen
  showSpinner() {
    this.landingScreen.classList.add("hidden");
    this.spinnerScreen.classList.remove("hidden");
    // Ensure spin button is in default state
    const stopBtn = document.getElementById("stopSpinBtn");
    if (stopBtn) {
      stopBtn.disabled = false;
      stopBtn.innerHTML = this.spinIconHTMLs.idle;
    }

    // Start spinning after a short delay
    setTimeout(() => {
      Spinner.start();
    }, 500);
  },

  // Show result modal
  showResult(item) {
    const resultAmount = document.getElementById("resultAmount");
    const resultRarity = document.getElementById("resultRarity");

    resultAmount.textContent = item.value;
    resultRarity.textContent = item.rarity;
    resultRarity.className =
      "inline-block rarity-badge " + ItemManager.getRarityClass(item.rarity);

    this.resultModal.classList.add("active");

    // Restore the spin button state when result modal opens
    const stopBtn = document.getElementById("stopSpinBtn");
    if (stopBtn) {
      stopBtn.disabled = false;
      stopBtn.innerHTML = this.spinIconHTMLs.idle;
    }

    // Trigger confetti
    this.triggerConfetti();

    // Vibrate
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  },

  // Close result modal
  closeResult() {
    this.resultModal.classList.remove("active");
    // Only reset spinner when closing result
    Spinner.reset();
  },

  // Open settings modal
  openSettings() {
    ItemManager.renderItemsList();
    this.clearItemForm();
    this.settingsModal.classList.add("active");
  },

  // Close settings modal
  closeSettings() {
    this.settingsModal.classList.remove("active");
    this.clearItemForm();
  },

  // Handle add or update item
  handleAddOrUpdateItem() {
    const valueInput = document.getElementById("newItemValue");
    const weightInput = document.getElementById("newItemWeight");
    const rarityInput = document.getElementById("newItemRarity");
    const addBtn = document.getElementById("addItemBtn");

    const value = valueInput.value.trim();
    const weight = parseInt(weightInput.value);
    const rarity = rarityInput.value;

    // Check if in edit mode
    const editId = addBtn.dataset.editId;

    let result;
    if (editId) {
      result = ItemManager.editItem(editId, value, weight, rarity);
      delete addBtn.dataset.editId;
      addBtn.textContent = "+ Add Item";
    } else {
      result = ItemManager.addItem(value, weight, rarity);
    }

    if (result.success) {
      this.showToast(result.message);
      this.clearItemForm();
      ItemManager.renderItemsList();
      // Update spinner items
      Spinner.init();
    } else {
      this.showToast(result.message);
    }
  },

  // Handle reset items
  handleResetItems() {
    this.showConfirm(
      "Reset Items",
      "This will reset all items to default values. Are you sure?",
      () => {
        const result = ItemManager.resetToDefault();
        this.showToast(result.message);
        Spinner.init();
      }
    );
  },

  // Clear item form
  clearItemForm() {
    document.getElementById("newItemValue").value = "";
    document.getElementById("newItemWeight").value = "";
    document.getElementById("newItemRarity").value = "common";
    const addBtn = document.getElementById("addItemBtn");
    addBtn.textContent = "+ Add Item";
    delete addBtn.dataset.editId;
  },

  // Show confirmation modal
  showConfirm(title, message, callback) {
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmMessage").textContent = message;
    this.confirmCallback = callback;
    this.confirmModal.classList.add("active");
  },

  // Close confirmation modal
  closeConfirm() {
    this.confirmModal.classList.remove("active");
    this.confirmCallback = null;
  },

  // Show toast notification
  showToast(message) {
    const toastMessage = document.getElementById("toastMessage");
    toastMessage.textContent = message;

    this.toast.classList.remove("hidden");

    setTimeout(() => {
      this.toast.classList.add("hidden");
    }, 4000);
  },

  // Trigger confetti animation
  triggerConfetti() {
    const colors = ["#10B981", "#DC2626", "#F59E0B", "#8B5CF6", "#EC4899"];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement("div");
        confetti.className = "confetti";
        confetti.style.left = Math.random() * 100 + "%";
        confetti.style.background =
          colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + "s";
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

        document.body.appendChild(confetti);

        setTimeout(() => {
          confetti.remove();
        }, 3000);
      }, i * 30);
    }
  },
};

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
