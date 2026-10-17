import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Compass, Package, Leaf } from "lucide-react";
import { catalog, categoryList } from "@/server/services/catalog";
import { ProductGrid } from "@/components/product-grid";
export const dynamic = "force-dynamic";
export default async function HomePage() {
  const [products, categories] = await Promise.all([catalog(), categoryList()]);
  return (
    <>
      <section className="hero">
        <Image
          src="/images/hero.jpg"
          alt="Sunlight falling across a quiet alpine mountain range"
          fill
          priority
          sizes="100vw"
          className="hero-image"
        />
        <div className="hero-shade" />
        <div className="container hero-content">
          <div className="eyebrow light">
            <span className="tiny-line" /> THE EVERYDAY COLLECTION — VOL. 01
          </div>
          <h1>
            Good things.
            <br />
            For everyday.
          </h1>
          <p>
            Thoughtful essentials for wherever
            <br className="desktop-break" /> your day takes you.
          </p>
          <Link href="/shop" className="button button-orange">
            Find your everyday <ArrowUpRight size={19} />
          </Link>
          <div className="hero-note">
            <span className="small-star">✳</span>
            <span>
              Less, but better.
              <br />
              That’s the Fieldwork way.
            </span>
          </div>
        </div>
        <div className="hero-bottom">
          <span>FOR THE DAILY. AND THE DAYS AWAY.</span>
          <span>SCROLL TO EXPLORE ↓</span>
        </div>
      </section>
      <section className="values-strip container" aria-label="Our approach">
        <div>
          <Compass size={22} />
          <span>Built around your everyday</span>
        </div>
        <div>
          <Package size={22} />
          <span>A carefully curated collection</span>
        </div>
        <div>
          <Leaf size={22} />
          <span>Fewer things. More meaning.</span>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">01 / THE COLLECTION</div>
            <h2>A place for every part of your day.</h2>
          </div>
          <Link className="text-link" href="/shop">
            Explore everything <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((c, i) => (
            <Link
              className="category-card"
              href={`/shop?category=${c.slug}`}
              key={c.slug}
            >
              <div className="category-photo">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width: 600px) 50vw, 25vw"
                />
                <span className="category-index">0{i + 1}</span>
              </div>
              <div className="category-caption">
                <div>
                  <h3>{c.name}</h3>
                  <span>
                    {products.filter((p) => p.category === c.slug).length}{" "}
                    considered essentials
                  </span>
                </div>
                <ArrowUpRight size={22} />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="section container favorites-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">02 / GOOD COMPANY</div>
            <h2>Your new everyday favorites.</h2>
          </div>
          <Link className="text-link" href="/shop">
            Shop the collection <ArrowUpRight size={18} />
          </Link>
        </div>
        <ProductGrid
          products={products.filter((p) => p.featured).slice(0, 4)}
        />
      </section>
      <section className="story-section container">
        <div className="story-image">
          <Image
            src="/images/journal.jpg"
            alt="A quiet forest landscape inviting a slower pace"
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
          />
          <span className="story-image-note">
            A little room for the good things.
          </span>
        </div>
        <div className="story-copy">
          <span className="eyebrow">A NOTE FROM FIELDWORK</span>
          <h2>
            Buy with thought.
            <br />
            Keep with care.
            <br />
            <em>Go live a little.</em>
          </h2>
          <p>
            We believe the best things in life are the ones you actually use.
            The bag by the door. The shoes you always reach for. The small
            details that make every day feel a bit more yours.
          </p>
          <Link href="/about" className="text-link">
            Meet Fieldwork <ArrowRight size={18} />
          </Link>
          <span className="story-mark" aria-hidden="true">
            f.
          </span>
        </div>
      </section>
      <section className="closing-note container">
        <span className="small-star">✳</span>
        <h2>Make a little space for better.</h2>
        <Link href="/shop" className="button button-dark">
          Explore the collection <ArrowUpRight size={18} />
        </Link>
      </section>
    </>
  );
}
