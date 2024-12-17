import { Button } from "@/components/ui/button";
import { Square, Rectangle, Smartphone } from "lucide-react";

interface AspectRatioSelectorProps {
  value: "square" | "landscape" | "portrait";
  onChange: (value: "square" | "landscape" | "portrait") => void;
}

export const AspectRatioSelector = ({
  value,
  onChange,
}: AspectRatioSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Aspect Ratio</label>
      <div className="flex gap-2">
        <Button
          variant={value === "square" ? "default" : "outline"}
          size="lg"
          className="flex-1 flex-col gap-2 h-auto py-3"
          onClick={() => onChange("square")}
        >
          <Square className="h-6 w-6" />
          <span className="text-xs">Square</span>
        </Button>
        <Button
          variant={value === "landscape" ? "default" : "outline"}
          size="lg"
          className="flex-1 flex-col gap-2 h-auto py-3"
          onClick={() => onChange("landscape")}
        >
          <Rectangle className="h-6 w-6" />
          <span className="text-xs">Landscape</span>
        </Button>
        <Button
          variant={value === "portrait" ? "default" : "outline"}
          size="lg"
          className="flex-1 flex-col gap-2 h-auto py-3"
          onClick={() => onChange("portrait")}
        >
          <Smartphone className="h-6 w-6" />
          <span className="text-xs">Portrait</span>
        </Button>
      </div>
    </div>
  );
};