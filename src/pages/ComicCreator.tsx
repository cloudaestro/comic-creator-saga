import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, ArrowLeft, Save, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ScriptConfig } from "@/components/comic-creator/ScriptConfig";
import { ComicHeader } from "@/components/comic-creator/ComicHeader";
import { PanelList } from "@/components/comic-creator/PanelList";

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

  const processScript = async ({ script, numPanels, style }: { script: string; numPanels: number; style: string }) => {
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
        body: { script, numPanels, style }
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

      if (id) {
        await supabase.from("panels").delete().eq("comic_id", id);
      }

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

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="grid gap-8 max-w-4xl mx-auto">
        <ComicHeader
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
        />

        <Card>
          <CardContent className="p-6">
            <ScriptConfig onProcess={processScript} isProcessing={isProcessing} />
          </CardContent>
        </Card>

        <PanelList
          panels={panels}
          onPanelChange={setPanels}
          onImageUpload={handleImageUpload}
        />

        <div className="flex gap-4">
          <Button onClick={addPanel} className="gap-2">
            <PlusCircle className="h-5 w-5" />
            Add Panel
          </Button>
          <Button 
            variant="default"
            onClick={handleSave} 
            disabled={isLoading} 
            className="gap-2"
          >
            <Save className="h-5 w-5" />
            {isLoading ? "Saving..." : "Save Comic"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComicCreator;
