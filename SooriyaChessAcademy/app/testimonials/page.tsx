import type { Metadata } from "next";
import SubPage from "../components/SubPage";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "Parent and student testimonials for Sooriya Chess Academy chess coaching.",
};

export default function TestimonialsPage() {
  return <SubPage kind="testimonials" />;
}
