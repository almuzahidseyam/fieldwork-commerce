"use client";
import { LoaderCircle, WifiOff } from "lucide-react";
import { useStore } from "./store-provider";
export function SessionState() {
  const store = useStore();
  return store.loading ? (
    <div className="empty-state" role="status">
      <LoaderCircle size={30} className="spin" />
      <p>Getting your everyday essentials ready…</p>
    </div>
  ) : (
    <div className="empty-state" role="alert">
      <WifiOff size={34} />
      <h2>A little connection trouble.</h2>
      <p>{store.error || "Please reconnect to load your saved items."}</p>
      <button
        className="button button-dark"
        onClick={() => void store.refresh()}
      >
        Try again
      </button>
    </div>
  );
}
