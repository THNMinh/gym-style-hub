import { createFileRoute } from "@tanstack/react-router";
import { CollabFeature } from "@/features/collab/components/collab-feature";

export const Route = createFileRoute("/collab")({
  head: () => ({
    meta: [
      { title: "Bộ sưu tập COLLAB (David Laid, Carlos, Cbum) — GYMKITTEN" },
      {
        name: "description",
        content:
          "Khám phá các bộ sưu tập hợp tác độc quyền cùng các biểu tượng thể hình thế giới: David Laid, Carlos, Chris Bumstead (CBUM).",
      },
      { property: "og:title", content: "Bộ sưu tập COLLAB — GYMKITTEN" },
      {
        property: "og:description",
        content:
          "Độc quyền các sản phẩm giới hạn hợp tác cùng David Laid, Carlos và Chris Bumstead (CBUM).",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CollabFeature,
});
