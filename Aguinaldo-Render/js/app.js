// app.js - Main Application Logic
const App = {
  // DOM Elements
  landingScreen: null,
  spinnerScreen: null,
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

  // PREVENT ALL PAGE RELOADS
  preventReload() {
    console.log("Setting up reload prevention...");

    // Prevent form submissions
    document.addEventListener(
      "submit",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("⚠️ Form submission prevented");
        return false;
      },
      true
    );

    // Log page unload attempts
    window.addEventListener("beforeunload", (e) => {
      console.log("⚠️ PAGE IS TRYING TO RELOAD!");
      console.trace();
    });

    // Prevent anchor link navigation
    document.addEventListener(
      "click",
      (e) => {
        const target = e.target.closest("a");
        if (target && target.href && target.href !== "#" && !target.target) {
          console.log("⚠️ Link click prevented:", target.href);
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      },
      true
    );

    console.log("✅ Reload prevention active");
  },

  // Initialize app
  init() {
    try {
      console.log("=== App initializing ===");

      // PREVENT PAGE RELOADS FIRST
      this.preventReload();

      // Get DOM elements
      this.landingScreen = document.getElementById("landingScreen");
      this.spinnerScreen = document.getElementById("spinnerScreen");
      this.settingsModal = document.getElementById("settingsModal");
      this.confirmModal = document.getElementById("confirmModal");
      this.toast = document.getElementById("toast");

      if (!this.landingScreen || !this.spinnerScreen) {
        console.error("Critical DOM elements missing!");
        return;
      }

      // Initialize modules
      ItemManager.init();
      Spinner.init();

      // Setup event listeners
      this.setupEventListeners();

      // Setup shake detection (optional)
      this.setupShakeDetection();

      console.log("=== App initialized successfully ===");
    } catch (error) {
      console.error("App initialization error:", error);
    }
  },

  // Setup event listeners
  setupEventListeners() {
    try {
      // Landing screen buttons
      const getAguinaldoBtn = document.getElementById("getAguinaldoBtn");
      const settingsBtn = document.getElementById("settingsBtn");
      const stopSpinBtn = document.getElementById("stopSpinBtn");

      if (getAguinaldoBtn) {
        getAguinaldoBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.showSpinner();
        });
      }

      if (settingsBtn) {
        settingsBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.openSettings();
        });
      }

      // Spinner controls
      if (stopSpinBtn) {
        stopSpinBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const btn = e.currentTarget;
          btn.disabled = true;
          btn.innerHTML = this.spinIconHTMLs.spinning;
          Spinner.stop();
        });
      }

      // Allow tapping anywhere on spinner screen to stop
      if (this.spinnerScreen) {
        this.spinnerScreen.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          console.log("Spinner screen clicked");

          if (document.getElementById("resultScreen")) {
            console.log("Result screen is open, ignoring spinner click");
            return false;
          }

          if (!Spinner.isSpinning) {
            console.log("Spinner not spinning, ignoring click");
            return false;
          }

          if (e.target.id !== "stopSpinBtn") {
            console.log("Background tap detected, stopping spinner");
            const stopBtn = document.getElementById("stopSpinBtn");
            if (stopBtn) {
              stopBtn.disabled = true;
              stopBtn.innerHTML = this.spinIconHTMLs.spinning;
            }
            Spinner.stop();
          }

          return false;
        });
      }

      // Settings modal buttons
      const closeSettingsBtn = document.getElementById("closeSettingsBtn");
      const addItemBtn = document.getElementById("addItemBtn");
      const resetItemsBtn = document.getElementById("resetItemsBtn");

      if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.closeSettings();
        });
      }

      if (addItemBtn) {
        addItemBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleAddOrUpdateItem();
        });
      }

      if (resetItemsBtn) {
        resetItemsBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleResetItems();
        });
      }

      // Confirm modal buttons
      const confirmYesBtn = document.getElementById("confirmYesBtn");
      const confirmNoBtn = document.getElementById("confirmNoBtn");

      if (confirmYesBtn) {
        confirmYesBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (this.confirmCallback) {
            this.confirmCallback();
          }
          this.closeConfirm();
        });
      }

      if (confirmNoBtn) {
        confirmNoBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.closeConfirm();
        });
      }

      // Close settings modal when clicking outside
      if (this.settingsModal) {
        this.settingsModal.addEventListener("click", (e) => {
          e.stopPropagation();
          if (e.target === this.settingsModal) {
            this.closeSettings();
          }
        });
      }

      // Form enter key submission
      const newItemValue = document.getElementById("newItemValue");
      const newItemWeight = document.getElementById("newItemWeight");

      if (newItemValue) {
        newItemValue.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            this.handleAddOrUpdateItem();
          }
        });
      }

      if (newItemWeight) {
        newItemWeight.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            this.handleAddOrUpdateItem();
          }
        });
      }
    } catch (error) {
      console.error("Error setting up event listeners:", error);
    }
  },

  // Setup shake detection
  setupShakeDetection() {
    if (!window.DeviceMotionEvent) return;

    let lastX, lastY, lastZ;
    let lastTime = 0;
    const shakeThreshold = 15;

    window.addEventListener("devicemotion", (e) => {
      try {
        const current = e.accelerationIncludingGravity;

        if (!current || !current.x || !current.y || !current.z) return;

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
      } catch (error) {
        console.error("Shake detection error:", error);
      }
    });
  },

  // Show landing screen
  showLanding() {
    try {
      console.log("Showing landing screen");
      if (this.landingScreen) {
        this.landingScreen.classList.remove("hidden");
      }
      if (this.spinnerScreen) {
        this.spinnerScreen.classList.add("hidden");
      }
    } catch (error) {
      console.error("Error showing landing:", error);
    }
  },

  // Show spinner screen
  showSpinner() {
    try {
      console.log("Showing spinner screen");
      if (this.landingScreen) {
        this.landingScreen.classList.add("hidden");
      }
      if (this.spinnerScreen) {
        this.spinnerScreen.classList.remove("hidden");
      }

      const stopBtn = document.getElementById("stopSpinBtn");
      if (stopBtn) {
        stopBtn.disabled = false;
        stopBtn.innerHTML = this.spinIconHTMLs.idle;
      }

      setTimeout(() => {
        Spinner.start();
      }, 500);
    } catch (error) {
      console.error("Error showing spinner:", error);
    }
  },

  // Show result as full-screen overlay with blurred spinner background
  showResult(item) {
    try {
      console.log("=== SHOWRESULT (iPhone Safe) ===");

      const spinnerScreen = this.spinnerScreen;

      // SAFER: use opacity fade instead of blur (iOS bug)
      if (spinnerScreen) {
        spinnerScreen.style.opacity = "0.25";
        spinnerScreen.style.pointerEvents = "none"; // but allow overlay
      }

      // Create the result screen
      const resultScreen = document.createElement("div");
      resultScreen.id = "resultScreen";

      // iPhone-safe fullscreen overlay
      resultScreen.setAttribute(
        "style",
        `
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.65);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        opacity: 0;
        transition: opacity 0.25s ease;
      `
      );

      resultScreen.innerHTML = this.createResultHTML(item);

      document.body.appendChild(resultScreen);

      // --- FORCE iPhone to repaint the element ---
      requestAnimationFrame(() => {
        resultScreen.style.opacity = "1";
      });

      // --- SAFER event handling using delegation ---
      resultScreen.addEventListener("click", (e) => {
        const id = e.target.id || e.target.closest("button")?.id || "";

        if (id === "tryAgainBtnFS") {
          console.log("Try Again clicked (iPhone safe)");
          this.closeResult();
          this.showSpinner();
        }

        if (id === "backHomeBtnFS") {
          console.log("Home clicked (iPhone safe)");
          this.closeResult();
          this.showLanding();
        }
      });

      // Restore spin button
      const stopBtn = document.getElementById("stopSpinBtn");
      if (stopBtn) {
        stopBtn.disabled = false;
        stopBtn.innerHTML = this.spinIconHTMLs.idle;
      }

      // Light confetti (iPhone-safe)
      setTimeout(() => this.triggerConfetti(), 150);

      // iPhone vibration fallback
      if (navigator.vibrate) {
        try {
          navigator.vibrate([180, 80, 180]);
        } catch (_) {}
      }

      console.log("=== SHOWRESULT COMPLETE ===");
    } catch (err) {
      console.error("iPhone-safe showResult error:", err);
    }
  },

  // Create result HTML (responsive version)
  createResultHTML(item) {
    const rarityGradient = this.getRarityGradient(item.rarity);

    return `
      <div style="
        background: white;
        border-radius: 20px;
        padding: clamp(1.25rem, 5vw, 2.5rem) clamp(1rem, 4vw, 2rem);
        max-width: 420px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        margin: auto;
      ">
        <!-- Celebration Icon -->
        <div style="margin-bottom: clamp(1rem, 3vw, 1.5rem);">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="display: inline-block; max-width: 100%; height: auto;">
            <rect x="3" y="3" width="3" height="3" fill="#10B981" rx="0.5"/>
            <circle cx="19" cy="5" r="1.5" fill="#DC2626"/>
            <polygon points="7,19 9,19 8,21" fill="#F59E0B"/>
            <circle cx="18" cy="18" r="1.5" fill="#8B5CF6"/>
            <rect x="8" y="10" width="8" height="8" rx="1" fill="#DC2626" stroke="#DC2626" stroke-width="1.5"/>
            <rect x="8" y="8" width="8" height="2" rx="0.5" fill="#059669" stroke="#059669" stroke-width="1.5"/>
            <line x1="12" y1="8" x2="12" y2="18" stroke="#F59E0B" stroke-width="2"/>
            <line x1="8" y1="14" x2="16" y2="14" stroke="#F59E0B" stroke-width="2"/>
            <path d="M 10 8 Q 9 6 10 5 Q 11 6 12 6 Q 13 6 14 5 Q 15 6 14 8" fill="#F59E0B" stroke="#F59E0B" stroke-width="1"/>
          </svg>
        </div>

        <!-- Title -->
        <h2 style="
          font-size: clamp(1.5rem, 5vw, 2rem);
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.75rem;
          font-family: 'Poppins', sans-serif;
          line-height: 1.2;
        ">
          Congratulations!
        </h2>

        <!-- Subtitle -->
        <p style="
          color: #6b7280;
          margin-bottom: 0.5rem;
          font-size: clamp(0.875rem, 3vw, 1rem);
          font-weight: 500;
        ">You received</p>

        <!-- Amount -->
        <div style="
          font-size: clamp(2rem, 8vw, 3.5rem);
          font-weight: 800;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 1rem 0;
          font-family: 'Poppins', sans-serif;
          line-height: 1.2;
          word-break: break-word;
        ">
          ${item.value}
        </div>

        <!-- Rarity Badge -->
        <div style="
          display: inline-block;
          padding: 6px 16px;
          border-radius: 12px;
          font-weight: 600;
          text-transform: uppercase;
          font-size: clamp(0.75rem, 2.5vw, 0.875rem);
          background: linear-gradient(135deg, ${rarityGradient});
          color: white;
          margin-bottom: clamp(1rem, 3vw, 1.5rem);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          letter-spacing: 0.5px;
        ">
          ${item.rarity}
        </div>

        <!-- Christmas Message -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #9ca3af;
          font-style: italic;
          margin: clamp(1rem, 3vw, 1.5rem) 0 clamp(1.5rem, 4vw, 2rem) 0;
          font-size: clamp(0.875rem, 3vw, 1rem);
          flex-wrap: wrap;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="flex-shrink: 0; max-width: 50px; height: auto;">
            <path d="M12 2 L16 8 L14 8 L18 14 L6 14 L10 8 L8 8 Z" fill="#059669" stroke="#047857" stroke-width="1.5"/>
            <polygon points="12,1 12.5,2.5 14,3 12.5,3.5 12,5 11.5,3.5 10,3 11.5,2.5" fill="#FBBF24" stroke="#F59E0B" stroke-width="0.5"/>
            <rect x="10.5" y="14" width="3" height="3" rx="0.5" fill="#7C4A2A" stroke="#5C3A1A"/>
            <circle cx="10" cy="10" r="0.8" fill="#DC2626"/>
            <circle cx="14" cy="9" r="0.8" fill="#3B82F6"/>
            <circle cx="12" cy="12" r="0.8" fill="#F59E0B"/>
          </svg>
          <span>Merry Christmas!</span>
        </div>

        <!-- Action Buttons -->
        <div style="
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: clamp(1rem, 3vw, 1.5rem);
        ">
          <button id="tryAgainBtnFS" type="button" style="
            padding: clamp(0.75rem, 2.5vw, 1rem) 1.5rem;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: clamp(0.875rem, 3vw, 1rem);
            cursor: pointer;
            font-family: 'Poppins', sans-serif;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
            -webkit-tap-highlight-color: transparent;
            min-height: 44px;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 12 20 22 4 22 4 12"/>
              <rect x="2" y="7" width="20" height="5"/>
              <line x1="12" y1="22" x2="12" y2="7"/>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
            <span>Try Again</span>
          </button>
          <button id="backHomeBtnFS" type="button" style="
            padding: clamp(0.75rem, 2.5vw, 1rem) 1.5rem;
            background: #f3f4f6;
            color: #374151;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: clamp(0.875rem, 3vw, 1rem);
            cursor: pointer;
            font-family: 'Poppins', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
            -webkit-tap-highlight-color: transparent;
            min-height: 44px;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    `;
  },

  // Add result styles
  addResultStyles() {
    if (document.getElementById("resultAnimationStyle")) return;

    const style = document.createElement("style");
    style.id = "resultAnimationStyle";
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      #resultScreen {
        animation: fadeIn 0.3s ease-out;
      }

      #resultScreen > div {
        animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      #tryAgainBtnFS:active,
      #backHomeBtnFS:active {
        transform: scale(0.98);
        opacity: 0.9;
      }

      @media (max-width: 480px) {
        #resultScreen {
          padding: 0.75rem !important;
        }
      }

      @media (max-width: 360px) {
        #resultScreen {
          padding: 0.5rem !important;
        }
      }
    `;
    document.head.appendChild(style);
  },

  closeResult() {
    const rs = document.getElementById("resultScreen");
    if (!rs) return;

    rs.style.opacity = "0";

    setTimeout(() => {
      rs.remove();
      if (this.spinnerScreen) {
        this.spinnerScreen.style.opacity = "1";
        this.spinnerScreen.style.pointerEvents = "auto";
      }
    }, 200);
  },

  // Helper function for rarity gradients
  getRarityGradient(rarity) {
    switch (rarity) {
      case "rare":
        return "#9333ea 0%, #e91e63 100%";
      case "uncommon":
        return "#ea8a00 0%, #dc2626 100%";
      default:
        return "#10b981 0%, #059669 100%";
    }
  },

  // Open settings modal
  openSettings() {
    try {
      ItemManager.renderItemsList();
      this.clearItemForm();

      if (this.settingsModal) {
        this.settingsModal.style.display = "flex";
        this.settingsModal.style.zIndex = "2000";

        void this.settingsModal.offsetHeight;

        requestAnimationFrame(() => {
          this.settingsModal.classList.add("active");
        });
      }
    } catch (error) {
      console.error("Error opening settings:", error);
    }
  },

  // Close settings modal
  closeSettings() {
    try {
      if (this.settingsModal) {
        this.settingsModal.classList.remove("active");

        setTimeout(() => {
          this.settingsModal.style.display = "none";
        }, 300);
      }

      this.clearItemForm();
    } catch (error) {
      console.error("Error closing settings:", error);
    }
  },

  // Handle add or update item
  handleAddOrUpdateItem() {
    try {
      const valueInput = document.getElementById("newItemValue");
      const weightInput = document.getElementById("newItemWeight");
      const rarityInput = document.getElementById("newItemRarity");
      const addBtn = document.getElementById("addItemBtn");

      if (!valueInput || !weightInput || !rarityInput || !addBtn) return;

      const value = valueInput.value.trim();
      const weight = parseInt(weightInput.value);
      const rarity = rarityInput.value;

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
        Spinner.init();
      } else {
        this.showToast(result.message);
      }
    } catch (error) {
      console.error("Error handling item:", error);
    }
  },

  // Handle reset items
  handleResetItems() {
    try {
      this.showConfirm(
        "Reset Items",
        "This will reset all items to default values. Are you sure?",
        () => {
          const result = ItemManager.resetToDefault();
          this.showToast(result.message);
          Spinner.init();
        }
      );
    } catch (error) {
      console.error("Error resetting items:", error);
    }
  },

  // Clear item form
  clearItemForm() {
    try {
      const valueInput = document.getElementById("newItemValue");
      const weightInput = document.getElementById("newItemWeight");
      const rarityInput = document.getElementById("newItemRarity");
      const addBtn = document.getElementById("addItemBtn");

      if (valueInput) valueInput.value = "";
      if (weightInput) weightInput.value = "";
      if (rarityInput) rarityInput.value = "common";
      if (addBtn) {
        addBtn.textContent = "+ Add Item";
        delete addBtn.dataset.editId;
      }
    } catch (error) {
      console.error("Error clearing form:", error);
    }
  },

  // Show confirmation modal
  showConfirm(title, message, callback) {
    try {
      const confirmTitle = document.getElementById("confirmTitle");
      const confirmMessage = document.getElementById("confirmMessage");

      if (confirmTitle) confirmTitle.textContent = title;
      if (confirmMessage) confirmMessage.textContent = message;

      this.confirmCallback = callback;

      if (this.confirmModal) {
        this.confirmModal.style.display = "flex";
        this.confirmModal.style.zIndex = "2000";

        void this.confirmModal.offsetHeight;

        requestAnimationFrame(() => {
          this.confirmModal.classList.add("active");
        });
      }
    } catch (error) {
      console.error("Error showing confirm:", error);
    }
  },

  // Close confirmation modal
  closeConfirm() {
    try {
      if (this.confirmModal) {
        this.confirmModal.classList.remove("active");

        setTimeout(() => {
          this.confirmModal.style.display = "none";
        }, 300);
      }

      this.confirmCallback = null;
    } catch (error) {
      console.error("Error closing confirm:", error);
    }
  },

  // Show toast notification
  showToast(message) {
    try {
      const toastMessage = document.getElementById("toastMessage");
      if (toastMessage) {
        toastMessage.textContent = message;
      }

      if (this.toast) {
        this.toast.classList.remove("hidden");

        setTimeout(() => {
          this.toast.classList.add("hidden");
        }, 4000);
      }
    } catch (error) {
      console.error("Error showing toast:", error);
    }
  },

  // Trigger confetti animation
  triggerConfetti() {
    try {
      console.log("=== Confetti triggered ===");

      this.playConfettiSound();

      const colors = [
        "#10B981",
        "#DC2626",
        "#F59E0B",
        "#8B5CF6",
        "#EC4899",
        "#3B82F6",
      ];
      const shapes = ["circle", "square"];
      const confettiCount = 60;

      for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
          const confetti = document.createElement("div");
          const color = colors[Math.floor(Math.random() * colors.length)];
          const shape = shapes[Math.floor(Math.random() * shapes.length)];
          const size = 8 + Math.random() * 6;
          const startX = Math.random() * 100;
          const drift = (Math.random() - 0.5) * 100;

          confetti.style.position = "fixed";
          confetti.style.width = size + "px";
          confetti.style.height = size + "px";
          confetti.style.top = "-20px";
          confetti.style.left = startX + "%";
          confetti.style.background = color;
          confetti.style.zIndex = "10001";
          confetti.style.pointerEvents = "none";
          confetti.style.borderRadius = shape === "circle" ? "50%" : "2px";
          confetti.style.opacity = "0.8";

          const duration = 2.5 + Math.random() * 1.5;
          const rotation = 360 + Math.random() * 360;

          confetti.animate(
            [
              {
                transform: `translateY(0) translateX(0) rotate(0deg)`,
                opacity: 0.9,
              },
              {
                transform: `translateY(${
                  window.innerHeight + 50
                }px) translateX(${drift}px) rotate(${rotation}deg)`,
                opacity: 0,
              },
            ],
            {
              duration: duration * 1000,
              easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              fill: "forwards",
            }
          );

          document.body.appendChild(confetti);

          setTimeout(() => {
            confetti.remove();
          }, (duration + 0.5) * 1000);
        }, i * 40);
      }
    } catch (error) {
      console.error("Confetti error:", error);
    }
  },

  // Play confetti sound using Web Audio API
  playConfettiSound() {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        1046.5,
        audioContext.currentTime + 0.2
      );

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log("Audio not supported:", e);
    }
  },
};

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
