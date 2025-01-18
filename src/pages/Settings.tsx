import { UserProfile } from "@/components/profile/UserProfile";
import { ContactForm } from "@/components/contact/ContactForm";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Profile Settings</h2>
          <UserProfile />
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Support</h2>
          <ContactForm />
        </section>
      </div>
    </div>
  );
};

export default Settings;