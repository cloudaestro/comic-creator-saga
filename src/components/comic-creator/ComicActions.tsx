import { Save, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComicActionsProps {
  onSave: () => void;
  onGenerate: () => void;
  isLoading: boolean;
  isProcessing: boolean;
}

export const ComicActions = ({
  onSave,
  onGenerate,
  isLoading,
  isProcessing,
}: ComicActionsProps) => {
  return (
    <div className="flex gap-4">
      <Button
        variant="outline"
        onClick={onSave}
        disabled={isLoading}
        className="flex-1"
      >
        <Save className="h-5 w-5 mr-2" />
        {isLoading ? "Saving..." : "Save Draft"}
      </Button>
      <Button
        onClick={onGenerate}
        disabled={isProcessing}
        className="flex-1"
      >
        <Wand2 className="h-5 w-5 mr-2" />
        {isProcessing ? "Generating..." : "Generate Comic"}
      </Button>
    </div>
  );
};