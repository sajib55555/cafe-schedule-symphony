import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserRound, Building2, Phone, Mail, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface ProfileData {
  full_name: string | null;
  email: string | null;
  position: string | null;
  department: string | null;
  phone: string | null;
  company_name?: string;
}

export const UserProfile = () => {
  const { session } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<ProfileData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    if (session?.user) {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select(`
          full_name,
          email,
          position,
          department,
          phone,
          companies (
            name
          )
        `)
        .eq('id', session.user.id)
        .single();

      if (!error && profileData) {
        const profile = {
          ...profileData,
          company_name: profileData.companies?.name
        };
        setProfile(profile);
        setEditedProfile(profile);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!session?.user || !editedProfile) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editedProfile.full_name,
        position: editedProfile.position,
        department: editedProfile.department,
        phone: editedProfile.phone,
      })
      .eq('id', session.user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      setProfile(editedProfile);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    if (!session?.user) return;

    const { error } = await supabase.auth.admin.deleteUser(session.user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    } else {
      await supabase.auth.signOut();
      navigate("/auth");
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted",
      });
    }
  };

  if (!profile) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile</CardTitle>
        <div className="space-x-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={handleEdit}>
                Edit Profile
              </Button>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete your account? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      Delete Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile.full_name ? getInitials(profile.full_name) : "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-3 flex-1">
            <div>
              {isEditing ? (
                <Input
                  value={editedProfile?.full_name || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev!, full_name: e.target.value }))}
                  className="mb-2"
                />
              ) : (
                <h3 className="font-semibold text-lg">{profile.full_name}</h3>
              )}
              {profile.company_name && (
                <div className="flex items-center text-muted-foreground">
                  <Building2 className="h-4 w-4 mr-1" />
                  <span>{profile.company_name}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      value={editedProfile?.position || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev!, position: e.target.value }))}
                    />
                  ) : (
                    <span>{profile.position}</span>
                  )}
                </div>
                <div className="flex items-center">
                  <UserRound className="h-4 w-4 mr-2 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      value={editedProfile?.department || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev!, department: e.target.value }))}
                    />
                  ) : (
                    <span>{profile.department}</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      value={editedProfile?.phone || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev!, phone: e.target.value }))}
                    />
                  ) : (
                    <span>{profile.phone}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};