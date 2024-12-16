import { MessageSquare, Search, CreditCard, HelpCircle, Settings, Star, Archive } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { UserProfile } from "./UserProfile";

export const DashboardSidebar = () => {
  const menuItems = [
    { icon: MessageSquare, label: "Comics", shortcut: "⌘1" },
    { icon: Search, label: "Search", shortcut: "⌘F" },
    { icon: CreditCard, label: "Subscription", shortcut: "⌘S" },
    { icon: HelpCircle, label: "Help", shortcut: "⌘H" },
    { icon: Settings, label: "Settings", shortcut: "⌘," },
  ];

  const lists = [
    { icon: Star, label: "Favorites" },
    { icon: Archive, label: "Archived" },
  ];

  return (
    <>
      <SidebarGroup>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </span>
                {item.shortcut && (
                  <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                    <span className="text-xs">{item.shortcut}</span>
                  </kbd>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Lists</SidebarGroupLabel>
        <SidebarMenu>
          {lists.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
};