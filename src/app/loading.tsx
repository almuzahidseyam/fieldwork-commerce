export default function Loading() {
  return (
    <div
      className="container skeleton-page"
      role="status"
      aria-label="Loading the collection"
    >
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-subtitle" />
      <div className="product-grid">
        {[1, 2, 3, 4].map((n) => (
          <div key={n}>
            <div className="skeleton skeleton-product" />
            <div className="skeleton skeleton-subtitle" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading the collection…</span>
    </div>
  );
}
