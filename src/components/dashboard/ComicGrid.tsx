import { ComicCard } from "./ComicCard";
import { EmptyState } from "./EmptyState";
import { Comic } from "@/types/comic";

interface ComicGridProps {
  comics: Comic[];
  isLoading: boolean;
  onViewComic: (comic: Comic) => void;
  onDeleteComic: (id: string) => void;
}

export const ComicGrid = ({ comics, isLoading, onViewComic, onDeleteComic }: ComicGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[300px] rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (comics.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {comics.map((comic) => (
        <ComicCard
          key={comic.id}
          comic={comic}
          onView={onViewComic}
          onDelete={onDeleteComic}
        />
      ))}
    </div>
  );
};