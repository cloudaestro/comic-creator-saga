import { Book, Clock, Edit, Trash2, Lock, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  panels: Panel[];
}

interface ComicCardProps {
  comic: Comic;
  onView: (comic: Comic) => void;
  onDelete: (id: string) => void;
}

export const ComicCard = ({ comic, onView, onDelete }: ComicCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className={cn(
        "group flex flex-col overflow-hidden transition-all hover:shadow-lg cursor-pointer animate-fade-in",
        "hover:scale-[1.02] transition-transform duration-200",
        "dark:bg-sidebar dark:hover:bg-sidebar-accent"
      )}
      onClick={() => onView(comic)}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            {comic.title}
          </span>
          {comic.is_public ? (
            <Globe className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
        </CardTitle>
        <CardDescription>{comic.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 overflow-hidden">
          {comic.panels.slice(0, 3).map((panel) => (
            <div key={panel.id} className="relative aspect-square overflow-hidden rounded-md">
              <img
                src={panel.image_url}
                alt={`Panel ${panel.sequence_number}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
          ))}
          {comic.panels.length > 3 && (
            <div className="flex aspect-square items-center justify-center rounded-md bg-muted/50 backdrop-blur-sm">
              <span className="text-sm font-medium">+{comic.panels.length - 3} more</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-4 dark:border-sidebar-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {new Date(comic.created_at).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/edit/${comic.id}`);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(comic.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};