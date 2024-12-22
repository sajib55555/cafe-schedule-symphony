import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { EditProfileForm } from "./EditProfileForm";
import { DeleteAccountButton } from "./DeleteAccountButton";
import { Pencil } from "lucide-react";

export function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch profile",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session?.user?.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <EditProfileForm
            profile={profile}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => {
              setIsEditing(false);
              fetchProfile();
            }}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-sm">{profile?.full_name || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{profile?.email || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-sm">{profile?.phone || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Position</p>
                <p className="text-sm">{profile?.position || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Department</p>
                <p className="text-sm">{profile?.department || "Not set"}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full"
                variant="outline"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <DeleteAccountButton />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}