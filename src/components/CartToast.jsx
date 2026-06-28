import { useCart } from '../context/CartContext';

export default function CartToast() {
  const { toast } = useCart();

  if (!toast) return null;

  return (
    <div className="cart-toast" id="cart-toast">
      <span className="cart-toast-icon">🛍️</span>
      <span>{toast}</span>
    </div>
  );
}
