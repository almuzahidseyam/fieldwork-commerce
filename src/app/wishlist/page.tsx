import { WishlistView } from "@/components/wishlist-view";
export const metadata = { title: "Your saved things" };
export default function WishlistPage() {
  return (
    <div className="container utility-page">
      <WishlistView />
    </div>
  );
}
