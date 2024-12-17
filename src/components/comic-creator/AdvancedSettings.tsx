import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AdvancedSettingsProps {
  children: React.ReactNode;
}

export const AdvancedSettings = ({ children }: AdvancedSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <Button
          variant="ghost"
          className="w-full flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="font-medium">Advanced Settings</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        {isOpen && (
          <div className="mt-4 space-y-4 animate-accordion-down">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};