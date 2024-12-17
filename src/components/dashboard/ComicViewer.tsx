import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CommentSection } from "./comments/CommentSection";

interface Panel {
  id: string;
  image_url: string;
  sequence_number: number;
  text_content: string | null;
}

interface Comic {
  id: string;
  title: string;
  description: string;
  created_at: string;
  is_public: boolean;
  user_id: string;
  panels: Panel[];
}

interface ComicViewerProps {
  comic: Comic | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ComicViewer = ({ comic, isOpen, onOpenChange }: ComicViewerProps) => {
  const [isPublic, setIsPublic] = useState(comic?.is_public || false);
  const { toast } = useToast();

  if (!comic) return null;

  const handlePublicToggle = async (checked: boolean) => {
    const { error } = await supabase
      .from("comics")
      .update({ is_public: checked })
      .eq("id", comic.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update comic visibility",
        variant: "destructive",
      });
    } else {
      setIsPublic(checked);
      toast({
        title: "Success",
        description: `Comic is now ${checked ? "public" : "private"}`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{comic.title}</span>
            <div className="flex items-center gap-2">
              <Label htmlFor="public-toggle">Make Public</Label>
              <Switch
                id="public-toggle"
                checked={isPublic}
                onCheckedChange={handlePublicToggle}
              />
            </div>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-8">
            {comic.panels.map((panel) => (
              <div key={panel.id} className="space-y-2 animate-fade-in">
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={panel.image_url}
                    alt={`Panel ${panel.sequence_number}`}
                    className="w-full object-cover shadow-lg transition-transform hover:scale-105"
                  />
                </div>
                {panel.text_content && (
                  <p className="text-center text-sm text-muted-foreground">
                    {panel.text_content}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 border-t pt-8">
            <CommentSection comicId={comic.id} isPublic={isPublic} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
