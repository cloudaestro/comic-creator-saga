import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Comic } from "@/types/comic";
import { ComicCard } from "./ComicCard";
import { useToast } from "@/components/ui/use-toast";

const fetchPublicComics = async () => {
  const { data, error } = await supabase
    .from("comics")
    .select(`
      *,
      panels (*),
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  console.log('Fetched public comics:', data); // Added for debugging
  return data as Comic[];
};

export const FeaturedComics = () => {
  const { toast } = useToast();
  const { data: comics, isLoading } = useQuery({
    queryKey: ['public-comics'],
    queryFn: fetchPublicComics,
  });

  const handleViewComic = (comic: Comic) => {
    // This will be handled by the parent component
  };

  const handleDeleteComic = (id: string) => {
    // Users can't delete other users' comics
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Featured Comics</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[300px] rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!comics?.length) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Featured Comics</h2>
        <p className="text-muted-foreground">No public comics available yet.</p>
      </div>
    );
  }

  console.log('Rendering comics:', comics); // Added for debugging

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Featured Comics</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {comics.map((comic) => (
          <ComicCard
            key={comic.id}
            comic={comic}
            onView={handleViewComic}
            onDelete={handleDeleteComic}
          />
        ))}
      </div>
    </div>
  );
};