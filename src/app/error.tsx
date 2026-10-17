"use client";
import { WifiOff } from "lucide-react";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container empty-state not-found" role="alert">
      <WifiOff size={38} />
      <h1>We hit a little pause.</h1>
      <p>
        We couldn’t load the collection right now. Give it a moment and try
        again.
      </p>
      <button className="button button-dark" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
