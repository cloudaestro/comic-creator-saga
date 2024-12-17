import { Book, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <div className="rounded-full bg-primary/10 p-4">
        <Book className="h-12 w-12 text-primary" />
      </div>
      <h2 className="mt-4 text-2xl font-semibold">No Comics Yet</h2>
      <p className="mb-6 text-muted-foreground max-w-sm">
        Start your creative journey by creating your first comic book!
      </p>
      <Button onClick={() => navigate("/create")} className="gap-2">
        <PlusCircle className="h-5 w-5" />
        Create New Comic
      </Button>
    </div>
  );
};