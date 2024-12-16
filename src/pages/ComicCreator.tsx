import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, ArrowLeft, Save, Trash2, MoveUp, MoveDown, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Panel {
  id?: string;
  image_url: string;
  sequence_number: number;
  text_content: string;
}

const ComicCreator = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [script, setScript] = useState("");
  const [panels, setPanels] = useState<Panel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchComic();
    }
  }, [id]);

  const fetchComic = async () => {
    const { data: comic, error: comicError } = await supabase
      .from("comics")
      .select("*")
      .eq("id", id)
      .single();

    if (comicError) {
      toast({
        title: "Error",
        description: "Failed to fetch comic",
        variant: "destructive",
      });
      return;
    }

    setTitle(comic.title);
    setDescription(comic.description || "");

    const { data: panelsData, error: panelsError } = await supabase
      .from("panels")
      .select("*")
      .eq("comic_id", id)
      .order("sequence_number");

    if (panelsError) {
      toast({
        title: "Error",
        description: "Failed to fetch panels",
        variant: "destructive",
      });
      return;
    }

    setPanels(panelsData || []);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("comic_panels")
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("comic_panels")
      .getPublicUrl(filePath);

    const updatedPanels = [...panels];
    updatedPanels[index] = {
      ...updatedPanels[index],
      image_url: publicUrl,
    };
    setPanels(updatedPanels);
    setIsLoading(false);
  };

  const processScript = async () => {
    if (!script.trim()) {
      toast({
        title: "Error",
        description: "Please enter a script to process",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-comic-script', {
        body: { script }
      });

      if (error) throw error;

      setPanels(data.panels.map((panel: any) => ({
        image_url: panel.image_url,
        sequence_number: panel.sequence_number,
        text_content: panel.dialogues.join('\n')
      })));

      toast({
        title: "Success",
        description: "Script processed successfully",
      });
    } catch (error) {
      console.error('Error processing script:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process script",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!title) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    if (panels.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one panel",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      let comicId = id;

      if (!comicId) {
        const { data: comic, error: comicError } = await supabase
          .from("comics")
          .insert({
            title,
            description,
            user_id: user.id
          })
          .select()
          .single();

        if (comicError) throw comicError;
        comicId = comic.id;
      } else {
        const { error: updateError } = await supabase
          .from("comics")
          .update({
            title,
            description,
          })
          .eq("id", comicId);

        if (updateError) throw updateError;
      }

      // Delete existing panels if editing
      if (id) {
        await supabase.from("panels").delete().eq("comic_id", id);
      }

      // Insert new panels
      const { error: panelsError } = await supabase.from("panels").insert(
        panels.map((panel, index) => ({
          comic_id: comicId,
          image_url: panel.image_url,
          sequence_number: index + 1,
          text_content: panel.text_content,
        }))
      );

      if (panelsError) throw panelsError;

      toast({
        title: "Success",
        description: "Comic saved successfully",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save comic",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const addPanel = () => {
    setPanels([
      ...panels,
      {
        image_url: "",
        sequence_number: panels.length + 1,
        text_content: "",
      },
    ]);
  };

  const removePanel = (index: number) => {
    const updatedPanels = panels.filter((_, i) => i !== index);
    setPanels(updatedPanels);
  };

  const movePanel = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === panels.length - 1)
    )
      return;

    const updatedPanels = [...panels];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [updatedPanels[index], updatedPanels[newIndex]] = [
      updatedPanels[newIndex],
      updatedPanels[index],
    ];
    setPanels(updatedPanels);
  };

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="space-y-6">
        <div>
          <Input
            placeholder="Comic Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold mb-4"
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-24 mb-4"
          />
          <div className="flex gap-4 items-start">
            <Textarea
              placeholder="Enter your comic script here..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="h-48"
            />
            <Button
              onClick={processScript}
              disabled={isProcessing}
              className="gap-2"
            >
              <Wand2 className="h-5 w-5" />
              {isProcessing ? "Processing..." : "Generate Panels"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {panels.map((panel, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Panel {index + 1}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => movePanel(index, "up")}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => movePanel(index, "down")}
                        disabled={index === panels.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removePanel(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, index)}
                        className="mb-2"
                      />
                      {panel.image_url && (
                        <img
                          src={panel.image_url}
                          alt={`Panel ${index + 1}`}
                          className="max-w-full h-auto rounded-lg"
                        />
                      )}
                    </div>
                    <div>
                      <Textarea
                        placeholder="Panel text content"
                        value={panel.text_content}
                        onChange={(e) => {
                          const updatedPanels = [...panels];
                          updatedPanels[index] = {
                            ...updatedPanels[index],
                            text_content: e.target.value,
                          };
                          setPanels(updatedPanels);
                        }}
                        className="h-full min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4">
          <Button onClick={addPanel} className="gap-2">
            <PlusCircle className="h-5 w-5" />
            Add Panel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="gap-2">
            <Save className="h-5 w-5" />
            Save Comic
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComicCreator;