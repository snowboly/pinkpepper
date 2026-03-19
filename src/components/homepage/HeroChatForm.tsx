"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MessageSquare } from "lucide-react";

const HOMEPAGE_CHAT_EXAMPLES = [
  "Create a HACCP plan for a 32-seat bistro in Lisbon with hot and cold service.",
  "Draft a daily opening and closing hygiene checklist for a burger kitchen.",
  "Build a cleaning and disinfection SOP for a pastry production room.",
  "Generate a fridge, freezer, and hot-hold temperature log template.",
  "Create an allergen matrix for pizzas, pastas, and desserts.",
  "Write a supplier approval questionnaire for chilled meat and dairy vendors.",
  "Draft a traceability procedure for batch-coded sauces and dressings.",
  "Prepare a monthly internal food safety audit checklist for a cafe.",
  "Create a corrective action form for temperature deviations.",
  "Generate a goods-inward inspection checklist for fresh produce deliveries.",
  "Draft a personal hygiene policy for kitchen and front-of-house teams.",
  "Create a staff induction checklist focused on food safety basics.",
  "Write a handwashing SOP with visual verification points.",
  "Build a pest control monitoring log with escalation triggers.",
  "Create a waste management and bin hygiene procedure.",
  "Draft a glass and hard plastic control policy for production areas.",
  "Generate a calibration log for probe thermometers and scales.",
  "Create a cooked-chill cooling procedure for soups and stews.",
  "Draft a reheating standard for ready-made meals.",
  "Write an allergen change-control process for menu updates.",
  "Generate a product recall and withdrawal procedure.",
  "Create a mock recall exercise template for quarterly testing.",
  "Draft a supplier non-conformance report template.",
  "Write a visitor and contractor hygiene policy for food sites.",
  "Generate a cleaning verification checklist with ATP/swab references.",
  "Create a sanitation schedule for a sandwich production line.",
  "Draft a shelf-life verification checklist for ready-to-eat items.",
  "Write a PPDS allergen label verification workflow for UK operations.",
  "Create a cross-contact prevention SOP for a bakery with nut products.",
  "Generate a CCP monitoring sheet for cooking and hot holding.",
  "Draft an incident report form for foreign body complaints.",
  "Create a food defense awareness checklist for small manufacturers.",
  "Write a training matrix for hygiene, allergens, and HACCP refresher sessions.",
  "Generate a handover checklist between day and night shifts.",
  "Create an equipment cleaning SOP for slicers, mixers, and blenders.",
  "Draft a transport temperature checklist for chilled deliveries.",
  "Write a due diligence file index for audit preparation.",
  "Generate a supplier re-approval schedule based on risk levels.",
  "Create a microbiological sampling plan for RTE products.",
  "Draft a corrective and preventive action (CAPA) tracker.",
  "Write a freezer defrost and maintenance record template.",
  "Generate a high-risk/high-care zoning checklist.",
  "Create an allergen-aware recipe control sheet.",
  "Draft a cleaning chemical control and dilution register.",
  "Write a stock rotation (FIFO/FEFO) verification checklist.",
  "Generate a hot display monitoring log for deli counters.",
  "Create a chilled prep room environmental monitoring checklist.",
  "Draft a food handler illness reporting and return-to-work policy.",
  "Write a supplier delivery rejection log with root-cause fields.",
  "Generate an annual food safety management review template.",
];

export function HeroChatForm() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);

  useEffect(() => {
    const pickNext = (current: number) => {
      if (HOMEPAGE_CHAT_EXAMPLES.length <= 1) return 0;
      let next = current;
      while (next === current) {
        next = Math.floor(Math.random() * HOMEPAGE_CHAT_EXAMPLES.length);
      }
      return next;
    };

    const kickoffId = window.setTimeout(() => {
      setExampleIndex(Math.floor(Math.random() * HOMEPAGE_CHAT_EXAMPLES.length));
    }, 120);

    const id = window.setInterval(() => {
      setExampleIndex((prev) => pickNext(prev));
    }, 3200);

    return () => {
      window.clearTimeout(kickoffId);
      window.clearInterval(id);
    };
  }, []);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = encodeURIComponent(inputValue || "Create a HACCP plan for my food business");
    router.push(`/signup?prompt=${prompt}`);
  };

  return (
    <form onSubmit={handleChatSubmit} className="mx-auto w-full max-w-3xl">
      <div
        className={`group relative overflow-hidden rounded-2xl border bg-white shadow-[0_20px_70px_rgba(15,23,42,0.10)] transition-all duration-300 ${
          isFocused ? "border-[#E11D48]/40 shadow-[0_20px_70px_rgba(225,29,72,0.18)]" : "border-[#E2E8F0] hover:border-[#CBD5E1]"
        }`}
      >
        <div className="flex items-center gap-3 p-3 md:gap-4 md:p-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC]">
            <MessageSquare className="h-5 w-5 text-[#94A3B8]" />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={HOMEPAGE_CHAT_EXAMPLES[exampleIndex]}
            className="flex-1 bg-transparent text-base text-[#0F172A] placeholder-[#94A3B8] outline-none md:text-lg"
          />
          <button
            type="submit"
            className="pp-interactive inline-flex items-center gap-2 rounded-xl bg-[#E11D48] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E11D48]/20 transition-all duration-200 hover:bg-[#BE123C] hover:shadow-xl hover:shadow-[#E11D48]/30 active:scale-[0.97] md:px-5 md:py-3 md:text-base"
          >
            <span className="hidden sm:inline">Start free</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </form>
  );
}
