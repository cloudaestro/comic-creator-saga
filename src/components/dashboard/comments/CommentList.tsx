import { CommentItem } from "./CommentItem";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  };
}

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
}

export const CommentList = ({ comments, isLoading }: CommentListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-center text-muted-foreground">No comments yet.</p>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};