import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ComicCard } from "@/components/dashboard/ComicCard";
import { EmptyState } from "@/components/dashboard/EmptyState";

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

const Dashboard = () => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
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
            <div className="mb-8 flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-4xl font-bold tracking-tight">My Comics</h1>
                <p className="text-lg text-muted-foreground">
                  Create and manage your comic collection
                </p>
              </div>
              <Button onClick={() => navigate("/create")} size="lg" className="gap-2">
                <PlusCircle className="h-5 w-5" />
                Create New Comic
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-[300px] rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : comics.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {comics.map((comic) => (
                  <ComicCard
                    key={comic.id}
                    comic={comic}
                    onView={handleViewComic}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </main>

        <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedComic?.title}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-8">
                {selectedComic?.panels.map((panel) => (
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
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;