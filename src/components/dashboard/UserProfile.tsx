import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

interface Profile {
  username: string | null;
  avatar_url: string | null;
  subscription_tier: string | null;
}

export const UserProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url, subscription_tier')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center gap-2">Loading profile...</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        {profile?.avatar_url ? (
          <AvatarImage src={profile.avatar_url} alt={profile.username || 'User'} />
        ) : (
          <AvatarFallback>{(profile?.username?.[0] || 'U').toUpperCase()}</AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 text-sm">
        <p className="font-medium">{profile?.username || 'User'}</p>
        <p className="text-xs text-muted-foreground">
          {profile?.subscription_tier || 'Free Plan'}
        </p>
      </div>
    </div>
  );
};