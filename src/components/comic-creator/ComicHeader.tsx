import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ComicHeaderProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export const ComicHeader = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: ComicHeaderProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Comic Details
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Enter the basic information about your comic</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            placeholder="Enter your comic title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-lg font-medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            placeholder="Write a short summary of your comic..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="h-24 resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
};