import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Book, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Comic {
  id: string;
  title: string;
  description: string;
  created_at: string;
  panels: Panel[];
}

interface Panel {
  id: string;
  image_url: string;
  sequence_number: number;
  text_content: string | null;
}

const Dashboard = () => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchComics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Fetch comics with their panels
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

      // Sort panels by sequence number for each comic
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
              <div className="h-8 w-8 rounded-lg bg-primary" />
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
              <div>
                <h1 className="text-4xl font-bold">My Comics</h1>
                <p className="mt-2 text-muted-foreground">
                  Create and manage your comic collection
                </p>
              </div>
              <Button onClick={() => navigate("/create")} className="gap-2">
                <PlusCircle className="h-5 w-5" />
                Create New Comic
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {comics.map((comic) => (
                <Card 
                  key={comic.id} 
                  className={cn(
                    "group flex flex-col overflow-hidden transition-all hover:shadow-lg cursor-pointer",
                    "dark:bg-sidebar dark:hover:bg-sidebar-accent"
                  )}
                  onClick={() => handleViewComic(comic)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="h-5 w-5" />
                      {comic.title}
                    </CardTitle>
                    <CardDescription>{comic.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 overflow-hidden">
                      {comic.panels.slice(0, 3).map((panel) => (
                        <img
                          key={panel.id}
                          src={panel.image_url}
                          alt={`Panel ${panel.sequence_number}`}
                          className="h-24 w-24 rounded-md object-cover"
                        />
                      ))}
                      {comic.panels.length > 3 && (
                        <div className="flex h-24 w-24 items-center justify-center rounded-md bg-muted">
                          +{comic.panels.length - 3} more
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(comic.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {comics.length === 0 && (
              <div className="py-12 text-center">
                <Book className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-semibold">No Comics Yet</h2>
                <p className="mb-6 text-muted-foreground">
                  Create your first comic to get started!
                </p>
                <Button onClick={() => navigate("/create")} className="gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Create New Comic
                </Button>
              </div>
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
                  <div key={panel.id} className="space-y-2">
                    <img
                      src={panel.image_url}
                      alt={`Panel ${panel.sequence_number}`}
                      className="w-full rounded-lg object-cover shadow-lg"
                    />
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