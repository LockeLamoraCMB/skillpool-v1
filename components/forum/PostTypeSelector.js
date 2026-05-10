"use client";

import { POST_TYPE_OPTIONS } from "@/lib/forum";

export default function PostTypeSelector({ value, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {POST_TYPE_OPTIONS.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-[20px] border px-5 py-4 text-left transition ${
              active
                ? "border-[#12212B] bg-[#12212B] text-white"
                : "border-[#D3DDE5] bg-[#F9FBFC] text-[#22323D]"
            }`}
          >
            <p className="text-sm font-bold uppercase tracking-[0.14em]">
              {option.value === "offer" ? "Offer" : "Need Help"}
            </p>
            <p className="mt-2 text-[15px] leading-6">
              {option.value === "offer"
                ? "Post a service, tutorial, or skill you can provide."
                : "Ask for support, tutoring, or project help."}
            </p>
          </button>
        );
      })}
    </div>
  );
}