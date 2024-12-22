import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserRound, Building2, Phone, Mail, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

  useEffect(() => {
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
          setProfile({
            ...profileData,
            company_name: profileData.companies?.name
          });
        }
      }
    };

    fetchProfile();
  }, [session]);

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
      <CardHeader>
        <CardTitle>Profile</CardTitle>
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
              <h3 className="font-semibold text-lg">{profile.full_name}</h3>
              {profile.company_name && (
                <div className="flex items-center text-muted-foreground">
                  <Building2 className="h-4 w-4 mr-1" />
                  <span>{profile.company_name}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {profile.position && (
                <div className="flex items-center text-sm">
                  <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile.position}</span>
                </div>
              )}
              {profile.department && (
                <div className="flex items-center text-sm">
                  <UserRound className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile.department}</span>
                </div>
              )}
              {profile.email && (
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};