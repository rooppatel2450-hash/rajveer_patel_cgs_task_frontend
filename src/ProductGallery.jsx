import { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductGallery.css';
//test

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
const ProductGallery = ({ token, onLogout }) => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartError, setCartError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const loadCart = async () => {
    try {
      setCartLoading(true);
      setCartError('');
      const response = await axios.get(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(response.data);
    } catch {
      setCartError('Could not load cart');
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/products`);
        setProducts(response.data);
        setError(null);
      } catch {
        setError('Could not load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!token) {
      setCartItems([]);
      setCartError('');
      return;
    }

    const fetchUserCart = async () => {
      try {
        setCartLoading(true);
        setCartError('');
        const response = await axios.get(`${API_BASE}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCartItems(response.data);
      } catch {
        setCartError('Could not load cart');
      } finally {
        setCartLoading(false);
      }
    };

    fetchUserCart();
  }, [token]);

  const handleAddToCart = async (productId) => {
    if (!token) {
      setActionMessage('Please login first.');
      return;
    }

    try {
      setActionMessage('');
      await axios.post(
        `${API_BASE}/api/cart`,
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionMessage('Item added to cart.');
      loadCart();
    } catch {
      setActionMessage('Could not add item');
    }
  };

  const handleCheckout = async () => {
    if (!token) {
      setActionMessage('Please login first.');
      return;
    }

    try {
      setCheckoutLoading(true);
      setActionMessage('');
      await axios.post(
        `${API_BASE}/api/checkout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionMessage('Checkout successful. Your order has been placed.');
      loadCart();
    } catch {
      setActionMessage('Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  return (
    <div className="product-gallery-container">
      <div className="product-gallery-header">
        <div className="gallery-title-row">
          <h1 className="text-3xl font-bold text-center mb-6">Product Gallery</h1>
          <button type="button" className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>

        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <svg
            className="search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="text-lg">Loading products...</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-container">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!loading && filteredProducts.length > 0 && (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                <img
                  src={product.image_url || product.image}
                  alt={product.name}
                  className="product-image"
                />
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">${Number(product.price).toFixed(2)}</p>
                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product.id)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {actionMessage && <p className="action-message">{actionMessage}</p>}

      <div className="cart-section">
        <h2 className="cart-title">My Cart</h2>
        {cartLoading && <p className="cart-meta">Loading cart...</p>}
        {cartError && <p className="cart-error">{cartError}</p>}
        {!cartLoading && !cartError && cartItems.length === 0 && (
          <p className="cart-meta">No items in cart yet.</p>
        )}

        {!cartLoading && cartItems.length > 0 && (
          <div className="cart-list">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-row">
                <span className="cart-name">{item.name}</span>
                <span className="cart-qty">Qty: {item.quantity}</span>
                <span className="cart-price">${Number(item.price).toFixed(2)}</span>
              </div>
            ))}
            <div className="cart-total">Total: ${cartTotal.toFixed(2)}</div>
            <button
              type="button"
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? 'Checking out...' : 'Checkout'}
            </button>
          </div>
        )}
      </div>

      {!loading && filteredProducts.length === 0 && (
        <div className="no-results-container">
          <p className="text-xl text-gray-500">
            No products found matching "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;


