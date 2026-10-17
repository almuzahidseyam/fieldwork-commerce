import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
export const metadata = { title: "About Fieldwork" };
export default function AboutPage() {
  return (
    <div className="container about-page">
      <span className="eyebrow">THE FIELDWORK WAY</span>
      <h1>Less, but better.</h1>
      <div className="about-layout">
        <div className="about-photo">
          <Image
            src="/images/journal.jpg"
            alt="A quiet forest clearing"
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
          />
        </div>
        <div>
          <h2>
            Good things for the life
            <br />
            you actually live.
          </h2>
          <p>
            Fieldwork is a demonstration of a more considered kind of store. A
            small collection, easy to explore. Useful things, clearly described.
            Your favorites, right where you left them.
          </p>
          <p>
            Carry, wear, home, and tech. Four parts of the everyday, brought
            together in one uncomplicated place.
          </p>
          <p className="demo-note">
            This portfolio store uses sample products. It does not accept orders
            or payments. Product photographs are illustrative.
          </p>
          <Link href="/shop" className="button button-dark">
            Meet the collection <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
