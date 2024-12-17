import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
  comment: {
    content: string;
    created_at: string;
    profiles: {
      username: string | null;
      avatar_url: string | null;
    };
  };
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <div className="flex gap-4">
      <Avatar className="h-8 w-8">
        {comment.profiles.avatar_url ? (
          <AvatarImage src={comment.profiles.avatar_url} />
        ) : (
          <AvatarFallback>
            {(comment.profiles.username?.[0] || "U").toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {comment.profiles.username || "Anonymous"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{comment.content}</p>
      </div>
    </div>
  );
};