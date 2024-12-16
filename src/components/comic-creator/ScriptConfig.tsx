import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2 } from "lucide-react";

interface ScriptConfigProps {
  onProcess: (config: {
    script: string;
    numPanels: number;
    style: string;
  }) => void;
  isProcessing: boolean;
}

export const ScriptConfig = ({ onProcess, isProcessing }: ScriptConfigProps) => {
  const [script, setScript] = useState("");
  const [numPanels, setNumPanels] = useState(3);
  const [style, setStyle] = useState("manga");

  const handleProcess = () => {
    onProcess({
      script,
      numPanels,
      style,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Number of Panels</label>
          <Input
            type="number"
            min={1}
            max={10}
            value={numPanels}
            onChange={(e) => setNumPanels(parseInt(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Style</label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manga">Manga</SelectItem>
              <SelectItem value="futuristic">Futuristic</SelectItem>
              <SelectItem value="realistic">Realistic</SelectItem>
              <SelectItem value="superhero">Superhero</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Story Script</label>
        <Textarea
          placeholder="Enter your story script here..."
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="h-48"
        />
      </div>
      <Button
        onClick={handleProcess}
        disabled={isProcessing || !script.trim()}
        className="w-full gap-2"
      >
        <Wand2 className="h-5 w-5" />
        {isProcessing ? "Processing..." : "Generate Comic"}
      </Button>
    </div>
  );
};