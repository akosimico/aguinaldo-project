// storage.js - LocalStorage Management
const Storage = {
    ITEMS_KEY: 'aguinaldo_items',
    
    // Get items from localStorage
    getItems() {
        try {
            const items = localStorage.getItem(this.ITEMS_KEY);
            return items ? JSON.parse(items) : this.getDefaultItems();
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return this.getDefaultItems();
        }
    },
    
    // Save items to localStorage
    saveItems(items) {
        try {
            localStorage.setItem(this.ITEMS_KEY, JSON.stringify(items));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },
    
    // Get default items
    getDefaultItems() {
        return [
            {
                id: this.generateId(),
                value: '₱20',
                weight: 65,
                rarity: 'common'
            },
            {
                id: this.generateId(),
                value: '₱50',
                weight: 54,
                rarity: 'common'
            },
            {
                id: this.generateId(),
                value: '₱100',
                weight: 43,
                rarity: 'uncommon'
            },
            {
                id: this.generateId(),
                value: '₱200',
                weight: 32,
                rarity: 'uncommon'
            },
            {
                id: this.generateId(),
                value: '₱500',
                weight: 3,
                rarity: 'rare'
            }
            ,{
                id: this.generateId(),
                value: '₱1,000',
                weight: 3,
                rarity: 'rare'
            }
        ];
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
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};
