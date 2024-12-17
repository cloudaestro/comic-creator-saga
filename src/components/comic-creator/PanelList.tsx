import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MoveDown, MoveUp, Trash2 } from "lucide-react";

interface Panel {
  id?: string;
  image_url: string;
  sequence_number: number;
  text_content: string;
}

interface PanelListProps {
  panels: Panel[];
  onPanelChange: (panels: Panel[]) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>, index: number) => void;
}

export const PanelList = ({
  panels,
  onPanelChange,
  onImageUpload,
}: PanelListProps) => {
  const movePanel = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === panels.length - 1)
    )
      return;

    const updatedPanels = [...panels];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [updatedPanels[index], updatedPanels[newIndex]] = [
      updatedPanels[newIndex],
      updatedPanels[index],
    ];
    onPanelChange(updatedPanels);
  };

  const removePanel = (index: number) => {
    const updatedPanels = panels.filter((_, i) => i !== index);
    onPanelChange(updatedPanels);
  };

  return (
    <div className="space-y-6">
      {panels.map((panel, index) => (
        <Card key={index} className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Panel {index + 1}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => movePanel(index, "up")}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => movePanel(index, "down")}
                    disabled={index === panels.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removePanel(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onImageUpload(e, index)}
                    className="cursor-pointer file:cursor-pointer"
                  />
                  {panel.image_url && (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={panel.image_url}
                        alt={`Panel ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Textarea
                    placeholder="Enter the text content for this panel..."
                    value={panel.text_content}
                    onChange={(e) => {
                      const updatedPanels = [...panels];
                      updatedPanels[index] = {
                        ...updatedPanels[index],
                        text_content: e.target.value,
                      };
                      onPanelChange(updatedPanels);
                    }}
                    className="h-full min-h-[120px] resize-none"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};