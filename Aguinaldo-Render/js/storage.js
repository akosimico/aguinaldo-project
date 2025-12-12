// storage.js - LocalStorage Management
const Storage = {
  ITEMS_KEY: "aguinaldo_items",

  // Get items from localStorage
  getItems() {
    try {
      const items = localStorage.getItem(this.ITEMS_KEY);
      return items ? JSON.parse(items) : this.getDefaultItems();
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return this.getDefaultItems();
    }
  },

  // Save items to localStorage
  saveItems(items) {
    try {
      localStorage.setItem(this.ITEMS_KEY, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return false;
    }
  },

  // Get default items
  getDefaultItems() {
    // Default item pool
    const pool = [
      { value: "₱20", weight: 65, rarity: "common" },
      { value: "₱50", weight: 54, rarity: "common" },
      { value: "₱100", weight: 43, rarity: "uncommon" },
      { value: "₱200", weight: 32, rarity: "uncommon" },
      { value: "₱500", weight: 3, rarity: "rare" },
      { value: "₱1,000", weight: 3, rarity: "rare" },
    ];
    // Limit rare items to 2-5 times
    const minRare = 2;
    const maxRare = 5;
    const rareCount = Math.floor(Math.random() * (maxRare - minRare + 1)) + minRare;
    const rareItems = pool.filter(item => item.rarity === 'rare');
    const nonRareItems = pool.filter(item => item.rarity !== 'rare');
    const shuffledRare = rareItems.sort(() => Math.random() - 0.5).slice(0, rareCount);
    const finalItems = [...nonRareItems, ...shuffledRare].sort(() => Math.random() - 0.5);
    return finalItems.map(item => ({
      ...item,
      id: this.generateId(),
    }));
  },

  // Reset to default items
  resetToDefault() {
    const defaultItems = this.getDefaultItems();
    this.saveItems(defaultItems);
    return defaultItems;
  },

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Clear all data
  clearAll() {
    try {
      localStorage.removeItem(this.ITEMS_KEY);
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  },
};
