import { Search, SlidersHorizontal, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Category, ProductFilters } from "@/types/commerce";
export function ShopFilters({
  categories,
  filters,
}: {
  categories: Category[];
  filters: ProductFilters;
}) {
  return (
    <form action="/shop" className="filter-form">
      <div className="search-field">
        <Search size={19} />
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <input
          id="product-search"
          name="search"
          placeholder="Find your next everyday favorite…"
          defaultValue={filters.search}
        />
        <button aria-label="Search">
          <ArrowRight size={20} />
        </button>
      </div>
      <div className="filter-controls">
        <span className="filter-label">
          <SlidersHorizontal size={16} /> Refine by
        </span>
        <label>
          <span className="sr-only">Category</span>
          <select name="category" defaultValue={filters.category || ""}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Maximum price</span>
          <select name="maxPrice" defaultValue={filters.maxPrice ?? ""}>
            <option value="">Any price</option>
            <option value="5000">Up to $50</option>
            <option value="10000">Up to $100</option>
            <option value="15000">Up to $150</option>
            <option value="25000">Up to $250</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Sort products</span>
          <select name="sort" defaultValue={filters.sort || "featured"}>
            <option value="featured">Featured first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="inStock"
            value="true"
            defaultChecked={filters.inStock}
          />{" "}
          In stock
        </label>
        <button className="button button-small button-dark" type="submit">
          Apply
        </button>
        <Link href="/shop" className="reset-link">
          Reset
        </Link>
      </div>
    </form>
  );
}
