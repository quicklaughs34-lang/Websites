import type { Metadata } from "next";
import SubPage from "../components/SubPage";

export const metadata: Metadata = {
  title: "About & Coaches",
  description: "Meet the Sooriya Chess Academy coaching approach for children, parents, and tournament-minded students.",
};

export default function AboutPage() {
  return <SubPage kind="about" />;
}
