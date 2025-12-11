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

  // SVG Icons for result screen
  resultIcons: {
    celebration: `
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <!-- Confetti pieces -->
        <rect x="3" y="3" width="3" height="3" fill="#10B981" rx="0.5">
          <animateTransform attributeName="transform" type="rotate" from="0 4.5 4.5" to="360 4.5 4.5" dur="3s" repeatCount="indefinite"/>
        </rect>
        <circle cx="19" cy="5" r="1.5" fill="#DC2626">
          <animateTransform attributeName="transform" type="translate" values="0,0; 2,-2; 0,0" dur="2s" repeatCount="indefinite"/>
        </circle>
        <polygon points="7,19 9,19 8,21" fill="#F59E0B">
          <animateTransform attributeName="transform" type="rotate" from="0 8 20" to="360 8 20" dur="4s" repeatCount="indefinite"/>
        </polygon>
        <circle cx="18" cy="18" r="1.5" fill="#8B5CF6">
          <animateTransform attributeName="transform" type="scale" values="1;1.3;1" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        
        <!-- Gift box -->
        <rect x="8" y="10" width="8" height="8" rx="1" fill="#DC2626" stroke="#DC2626" stroke-width="1.5"/>
        <rect x="8" y="8" width="8" height="2" rx="0.5" fill="#059669" stroke="#059669" stroke-width="1.5"/>
        <line x1="12" y1="8" x2="12" y2="18" stroke="#F59E0B" stroke-width="2"/>
        <line x1="8" y1="14" x2="16" y2="14" stroke="#F59E0B" stroke-width="2"/>
        
        <!-- Ribbon bow -->
        <path d="M 10 8 Q 9 6 10 5 Q 11 6 12 6 Q 13 6 14 5 Q 15 6 14 8" fill="#F59E0B" stroke="#F59E0B" stroke-width="1"/>
      </svg>
    `,
    christmas: `
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <!-- Christmas tree -->
        <path d="M12 2 L16 8 L14 8 L18 14 L6 14 L10 8 L8 8 Z" fill="#059669" stroke="#047857" stroke-width="1.5"/>
        
        <!-- Star on top -->
        <polygon points="12,1 12.5,2.5 14,3 12.5,3.5 12,5 11.5,3.5 10,3 11.5,2.5" fill="#FBBF24" stroke="#F59E0B" stroke-width="0.5"/>
        
        <!-- Trunk -->
        <rect x="10.5" y="14" width="3" height="3" rx="0.5" fill="#7C4A2A" stroke="#5C3A1A"/>
        
        <!-- Ornaments -->
        <circle cx="10" cy="10" r="0.8" fill="#DC2626"/>
        <circle cx="14" cy="9" r="0.8" fill="#3B82F6"/>
        <circle cx="12" cy="12" r="0.8" fill="#F59E0B"/>
        
        <!-- Snowflakes around -->
        <g opacity="0.6">
          <path d="M 3 5 L 3 7 M 2 6 L 4 6 M 2.5 5.5 L 3.5 6.5 M 3.5 5.5 L 2.5 6.5" stroke="#E0F2FE" stroke-width="0.5"/>
          <path d="M 20 4 L 20 6 M 19 5 L 21 5 M 19.5 4.5 L 20.5 5.5 M 20.5 4.5 L 19.5 5.5" stroke="#E0F2FE" stroke-width="0.5"/>
          <path d="M 19 17 L 19 19 M 18 18 L 20 18 M 18.5 17.5 L 19.5 18.5 M 19.5 17.5 L 18.5 18.5" stroke="#E0F2FE" stroke-width="0.5"/>
        </g>
      </svg>
    `,
    home: `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    `,
    gift: `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 12 20 22 4 22 4 12"/>
        <rect x="2" y="7" width="20" height="5"/>
        <line x1="12" y1="22" x2="12" y2="7"/>
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
      </svg>
    `,
  },

  // Initialize app
  init() {
    // Get DOM elements
    this.landingScreen = document.getElementById("landingScreen");
    this.spinnerScreen = document.getElementById("spinnerScreen");
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
      // Check if result screen is open
      if (document.getElementById("resultScreen")) {
        console.log("Result screen is open, ignoring spinner click");
        return;
      }

      // Also ignore if spinner is not spinning
      if (!Spinner.isSpinning) {
        return;
      }

      if (e.target.id !== "stopSpinBtn") {
        // Reflect disabled/spinning state on the footer button as well
        const stopBtn = document.getElementById("stopSpinBtn");
        if (stopBtn) {
          stopBtn.disabled = true;
          stopBtn.innerHTML = this.spinIconHTMLs.spinning;
        }
        Spinner.stop();
      }
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

    // Close settings modal when clicking outside
    this.settingsModal.addEventListener("click", (e) => {
      e.stopPropagation();
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

  // Show result as full-screen overlay with blurred spinner background
  showResult(item) {
    console.log("=== Creating full-screen result ===");
    console.log("Item:", item);

    // Apply blur to spinner screen instead of hiding it
    this.spinnerScreen.style.filter = "blur(10px)";
    this.spinnerScreen.style.pointerEvents = "none";

    // Hide other screens
    this.landingScreen.style.display = "none";
    if (this.settingsModal) this.settingsModal.style.display = "none";

    // Create full-screen result overlay
    const resultScreen = document.createElement("div");
    resultScreen.id = "resultScreen";
    resultScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      animation: fadeIn 0.3s ease-out;
    `;

    const rarityGradient = this.getRarityGradient(item.rarity);
    const rarityClass = ItemManager.getRarityClass(item.rarity);

    resultScreen.innerHTML = `
      <div style="
        background: white;
        border-radius: 24px;
        padding: 2.5rem 2rem;
        max-width: 420px;
        width: 100%;
        text-align: center;
        box-shadow: 0 25px 50px rgba(0,0,0,0.25);
        animation: slideUpScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
      ">
        <!-- Celebration Icon -->
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: center;">
          ${this.resultIcons.celebration}
        </div>

        <!-- Title -->
        <h2 style="
          font-size: 2rem; 
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
          font-size: 1rem;
          font-weight: 500;
        ">You received</p>

        <!-- Amount -->
        <div style="
          font-size: 3.5rem; 
          font-weight: 800; 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 1rem 0;
          font-family: 'Poppins', sans-serif;
          line-height: 1.2;
        ">
          ${item.value}
        </div>

        <!-- Rarity Badge -->
        <div style="
          display: inline-block;
          padding: 8px 20px;
          border-radius: 16px;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.875rem;
          background: linear-gradient(135deg, ${rarityGradient});
          color: white;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          letter-spacing: 0.5px;
        ">
          ${item.rarity}
        </div>

        <!-- Christmas Icon + Message -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #9ca3af; 
          font-style: italic; 
          margin: 1.5rem 0 2rem 0;
          font-size: 1rem;
        ">
          ${this.resultIcons.christmas}
          <span>Merry Christmas!</span>
        </div>

        <!-- Action Buttons -->
        <div style="
          display: flex; 
          flex-direction: column; 
          gap: 0.75rem; 
          margin-top: 1.5rem;
        ">
          <button id="tryAgainBtnFS" style="
            padding: 1rem 1.5rem;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            border-radius: 14px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: 'Poppins', sans-serif;
            box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          ">
            ${this.resultIcons.gift}
            <span>Try Again</span>
          </button>
          <button id="backHomeBtnFS" style="
            padding: 1rem 1.5rem;
            background: #f3f4f6;
            color: #374151;
            border: none;
            border-radius: 14px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: 'Poppins', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          ">
            ${this.resultIcons.home}
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(resultScreen);

    // Add animation CSS if not already present
    if (!document.getElementById("resultAnimationStyle")) {
      const style = document.createElement("style");
      style.id = "resultAnimationStyle";
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUpScale {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(40px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        #tryAgainBtnFS:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
        }

        #tryAgainBtnFS:active {
          transform: translateY(0);
        }

        #backHomeBtnFS:hover {
          background: #e5e7eb;
          transform: translateY(-2px);
        }

        #backHomeBtnFS:active {
          transform: translateY(0);
        }

        /* Mobile responsive */
        @media (max-width: 480px) {
          #resultScreen > div {
            padding: 2rem 1.5rem !important;
            max-width: 95% !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Event listeners
    document.getElementById("tryAgainBtnFS").addEventListener("click", () => {
      this.closeResult();
      this.showSpinner();
    });

    document.getElementById("backHomeBtnFS").addEventListener("click", () => {
      this.closeResult();
      this.showLanding();
    });

    // Restore the spin button state
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

    console.log("=== Full-screen result created ===");
  },

  // Close result screen
  closeResult() {
    const resultScreen = document.getElementById("resultScreen");
    if (resultScreen) {
      // Fade out animation
      resultScreen.style.opacity = "0";
      resultScreen.style.transition = "opacity 0.3s ease";

      setTimeout(() => {
        resultScreen.remove();

        // Remove blur from spinner screen
        this.spinnerScreen.style.filter = "none";
        this.spinnerScreen.style.pointerEvents = "auto";

        // Show appropriate screen
        this.landingScreen.style.display = "";
        this.spinnerScreen.style.display = "";
      }, 300);
    }

    Spinner.reset();
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
    ItemManager.renderItemsList();
    this.clearItemForm();

    this.settingsModal.style.display = "flex";
    this.settingsModal.style.zIndex = "2000";

    void this.settingsModal.offsetHeight;

    requestAnimationFrame(() => {
      this.settingsModal.classList.add("active");
    });
  },

  // Close settings modal
  closeSettings() {
    this.settingsModal.classList.remove("active");

    setTimeout(() => {
      this.settingsModal.style.display = "none";
    }, 300);

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

    this.confirmModal.style.display = "flex";
    this.confirmModal.style.zIndex = "2000";

    void this.confirmModal.offsetHeight;

    requestAnimationFrame(() => {
      this.confirmModal.classList.add("active");
    });
  },

  // Close confirmation modal
  closeConfirm() {
    this.confirmModal.classList.remove("active");

    setTimeout(() => {
      this.confirmModal.style.display = "none";
    }, 300);

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
    console.log("=== Confetti triggered ===");

    // Play sound using Web Audio API
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
  },

  // Play confetti sound using Web Audio API
  playConfettiSound() {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Create a cheerful ascending tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Celebratory sound settings
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.exponentialRampToValueAtTime(
        1046.5,
        audioContext.currentTime + 0.2
      ); // C6

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
