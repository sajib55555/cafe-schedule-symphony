import { UserProfile } from "@/components/profile/UserProfile";
import { ContactForm } from "@/components/contact/ContactForm";
import { Layout } from "@/components/Layout";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <Layout>
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
          
        <Separator className="my-8" />
        
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Staff Management</h2>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Settings;