import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "./SearchBar";

interface DashboardHeaderProps {
  onSearch: (query: string) => void;
}

export const DashboardHeader = ({ onSearch }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">My Comics</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage your comic collection
        </p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar onSearch={onSearch} />
        <Button onClick={() => navigate("/create")} className="sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Comic
        </Button>
      </div>
    </div>
  );
};