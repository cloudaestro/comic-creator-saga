import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const DashboardHeader = () => {
  const navigate = useNavigate();

  return (
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
  );
};