// spinner.js - Spinner Animation Logic
const Spinner = {
  track: null,
  items: [],
  isSpinning: false,
  animationFrame: null,
  currentPosition: 0,
  velocity: 0,
  selectedItem: null,
  spinnerItems: [],
  tickSound: null, // ADD THIS
  lastTickPosition: 0, // ADD THIS

  // Initialize spinner
  init() {
    this.track = document.getElementById("spinnerTrack");
    this.items = ItemManager.getAllItems();

    // Initialize tick sound using Web Audio API
    this.initTickSound(); // ADD THIS
  },

  // ADD THIS METHOD - Create tick sound
  initTickSound() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      console.log("Audio not supported:", e);
    }
  },

  // ADD THIS METHOD - Play tick sound
  playTick() {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.05
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.05);
    } catch (e) {
      console.log("Tick sound error:", e);
    }
  },

  // Weighted random selection
  selectWeightedRandom() {
    const totalWeight = this.items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of this.items) {
      random -= item.weight;
      if (random <= 0) {
        return item;
      }
    }

    return this.items[0]; // Fallback
  },

  // Generate spinner items array (duplicates for scrolling effect)
  generateSpinnerItems(selectedItem) {
    const spinnerItems = [];
    const totalItems = 50;
    const cycles = 25;

    for (let cycle = 0; cycle < cycles; cycle++) {
      for (let i = 0; i < totalItems; i++) {
        if (
          cycle === Math.floor(cycles / 2) &&
          i === Math.floor(totalItems * 0.75)
        ) {
          spinnerItems.push({ ...selectedItem, isSelected: true });
        } else {
          let item;

          if (
            cycle === Math.floor(cycles / 2) &&
            i > Math.floor(totalItems * 0.6) &&
            i < Math.floor(totalItems * 0.75)
          ) {
            const rareItems = this.items.filter(
              (item) => item.rarity === "rare" || item.rarity === "uncommon"
            );
            item =
              rareItems.length > 0
                ? rareItems[Math.floor(Math.random() * rareItems.length)]
                : this.selectWeightedRandom();
          } else {
            item = this.selectWeightedRandom();
          }

          spinnerItems.push({ ...item, isSelected: false });
        }
      }
    }

    return spinnerItems;
  },

  // Render spinner track
  renderTrack(items) {
    this.track.innerHTML = items
      .map(
        (item, index) => `
            <div class="spinner-item ${item.rarity}" data-index="${index}">
                <div class="text-4xl font-bold mb-2">${item.value}</div>
                <div class="text-xs opacity-75 uppercase">${item.rarity}</div>
            </div>
        `
      )
      .join("");
  },

  // Start spinning
  start() {
    if (this.isSpinning) return;

    this.isSpinning = true;
    this.items = ItemManager.getAllItems();

    if (this.items.length === 0) {
      App.showToast("No items available!");
      return;
    }

    // Select winning item
    this.selectedItem = this.selectWeightedRandom();

    // Generate spinner items
    this.spinnerItems = this.generateSpinnerItems(this.selectedItem);

    // Render track
    this.renderTrack(this.spinnerItems);

    // Reset position and velocity
    this.currentPosition = 0;
    this.velocity = 12;
    this.lastTickPosition = 0; // ADD THIS

    // Start animation
    this.animate();

    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  },

  // Stop spinning
  stop() {
    if (!this.isSpinning) return;

    this.isSpinning = false;
    this.velocity = 0;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    const selectedIndex = this.spinnerItems.findIndex(
      (item) => item.isSelected
    );
    const itemWidth = 170;
    const spinnerContainer = document.querySelector(".spinner-container");
    const containerWidth = spinnerContainer
      ? spinnerContainer.offsetWidth
      : window.innerWidth;

    const targetPosition = -(
      selectedIndex * itemWidth -
      containerWidth / 2 +
      itemWidth / 2
    );

    const decelerationFrames = 180;

    this.decelerateTo(targetPosition, decelerationFrames);
  },

  // Decelerate to target position
  decelerateTo(targetPosition, frames) {
    let currentFrame = 0;
    const startPosition = this.currentPosition;
    const distance = targetPosition - startPosition;

    const decelerate = () => {
      if (currentFrame >= frames) {
        this.currentPosition = targetPosition;
        this.track.style.transform = `translateX(${this.currentPosition}px)`;
        this.finish();
        return;
      }

      const progress = currentFrame / frames;
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      this.currentPosition = startPosition + distance * easeProgress;
      this.track.style.transform = `translateX(${this.currentPosition}px)`;

      // ADD THIS - Play tick sound based on position
      const itemWidth = 170;
      const currentItemIndex = Math.floor(
        Math.abs(this.currentPosition) / itemWidth
      );

      if (currentItemIndex !== this.lastTickPosition) {
        // Play tick less frequently as we slow down
        const tickFrequency = Math.max(
          1,
          Math.floor((frames - currentFrame) / 30)
        );
        if (currentFrame % tickFrequency === 0) {
          this.playTick();
        }
        this.lastTickPosition = currentItemIndex;
      }

      currentFrame++;
      this.animationFrame = requestAnimationFrame(decelerate);
    };

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    decelerate();
  },

  // Animation loop
  animate() {
    if (!this.isSpinning) return;

    this.currentPosition -= this.velocity;

    // ADD THIS - Play tick sound at intervals
    const itemWidth = 170;
    const currentItemIndex = Math.floor(
      Math.abs(this.currentPosition) / itemWidth
    );

    if (currentItemIndex !== this.lastTickPosition) {
      this.playTick();
      this.lastTickPosition = currentItemIndex;
    }

    this.track.style.transform = `translateX(${this.currentPosition}px)`;

    this.animationFrame = requestAnimationFrame(() => this.animate());
  },

  // Finish spinning
  finish() {
    console.log("=== SPINNER FINISH START ===");

    this.isSpinning = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Vibrate on finish
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    const spinnerContainer = document.querySelector(".spinner-container");
    const containerRect = spinnerContainer.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;

    const items = this.track.querySelectorAll(".spinner-item");
    let closestItem = null;
    let closestDistance = Infinity;
    let closestIndex = -1;

    items.forEach((item, index) => {
      const itemRect = item.getBoundingClientRect();
      const itemCenterX = itemRect.left + itemRect.width / 2;
      const distance = Math.abs(itemCenterX - centerX);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestItem = item;
        closestIndex = index;
      }
    });

    if (closestItem) {
      closestItem.classList.add("selected-winner");
    }

    let winningItem;
    if (closestIndex >= 0 && closestIndex < this.spinnerItems.length) {
      winningItem = this.spinnerItems[closestIndex];
    } else {
      winningItem = this.selectedItem;
    }

    console.log("Winning item:", JSON.stringify(winningItem));
    console.log("About to call showResult in 1500ms");

    // Play winning sound
    this.playWinSound();

    // CRITICAL: Call showResult after delay
    setTimeout(() => {
      console.log("=== CALLING APP.SHOWRESULT ===");
      console.log("Timestamp:", Date.now());
      console.log("App object exists:", typeof App !== "undefined");
      console.log(
        "App.showResult exists:",
        typeof App.showResult === "function"
      );

      if (typeof App !== "undefined" && App.showResult) {
        App.showResult(winningItem);
        console.log("=== APP.SHOWRESULT CALLED SUCCESSFULLY ===");
      } else {
        console.error("ERROR: App or App.showResult not found!");
      }
    }, 1500);

    console.log("=== SPINNER FINISH END ===");
  },

  // ADD THIS METHOD - Play winning sound
  playWinSound() {
    if (!this.audioContext) return;

    try {
      // Play a celebratory chord
      const frequencies = [523.25, 659.25, 783.99]; // C-E-G chord

      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(
            freq,
            this.audioContext.currentTime
          );

          gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 0.5
          );

          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.5);
        }, index * 100);
      });
    } catch (e) {
      console.log("Win sound error:", e);
    }
  },

  // Reset spinner
  reset() {
    this.isSpinning = false;
    this.currentPosition = 0;
    this.velocity = 0;
    this.selectedItem = null;
    this.spinnerItems = [];
    this.lastTickPosition = 0; // ADD THIS

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.track) {
      this.track.innerHTML = "";
      this.track.style.transform = "translateX(0)";
    }
  },
};
