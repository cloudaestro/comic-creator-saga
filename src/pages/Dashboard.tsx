import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ComicGrid } from "@/components/dashboard/ComicGrid";
import { ComicViewer } from "@/components/dashboard/ComicViewer";
import { Comic } from "@/types/comic";

const Dashboard = () => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [filteredComics, setFilteredComics] = useState<Comic[]>([]);
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchComics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data: comicsData, error: comicsError } = await supabase
        .from("comics")
        .select(`
          *,
          panels (
            *
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (comicsError) throw comicsError;

      const processedComics = comicsData?.map(comic => ({
        ...comic,
        panels: comic.panels.sort((a, b) => a.sequence_number - b.sequence_number)
      }));

      setComics(processedComics || []);
      setFilteredComics(processedComics || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch comics",
        variant: "destructive",
      });
      console.error('Error fetching comics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComics();
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredComics(comics);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = comics.filter(comic => 
      comic.title.toLowerCase().includes(searchTerm) ||
      (comic.description?.toLowerCase().includes(searchTerm))
    );
    setFilteredComics(filtered);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("comics").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Comic deleted successfully",
      });
      fetchComics();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comic",
        variant: "destructive",
      });
    }
  };

  const handleViewComic = (comic: Comic) => {
    setSelectedComic(comic);
    setIsViewerOpen(true);
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border px-2">
            <div className="flex items-center gap-2 px-2 py-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80" />
              <div className="flex-1">
                <h3 className="font-semibold">Comic Creator</h3>
                <p className="text-xs text-muted-foreground">AI-Powered Comics</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <DashboardSidebar />
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-4">
            <UserProfile />
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-8">
            <DashboardHeader onSearch={handleSearch} />
            <ComicGrid
              comics={filteredComics}
              isLoading={isLoading}
              onViewComic={handleViewComic}
              onDeleteComic={handleDelete}
            />
          </div>
        </main>

        <ComicViewer
          comic={selectedComic}
          isOpen={isViewerOpen}
          onOpenChange={setIsViewerOpen}
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;