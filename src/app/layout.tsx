import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StoreProvider } from "@/components/store-provider";
import "./globals.css";
export const metadata: Metadata = { title: { default: "Fieldwork — Good things for the everyday", template: "%s · Fieldwork" }, description: "A considered collection of everyday carry, clothing, home essentials, and tech. Find your everyday at Fieldwork." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><a href="#main-content" className="skip-link">Skip to content</a><StoreProvider><Header/><main id="main-content">{children}</main><Footer/></StoreProvider></body></html>;
}
