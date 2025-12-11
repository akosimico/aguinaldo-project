// items.js - Item Management
const ItemManager = {
    items: [],
    
    // Initialize items
    init() {
        this.items = Storage.getItems();
        this.renderItemsList();
    },
    
    // Add new item
    addItem(value, weight, rarity) {
        // Validation
        if (!value || !value.trim()) {
            return { success: false, message: 'Value is required' };
        }
        
        if (!weight || weight < 1 || weight > 100) {
            return { success: false, message: 'Weight must be between 1 and 100' };
        }
        
        const newItem = {
            id: Storage.generateId(),
            value: value.trim(),
            weight: parseInt(weight),
            rarity: rarity || 'common'
        };
        
        this.items.push(newItem);
        Storage.saveItems(this.items);
        this.renderItemsList();
        
        return { success: true, message: 'Item added successfully' };
    },
    
    // Edit item
    editItem(id, value, weight, rarity) {
        const itemIndex = this.items.findIndex(item => item.id === id);
        
        if (itemIndex === -1) {
            return { success: false, message: 'Item not found' };
        }
        
        if (!value || !value.trim()) {
            return { success: false, message: 'Value is required' };
        }
        
        if (!weight || weight < 1 || weight > 100) {
            return { success: false, message: 'Weight must be between 1 and 100' };
        }
        
        this.items[itemIndex] = {
            ...this.items[itemIndex],
            value: value.trim(),
            weight: parseInt(weight),
            rarity: rarity || 'common'
        };
        
        Storage.saveItems(this.items);
        this.renderItemsList();
        
        return { success: true, message: 'Item updated successfully' };
    },
    
    // Delete item
    deleteItem(id) {
        const itemIndex = this.items.findIndex(item => item.id === id);
        
        if (itemIndex === -1) {
            return { success: false, message: 'Item not found' };
        }
        
        if (this.items.length === 1) {
            return { success: false, message: 'Cannot delete the last item' };
        }
        
        this.items.splice(itemIndex, 1);
        Storage.saveItems(this.items);
        this.renderItemsList();
        
        return { success: true, message: 'Item deleted successfully' };
    },
    
    // Reset to default
    resetToDefault() {
        this.items = Storage.resetToDefault();
        this.renderItemsList();
        return { success: true, message: 'Items reset to default' };
    },
    
    // Get all items
    getAllItems() {
        return this.items;
    },
    
    // Get rarity color class
    getRarityClass(rarity) {
        const rarityClasses = {
            'common': 'bg-green-100 text-green-800',
            'uncommon': 'bg-orange-100 text-orange-800',
            'rare': 'bg-purple-100 text-purple-800'
        };
        return rarityClasses[rarity] || rarityClasses['common'];
    },
    
    // Render items list in settings modal
    renderItemsList() {
        const itemsList = document.getElementById('itemsList');
        
        if (!itemsList) return;
        
        if (this.items.length === 0) {
            itemsList.innerHTML = '<p class="text-gray-500 text-center py-4">No items available</p>';
            return;
        }
        
        // Calculate total weight for percentage display
        const totalWeight = this.items.reduce((sum, item) => sum + item.weight, 0);
        
        itemsList.innerHTML = this.items.map(item => {
            const percentage = totalWeight > 0 ? ((item.weight / totalWeight) * 100).toFixed(1) : 0;
            
            return `
                <div class="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="font-bold text-lg text-gray-800">${item.value}</span>
                                <span class="rarity-badge ${this.getRarityClass(item.rarity)}">${item.rarity}</span>
                            </div>
                            <div class="text-sm text-gray-600">
                                Weight: ${item.weight} (${percentage}% chance)
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="ItemManager.handleEdit('${item.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                            </button>
                            <button onclick="ItemManager.handleDelete('${item.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Handle edit button click
    handleEdit(id) {
        const item = this.items.find(i => i.id === id);
        if (!item) return;
        
        // Populate form with item data
        document.getElementById('newItemValue').value = item.value;
        document.getElementById('newItemWeight').value = item.weight;
        document.getElementById('newItemRarity').value = item.rarity;
        
        // Change button text and store edit mode
        const addBtn = document.getElementById('addItemBtn');
        addBtn.textContent = '✓ Update Item';
        addBtn.dataset.editId = id;
        
        // Scroll to form
        document.querySelector('.bg-gray-50').scrollIntoView({ behavior: 'smooth' });
    },
    
    // Handle delete button click
    handleDelete(id) {
        const item = this.items.find(i => i.id === id);
        if (!item) return;
        
        App.showConfirm(
            'Delete Item',
            `Are you sure you want to delete "${item.value}"?`,
            () => {
                const result = this.deleteItem(id);
                if (result.success) {
                    App.showToast(result.message);
                    this.renderItemsList();
                } else {
                    App.showToast(result.message);
                }
            }
        );
    },
    
    // Get total weight
    getTotalWeight() {
        return this.items.reduce((sum, item) => sum + item.weight, 0);
    }
};