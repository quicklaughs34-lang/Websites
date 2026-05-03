import type { Metadata } from "next";
import SubPage from "../components/SubPage";

export const metadata: Metadata = {
  title: "Achievements",
  description: "Student progress, tournament highlights, and achievement signals from Sooriya Chess Academy.",
};

export default function AchievementsPage() {
  return <SubPage kind="achievements" />;
}
