import type { MovementType } from "@/lib/types";

// User-facing labels for stock movement types. The enum values mean
// what they say, but the wording on the screen is friendlier: "received"
// is only ever raised by Restock, so we show "Restocked"; "added" is
// reserved for the opening-quantity entry logged when an item is first
// created.
export const MOVEMENT_LABEL: Record<MovementType, string> = {
  added: "Added",
  received: "Restocked",
  issued: "Issued",
  disposed: "Disposed",
  adjusted: "Adjusted",
  transferred: "Transferred",
};
