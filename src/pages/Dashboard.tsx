import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Comics</h1>
        <Button onClick={() => navigate("/create")} className="gap-2">
          <PlusCircle className="h-5 w-5" />
          Create New Comic
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comics.map((comic) => (
          <Card key={comic.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{comic.title}</CardTitle>
              <CardDescription>{comic.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-500">
                Created on {new Date(comic.created_at).toLocaleDateString()}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(`/edit/${comic.id}`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(comic.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {comics.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No Comics Yet</h2>
          <p className="text-gray-500 mb-6">Create your first comic to get started!</p>
          <Button onClick={() => navigate("/create")} className="gap-2">
            <PlusCircle className="h-5 w-5" />
            Create New Comic
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;