import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../services/productService';
import { getAllCategories } from '../services/categoryService';
import Toast from '../components/Toast';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateProduct = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        productName: '',
        sku: '',
        category: '',
        description: '',
        costPrice: '',
        sellingPrice: '',
        minimumStockLevel: 10,
        isActive: true,
        productImage: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        getAllCategories(1, 100)
            .then(d => setCategories(d.categories?.filter(c => c.isActive) || []))
            .catch(() => { });
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file type
            if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
                setToast({ type: 'error', message: 'Only JPEG, PNG, and WebP images are allowed' });
                return;
            }
            // Check file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setToast({ type: 'error', message: 'Image size must be less than 5MB' });
                return;
            }
            setFormData(prev => ({ ...prev, productImage: file }));
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, productImage: null }));
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Create FormData for multipart/form-data
            const submitData = new FormData();
            submitData.append('productName', formData.productName);
            submitData.append('sku', formData.sku);
            submitData.append('category', formData.category);
            submitData.append('description', formData.description);
            submitData.append('costPrice', Number(formData.costPrice));
            submitData.append('sellingPrice', Number(formData.sellingPrice));
            submitData.append('minimumStockLevel', Number(formData.minimumStockLevel));
            submitData.append('isActive', formData.isActive);
            if (formData.productImage) {
                submitData.append('productImage', formData.productImage);
            }

            await createProduct(submitData);
            setToast({ type: 'success', message: 'Product created successfully' });
            setTimeout(() => navigate('/admin/products'), 1000);
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.message || 'Failed to create product' });
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/products" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
                    <p className="text-gray-500 text-sm">Stock starts at 0 — use Stock In to add initial stock</p>
                </div>
            </div>

            <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                            <input type="text" name="productName" required
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={formData.productName} onChange={handleChange} placeholder="e.g. Rice 5kg" />
                        </div>

                        {/* Image Upload Section */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Product Image</label>
                            {imagePreview ? (
                                <div className="relative w-full bg-gray-50 rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                {formData.productImage?.name || 'Image selected'}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-3">
                                                Size: {formData.productImage?.size ? (formData.productImage.size / 1024).toFixed(2) : 0} KB
                                            </p>
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                                            >
                                                <X className="w-4 h-4" />
                                                Remove Image
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-500">JPEG, PNG or WebP (Max 5MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/webp,image/jpg"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                            <input type="text" name="sku"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                                value={formData.sku} onChange={handleChange} placeholder="Auto-generated if blank" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select name="category" required
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={formData.category} onChange={handleChange}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.categoryName}</option>)}
                            </select>
                            {categories.length === 0 && (
                                <p className="text-xs text-orange-600 mt-1">No categories found. <Link to="/admin/categories/create" className="underline">Create one first</Link>.</p>
                            )}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea name="description" rows={2}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                value={formData.description} onChange={handleChange} placeholder="Optional description..." />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (LKR) *</label>
                            <input type="number" name="costPrice" required min="0" step="0.01"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={formData.costPrice} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (LKR) *</label>
                            <input type="number" name="sellingPrice" required min="0" step="0.01"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={formData.sellingPrice} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min. Stock Warning Level</label>
                            <input type="number" name="minimumStockLevel" min="0"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={formData.minimumStockLevel} onChange={handleChange} />
                        </div>

                        <div className="flex items-center gap-3 pt-6">
                            <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4" />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active Product</label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-3">
                        <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" disabled={loading}
                            className={`flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            <Save className="w-5 h-5" />
                            <span>{loading ? 'Creating...' : 'Create Product'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProduct;
