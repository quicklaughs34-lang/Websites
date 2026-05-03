import type { Metadata } from "next";
import SubPage from "../components/SubPage";

export const metadata: Metadata = {
  title: "Chess Courses",
  description: "Explore beginner, intermediate, advanced, and tournament preparation chess courses for children at Sooriya Chess Academy.",
};

export default function CoursesPage() {
  return <SubPage kind="courses" />;
}
