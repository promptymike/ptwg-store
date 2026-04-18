import type { Metadata } from "next";

import { PersonalityTest } from "@/components/test/personality-test";

export const metadata: Metadata = {
  title: "Test stylu pracy — Big Five w 2 minuty",
  description:
    "Bezpłatny naukowy test osobowości TIPI (Big Five). Poznaj swoje mocne strony, obszary do pilnowania i kategorię szablonów dopasowanych do Twojego stylu pracy.",
};

export default function TestPage() {
  return (
    <div className="shell section-space">
      <div className="mx-auto max-w-4xl">
        <PersonalityTest />
      </div>
    </div>
  );
}
