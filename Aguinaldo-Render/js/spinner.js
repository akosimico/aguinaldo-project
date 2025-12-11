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

  // Initialize spinner
  init() {
    this.track = document.getElementById("spinnerTrack");
    this.items = ItemManager.getAllItems();
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
    const totalItems = 50; // Number of items to show in one cycle

    // Create multiple cycles of items for infinite looping
    const cycles = 25; // Repeat the pattern 25 times for seamless looping

    for (let cycle = 0; cycle < cycles; cycle++) {
      // Fill with random items
      for (let i = 0; i < totalItems; i++) {
        if (
          cycle === Math.floor(cycles / 2) &&
          i === Math.floor(totalItems * 0.75)
        ) {
          // Place the selected item at 75% position in the middle cycle
          spinnerItems.push({ ...selectedItem, isSelected: true });
        } else {
          // Add random items, with rare items always appearing before the selected one
          let item;

          // Always show rare items before the selected item (for excitement)
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
    this.velocity = 12; // Slower velocity for better visual appeal

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

    // Stop the spinning animation immediately
    this.isSpinning = false;
    this.velocity = 0;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Calculate target position (center the selected item in viewport)
    const selectedIndex = this.spinnerItems.findIndex(
      (item) => item.isSelected
    );
    const itemWidth = 170; // 150px width + 20px margin
    const spinnerContainer = document.querySelector(".spinner-container");
    const containerWidth = spinnerContainer
      ? spinnerContainer.offsetWidth
      : window.innerWidth;

    // Calculate the position to center the selected item at the red line (center of container)
    // The red line is at the center of the spinner-container
    // targetPosition moves the track so the selected item aligns with the red line
    const targetPosition = -(
      selectedIndex * itemWidth -
      containerWidth / 2 +
      itemWidth / 2
    );

    // Calculate deceleration needed
    const decelerationFrames = 180; // Slower deceleration (3 seconds at 60fps)

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

      // Easing function (ease-out cubic)
      const progress = currentFrame / frames;
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      this.currentPosition = startPosition + distance * easeProgress;
      this.track.style.transform = `translateX(${this.currentPosition}px)`;

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

    // Update position
    this.currentPosition -= this.velocity;

    // Apply transform
    this.track.style.transform = `translateX(${this.currentPosition}px)`;

    // Continue animation
    this.animationFrame = requestAnimationFrame(() => this.animate());
  },

  // Finish spinning
  finish() {
    this.isSpinning = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Vibrate on finish
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    // Find the item currently at the center (red line position)
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

    // Highlight the item at center
    if (closestItem) {
      closestItem.classList.add("selected-winner");
    }

    // Use the item that's actually centered - that's what the user landed on
    if (closestIndex >= 0 && closestIndex < this.spinnerItems.length) {
      const actualItem = this.spinnerItems[closestIndex];

      // Show result after a longer delay to see the selection clearly
      setTimeout(() => {
        App.showResult(actualItem);
      }, 1500);
    } else {
      // Fallback to the stored selected item if something went wrong
      setTimeout(() => {
        App.showResult(this.selectedItem);
      }, 1500);
    }
  },

  // Reset spinner
  reset() {
    this.isSpinning = false;
    this.currentPosition = 0;
    this.velocity = 0;
    this.selectedItem = null;
    this.spinnerItems = [];

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
