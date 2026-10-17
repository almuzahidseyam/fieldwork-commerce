"use client";
import { useEffect, useState, type FormEvent } from "react";
import { UserRound, ArrowUpRight, LoaderCircle } from "lucide-react";
import { useStore } from "./store-provider";
import { SessionState } from "./session-state";
export function AccountView() {
  const store = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setName(store.profile?.name || "");
    setEmail(store.profile?.email || "");
  }, [store.profile]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await store.saveProfile({ name, email });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function erase() {
    setBusy(true);
    setError("");
    try {
      await store.eraseProfile();
      setConfirmDelete(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!store.ready) return <SessionState />;
  return (
    <div className="account-layout">
      <div className="account-intro">
        <span className="eyebrow">YOUR CORNER OF FIELDWORK</span>
        <h1>
          Make yourself
          <br />
          at home.
        </h1>
        <p>A familiar place for your everyday favorites.</p>
        <div className="guest-note">
          <UserRound size={24} />
          <div>
            <strong>Your guest profile</strong>
            <p>
              Saved for this browser for up to 30 days. This is a guest session,
              so your details won’t sign you in on other devices.
            </p>
          </div>
        </div>
      </div>
      <div className="account-panel">
        <h2>The basics.</h2>
        <p>
          Add a name and email to your guest profile. Please use sample details
          when trying this demo.
        </p>
        <form onSubmit={submit}>
          <label htmlFor="profile-name">Your name</label>
          <input
            id="profile-name"
            name="name"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Morgan"
          />
          <label htmlFor="profile-email">Email address</label>
          <input
            id="profile-email"
            name="email"
            required
            type="email"
            maxLength={254}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
          />
          {error && (
            <p className="inline-error" role="alert">
              {error}
            </p>
          )}
          <button className="button button-dark full-width" disabled={busy}>
            {busy ? (
              <LoaderCircle size={17} className="spin" />
            ) : (
              <>
                Save your details <ArrowUpRight size={18} />
              </>
            )}
          </button>
        </form>
        <div className="delete-profile">
          <h3>A fresh start?</h3>
          <p>Delete this profile, your bag, and your saved items.</p>
          {confirmDelete ? (
            <div className="delete-confirm">
              <p>This cannot be undone. Delete your saved data?</p>
              <button
                className="danger-button"
                disabled={busy}
                onClick={() => void erase()}
              >
                Yes, delete my data
              </button>
              <button
                className="reset-link"
                disabled={busy}
                onClick={() => setConfirmDelete(false)}
              >
                Keep my profile
              </button>
            </div>
          ) : (
            <button
              className="reset-link"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
            >
              Delete guest profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
