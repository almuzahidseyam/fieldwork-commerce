import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export default function NotFound() {
  return (
    <div className="container empty-state not-found">
      <span className="eyebrow">404 / A SMALL DETOUR</span>
      <h1>A little off the beaten path.</h1>
      <p>
        That page may have moved, or that essential isn’t part of the
        collection.
      </p>
      <Link href="/shop" className="button button-dark">
        Back to the good things <ArrowUpRight size={18} />
      </Link>
    </div>
  );
}
