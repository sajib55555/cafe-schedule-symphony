import { Mail, User, Building2, Briefcase, Phone } from "lucide-react";
import { ProfileField } from "./ProfileField";
import { Profile } from "@/types/profile";
import { Session } from "@supabase/supabase-js";

interface ProfileDetailsProps {
  profile: Profile | null;
  session: Session | null;
}

export function ProfileDetails({ profile, session }: ProfileDetailsProps) {
  return (
    <div className="space-y-4">
      <ProfileField
        icon={Mail}
        label="Email"
        value={profile?.email || session?.user?.email}
      />
      <ProfileField
        icon={User}
        label="Full Name"
        value={profile?.full_name}
      />
      <ProfileField
        icon={Building2}
        label="Department"
        value={profile?.department}
      />
      <ProfileField
        icon={Briefcase}
        label="Position"
        value={profile?.position}
      />
      <ProfileField
        icon={Phone}
        label="Phone"
        value={profile?.phone}
      />
    </div>
  );
}