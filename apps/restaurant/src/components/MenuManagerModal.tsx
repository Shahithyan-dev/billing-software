import React, { useState } from 'react';
import { Save, Plus, Trash2, Edit2, Pencil, X, Image as ImageIcon, CheckCircle, Barcode } from 'lucide-react';
import { MenuItem } from '../app/(dashboard)/pos/StandardPOS';
import { API_BASE_URL } from '@/config/api';

interface MenuManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onSave: (items: MenuItem[]) => void;
}

export const MenuManagerModal: React.FC<MenuManagerModalProps> = ({ isOpen, onClose, menuItems, onSave }) => {
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  if (!isOpen) return null;

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      const itemToSave = { ...editingItem, price: Number(editingItem.price) || 0 };
      if (items.some(i => i.id === itemToSave.id)) {
        // Update existing
        setItems(items.map(i => i.id === itemToSave.id ? itemToSave : i));
      } else {
        // Add new
        setItems([...items, itemToSave]);
      }
      setEditingItem(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const handleApplyChanges = () => {
    onSave(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e3e3df] flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-black text-[#2c332c]">Menu Manager</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* List Section */}
          <div className="flex-1 flex flex-col border-r border-[#e3e3df]">
            <div className="p-4 border-b border-[#e3e3df] flex justify-between items-center bg-white">
               <h3 className="font-bold text-[#2c332c]">Current Items ({items.length})</h3>
               <button 
                 onClick={() => setEditingItem({ id: Date.now().toString(), name: '', price: 0, category: '', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop', type: 'veg' })}
                 className="flex items-center gap-2 bg-[#4a7b47] text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-[#3d663b] transition-colors"
               >
                 <Plus className="w-4 h-4" /> Add New
               </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {items.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-xl border border-[#e3e3df] flex items-center gap-4 shadow-sm hover:border-[#4a7b47] transition-colors">
                  <img src={item.img} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#2c332c]">{item.name}</h4>
                      <div className={`w-2 h-2 rounded-full ${item.type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{item.category} • ₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingItem(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit/Add Section */}
          <div className="w-full md:w-96 bg-white flex flex-col">
            {editingItem ? (
              <form onSubmit={handleSaveItem} className="p-6 flex flex-col h-full overflow-y-auto">
                <h3 className="font-bold text-lg text-[#2c332c] mb-6 border-b border-[#e3e3df] pb-4">
                  {items.some(i => i.id === editingItem.id) ? 'Edit Item' : 'Add New Item'}
                </h3>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Item Name</label>
                    <input 
                      type="text" 
                      required
                      value={editingItem.name}
                      onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                      className="w-full border border-[#e3e3df] px-3 py-2.5 rounded-xl text-sm font-medium focus:border-[#4a7b47] focus:outline-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Price (₹)</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        value={editingItem.price === 0 && editingItem.name === '' ? '' : editingItem.price}
                        onChange={e => {
                          const val = e.target.value;
                          setEditingItem({...editingItem, price: val === '' ? '' : parseFloat(val)} as any);
                        }}
                        className="w-full border border-[#e3e3df] px-3 py-2.5 rounded-xl text-sm font-medium focus:border-[#4a7b47] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Type</label>
                      <select 
                        value={editingItem.type}
                        onChange={e => setEditingItem({...editingItem, type: e.target.value as 'veg' | 'non-veg'})}
                        className="w-full border border-[#e3e3df] px-3 py-2.5 rounded-xl text-sm font-medium focus:border-[#4a7b47] focus:outline-none"
                      >
                        <option value="veg">Veg</option>
                        <option value="non-veg">Non-Veg</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Category</label>
                    <select
                      required
                      value={editingItem.category}
                      onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                      className="w-full border border-[#e3e3df] px-3 py-2.5 rounded-xl text-sm font-medium focus:border-[#4a7b47] focus:outline-none bg-white"
                    >
                      <option value="" disabled>Select a category</option>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Beverages">Beverages</option>
                      <option value="All Day">All Day</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Image URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        required
                        value={editingItem.img}
                        onChange={e => setEditingItem({...editingItem, img: e.target.value})}
                        className="w-full border border-[#e3e3df] pl-9 pr-3 py-2.5 rounded-xl text-sm font-medium focus:border-[#4a7b47] focus:outline-none"
                        placeholder="Image URL or path (e.g. /food.png)"
                      />
                    </div>
                  </div>
                  
                  {editingItem.img && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-[#e3e3df] h-32 bg-gray-100 flex items-center justify-center">
                       <img 
                         src={editingItem.img} 
                         alt="Preview" 
                         className="w-full h-full object-cover" 
                         onError={(e) => {
                           const target = e.currentTarget as HTMLImageElement;
                           if (!target.src.includes('placehold.co')) {
                             target.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image';
                           }
                         }} 
                       />
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#4a7b47] text-white font-bold rounded-xl text-sm hover:bg-[#3d663b] transition-colors">
                    Save Item
                  </button>
                </div>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 bg-gray-50/50">
                <Pencil className="w-12 h-12 mb-4 text-gray-300" />
                <p className="font-bold text-[#2c332c] mb-1">Select an item</p>
                <p className="text-sm">Click the edit button on an item in the list to modify it, or click Add New.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#e3e3df] bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button onClick={handleApplyChanges} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#4a7b47] text-white hover:bg-[#3d663b] shadow-md transition-colors">
            Apply Changes to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
