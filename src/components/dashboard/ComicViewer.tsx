import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  panels: Panel[];
}

interface ComicViewerProps {
  comic: Comic | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ComicViewer = ({ comic, isOpen, onOpenChange }: ComicViewerProps) => {
  if (!comic) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{comic.title}</DialogTitle>
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};