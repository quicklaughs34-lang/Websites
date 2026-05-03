import type { Metadata } from "next";
import SubPage from "../components/SubPage";

export const metadata: Metadata = {
  title: "Contact & Book Demo",
  description: "Book a free demo chess class with Sooriya Chess Academy through WhatsApp, phone, or the demo booking form.",
};

export default function ContactPage() {
  return <SubPage kind="contact" />;
}
