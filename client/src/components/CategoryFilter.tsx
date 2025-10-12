import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const categories = [
  "All",
  "Instagram",
  "Twitter",
  "TikTok",
  "YouTube",
  "Facebook",
  "LinkedIn",
];

export function CategoryFilter() {
  const [selected, setSelected] = useState("All");

  return (
    <div className="border-b">
      <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selected === category ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap toggle-elevate"
              onClick={() => setSelected(category)}
              data-testid={`badge-category-${category.toLowerCase()}`}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
