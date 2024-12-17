import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AspectRatioSelector } from "./AspectRatioSelector";
import { AdvancedSettings } from "./AdvancedSettings";

interface ScriptConfigProps {
  onProcess: (config: {
    script: string;
    numPanels: number;
    style: string;
    aspectRatio: "square" | "landscape" | "portrait";
  }) => void;
  isProcessing: boolean;
}

export const ScriptConfig = ({ onProcess, isProcessing }: ScriptConfigProps) => {
  const [script, setScript] = useState("");
  const [numPanels, setNumPanels] = useState(3);
  const [style, setStyle] = useState("manga");
  const [aspectRatio, setAspectRatio] = useState<"square" | "landscape" | "portrait">("landscape");

  const handleProcess = () => {
    onProcess({
      script,
      numPanels,
      style,
      aspectRatio,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Story Script</label>
              <Textarea
                placeholder="Write your narrative here..."
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="h-48 resize-none"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Images</label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[numPanels]}
                    onValueChange={(value) => setNumPanels(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-16 text-center">
                    {numPanels} {numPanels === 1 ? "Image" : "Images"}
                  </span>
                </div>
              </div>

              <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
            </div>
          </div>
        </CardContent>
      </Card>

      <AdvancedSettings>
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
      </AdvancedSettings>

      <Button
        onClick={handleProcess}
        disabled={isProcessing || !script.trim()}
        className="w-full gap-2"
      >
        Generate Images
      </Button>
    </div>
  );
};