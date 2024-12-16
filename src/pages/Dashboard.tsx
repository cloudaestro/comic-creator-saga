import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Star, Archive, MessageSquare, Search, Settings, HelpCircle, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Comic {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

const Dashboard = () => {
  const [comics, setComics] = useState<Comic[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchComics = async () => {
    const { data, error } = await supabase
      .from("comics")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch comics",
        variant: "destructive",
      });
      return;
    }

    setComics(data || []);
  };

  useEffect(() => {
    fetchComics();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("comics").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete comic",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Comic deleted successfully",
    });
    fetchComics();
  };

  const menuItems = [
    { icon: MessageSquare, label: "Chats", count: comics.length },
    { icon: Search, label: "Search", shortcut: "⌘F" },
    { icon: CreditCard, label: "Manage subscription" },
    { icon: HelpCircle, label: "Updates & FAQ" },
    { icon: Settings, label: "Settings" },
  ];

  const lists = [
    { icon: MessageSquare, label: "Welcome", count: 48 },
    { icon: Star, label: "Favorites", count: 8 },
    { icon: Archive, label: "Archived", count: 128 },
  ];

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
            <SidebarGroup>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </span>
                      {item.count !== undefined && (
                        <span className="text-xs text-muted-foreground">{item.count}</span>
                      )}
                      {item.shortcut && (
                        <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                          <span className="text-xs">{item.shortcut}</span>
                        </kbd>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Lists</SidebarGroupLabel>
              <SidebarMenu>
                {lists.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </span>
                      {item.count && (
                        <span className="text-xs text-muted-foreground">{item.count}</span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div className="flex-1 text-sm">
                <p className="font-medium">User</p>
                <p className="text-xs text-muted-foreground">user@example.com</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-8">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-4xl font-bold">My Comics</h1>
              <Button onClick={() => navigate("/create")} className="gap-2">
                <PlusCircle className="h-5 w-5" />
                Create New Comic
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {comics.map((comic) => (
                <Card key={comic.id} className={cn(
                  "flex flex-col overflow-hidden transition-all hover:shadow-lg",
                  "dark:bg-sidebar dark:hover:bg-sidebar-accent"
                )}>
                  <div className="flex flex-col space-y-1.5 p-6">
                    <h3 className="text-2xl font-semibold">{comic.title}</h3>
                    <p className="text-sm text-muted-foreground">{comic.description}</p>
                  </div>
                  <div className="flex-grow p-6 pt-0">
                    <p className="text-sm text-muted-foreground">
                      Created on {new Date(comic.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t p-4 dark:border-sidebar-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/edit/${comic.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(comic.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {comics.length === 0 && (
              <div className="py-12 text-center">
                <h2 className="mb-4 text-2xl font-semibold">No Comics Yet</h2>
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
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;