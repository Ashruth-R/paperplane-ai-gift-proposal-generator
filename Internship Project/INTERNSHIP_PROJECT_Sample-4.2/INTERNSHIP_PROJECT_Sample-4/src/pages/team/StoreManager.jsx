import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Package, Layers, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { productCategories } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function StoreManager() {
  const { products, addProduct, deleteProduct, updateProduct, showToast, orderedItems } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means "Add Product"
  
  // Form fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [minQty, setMinQty] = useState('');
  const [category, setCategory] = useState('Stationery');
  const [emoji, setEmoji] = useState('🎁');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [inStock, setInStock] = useState(true);

  // Filtered products list
  const filtered = useMemo(() => {
    return (products || []).filter(p => {
      const catOk = activeCategory === 'All' || p.category === activeCategory;
      const searchOk = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      return catOk && searchOk;
    });
  }, [products, activeCategory, search]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setMinQty('');
    setCategory('Stationery');
    setEmoji('🎁');
    setDescription('');
    setTagsInput('Executive, Premium');
    setInStock(true);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setMinQty(product.minQty.toString());
    setCategory(product.category);
    setEmoji(product.emoji || '🎁');
    setDescription(product.description || '');
    setTagsInput(product.tags ? product.tags.join(', ') : '');
    setInStock(product.inStock);
    setModalOpen(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the store catalog?`)) {
      deleteProduct(id);
      showToast(`Deleted "${name}" successfully.`, 'error');
    }
  };

  const handleToggleStock = (product) => {
    const updated = { ...product, inStock: !product.inStock };
    updateProduct(updated);
    showToast(`"${product.name}" is now ${updated.inStock ? 'In Stock' : 'Out of Stock'}.`, 'success');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Product name is required.', 'error');
      return;
    }
    const parsedPrice = parseFloat(price);
    const parsedMinQty = parseInt(minQty);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showToast('Please enter a valid price.', 'error');
      return;
    }
    if (isNaN(parsedMinQty) || parsedMinQty <= 0) {
      showToast('Please enter a valid minimum order quantity.', 'error');
      return;
    }

    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);

    if (editingProduct) {
      // Edit mode
      const updated = {
        ...editingProduct,
        name,
        price: parsedPrice,
        minQty: parsedMinQty,
        category,
        emoji,
        description,
        tags: tagsArray,
        inStock
      };
      updateProduct(updated);
      showToast(`Updated "${name}" successfully!`, 'success');
    } else {
      // Add mode
      const newProduct = {
        id: 'P' + (100 + (products || []).length + 1), // generate simple ID
        name,
        price: parsedPrice,
        minQty: parsedMinQty,
        category,
        emoji,
        description,
        tags: tagsArray,
        inStock,
        bgColor: 'from-brand-900/40 to-indigo-800/20' // default premium background
      };
      addProduct(newProduct);
      showToast(`Added "${name}" to store catalog!`, 'success');
    }
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Manage Gift Store</h1>
          <p className="text-surface-400 text-sm mt-1">Add, update, or remove products from the corporate gifting marketplace</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-[14px] text-sm font-semibold shadow-lg hover:shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 border border-white/10"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex items-center gap-3 flex-1 bg-[#ffffff] border border-[#000000] rounded-[20px] px-5 py-3 focus-within:border-brand-500 hover:border-slate-800 transition-all duration-350">
          <Search className="w-4.5 h-4.5 text-slate-500 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search catalog products..."
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-450 outline-none"
          />
          {search && <X className="w-4 h-4 text-slate-500 hover:text-slate-800 cursor-pointer transition-colors" onClick={() => setSearch('')} />}
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {productCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2.5 rounded-[16px] text-xs font-semibold border whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-brand-600 text-[#ffffff] border-brand-500/30 shadow-md'
                  : 'bg-[#ffffff] text-slate-600 border-[#000000] hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products list table */}
      <div className="bg-[#ffffff] border border-[#000000] rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-5">Product Info</th>
                <th className="p-5">Category</th>
                <th className="p-5">Price per unit</th>
                <th className="p-5">Min Order</th>
                <th className="p-5 text-center">Stock Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl relative select-none">
                        <div className="absolute w-8 h-8 rounded-full bg-brand-500/10 blur-sm pointer-events-none" />
                        <span className="z-10">{product.emoji || '🎁'}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate">{product.name}</h4>
                        <p className="text-xs text-slate-600 truncate mt-0.5 max-w-xs">{product.description}</p>
                        {(() => {
                          const ratings = (orderedItems || []).filter(item => item.productId === product.id && item.rating > 0).map(i => i.rating);
                          const avg = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
                          return (
                            <div className="flex items-center gap-1 mt-1.5">
                              <Star className={`w-3.5 h-3.5 ${avg > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                              <span className="text-[10px] font-bold text-slate-500">
                                {avg > 0 ? `${avg} (${ratings.length} reviews)` : 'No ratings yet'}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="text-xs bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-full font-semibold">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-5 font-bold text-slate-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="p-5 font-semibold text-slate-700">
                    {product.minQty} Units
                  </td>
                  <td className="p-5 text-center">
                    <button
                      onClick={() => handleToggleStock(product)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                        product.inStock
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                    </button>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-brand-50 hover:border-brand-200 transition-all"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition-all"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package className="w-12 h-12 text-slate-400 animate-pulse" />
            <p className="text-slate-600 font-medium">No products found</p>
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product Details' : 'Add New Catalog Product'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Emoji Icon</label>
              <input
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                placeholder="🎁"
                className="w-full bg-[#ffffff] border border-[#000000] rounded-xl px-4 py-2.5 text-center text-2xl outline-none focus:border-brand-500/50 text-slate-800 placeholder-slate-450"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Product Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Leather Notebook Set"
                className="w-full bg-[#ffffff] border border-[#000000] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-450 outline-none focus:border-brand-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Price (INR)</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full bg-[#ffffff] border border-[#000000] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-450 outline-none focus:border-brand-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Min Order Units</label>
              <input
                type="number"
                value={minQty}
                onChange={e => setMinQty(e.target.value)}
                placeholder="e.g. 50"
                className="w-full bg-[#ffffff] border border-[#000000] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-450 outline-none focus:border-brand-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#ffffff] border border-[#000000] rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-500/50"
              >
                {productCategories.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat} className="text-slate-800 bg-[#ffffff]">{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Stock Availability</label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    checked={inStock}
                    onChange={() => setInStock(true)}
                    className="accent-brand-500"
                  />
                  <span className="text-xs text-emerald-700 font-semibold">In Stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    checked={!inStock}
                    onChange={() => setInStock(false)}
                    className="accent-rose-500"
                  />
                  <span className="text-xs text-rose-700 font-semibold">Out of Stock</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Feature Tags (comma separated)</label>
            <input
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="Executive, Premium, Tech"
              className="w-full bg-[#ffffff] border border-[#000000] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-450 outline-none focus:border-brand-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Short Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief details about customization or design..."
              className="w-full bg-[#ffffff] border border-[#000000] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-450 outline-none focus:border-brand-500/50 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.04]">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="success" type="submit">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
