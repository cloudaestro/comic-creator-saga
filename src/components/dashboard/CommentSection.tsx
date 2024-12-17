import { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  };
}

interface CommentSectionProps {
  comicId: string;
  isPublic: boolean;
}

export const CommentSection = ({ comicId, isPublic }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isPublic) {
      fetchComments();
    }
  }, [comicId, isPublic]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        profiles (
          username,
          avatar_url
        )
      `)
      .eq("comic_id", comicId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return;
    }

    setComments(data as Comment[]);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.from("comments").insert({
      comic_id: comicId,
      content: newComment.trim(),
      user_id: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } else {
      setNewComment("");
      fetchComments();
      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
    }
    setIsLoading(false);
  };

  if (!isPublic) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Comments</h3>
      </div>

      <div className="flex gap-2">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
        />
        <Button
          onClick={handleSubmitComment}
          disabled={isLoading || !newComment.trim()}
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.profiles.avatar_url || undefined} />
                <AvatarFallback>
                  {comment.profiles.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {comment.profiles.username || "Anonymous"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};