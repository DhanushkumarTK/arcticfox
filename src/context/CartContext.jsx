import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('arcticfox-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('arcticfox-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = (product, size, color, customization = null) => {
    setCartItems(prev => {
      const existing = prev.find(
        item => item.id === product.id && 
                item.size === size && 
                item.color === color &&
                (!item.customization && !customization || item.customization?.image === customization?.image)
      );
      if (existing) {
        showToast(`Updated quantity for ${product.name}`);
        return prev.map(item =>
          item.id === product.id && 
          item.size === size && 
          item.color === color &&
          (!item.customization && !customization || item.customization?.image === customization?.image)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      showToast(customization ? `Customized ${product.name} added!` : `${product.name} added to bag!`);
      
      const itemPrice = customization ? product.price + 250 : product.price;
      const itemOriginalPrice = customization ? product.originalPrice + 250 : product.originalPrice;
      const itemImage = customization ? customization.image : product.image;

      return [...prev, {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: itemImage,
        price: itemPrice,
        originalPrice: itemOriginalPrice,
        fit: product.fit,
        size,
        color,
        quantity: 1,
        customization // stores { image, name }
      }];
    });
  };

  const removeFromCart = (id, size, color, isCustomized = false, customImage = null) => {
    setCartItems(prev => prev.filter(
      item => !(
        item.id === id && 
        item.size === size && 
        item.color === color &&
        (!item.customization && !isCustomized || item.customization?.image === customImage)
      )
    ));
  };

  const updateQuantity = (id, size, color, quantity, isCustomized = false, customImage = null) => {
    if (quantity < 1) {
      removeFromCart(id, size, color, isCustomized, customImage);
      return;
    }
    setCartItems(prev => prev.map(item =>
      item.id === id && 
      item.size === size && 
      item.color === color &&
      (!item.customization && !isCustomized || item.customization?.image === customImage)
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartOriginalTotal = cartItems.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const cartSavings = cartOriginalTotal - cartTotal;

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, cartTotal, cartOriginalTotal, cartSavings, toast,
    }}>
      {children}
    </CartContext.Provider>
  );
}
