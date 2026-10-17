import { CartView } from "@/components/cart-view";
export const metadata = { title: "Your bag" };
export default function CartPage() {
  return (
    <div className="container utility-page">
      <CartView />
    </div>
  );
}
