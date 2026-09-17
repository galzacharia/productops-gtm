import type { OnboardingStatus, TshirtSize } from "../types";

export const TSHIRT_SIZES: Exclude<TshirtSize, "">[] = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
];

export const ONBOARDING_STATUSES: Exclude<OnboardingStatus, "">[] = [
  "Not Started",
  "Ready to Onboard",
  "Onboarding",
  "Live",
  "Blocked",
];

export function tshirtClass(size?: TshirtSize): string {
  switch (size) {
    case "XS":
    case "S":
      return "bg-teal-100 text-teal-800";
    case "M":
      return "bg-sky-100 text-sky-800";
    case "L":
      return "bg-indigo-100 text-indigo-800";
    case "XL":
    case "XXL":
      return "bg-fuchsia-100 text-fuchsia-800";
    default:
      return "bg-slate-100 text-slate-500";
  }
}
