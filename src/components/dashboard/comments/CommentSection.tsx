import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

interface CommentSectionProps {
  comicId: string;
  isPublic: boolean;
}

export const CommentSection = ({ comicId, isPublic }: CommentSectionProps) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          profiles:profiles!comments_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq("comic_id", comicId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch comments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [comicId]);

  if (!isPublic) {
    return (
      <p className="text-center text-muted-foreground">
        Comments are only available on public comics.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Comments</h3>
      <CommentForm comicId={comicId} onCommentAdded={fetchComments} />
      <CommentList comments={comments} isLoading={isLoading} />
    </div>
  );
};