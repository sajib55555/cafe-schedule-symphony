import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCompanyId() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast.error('Error fetching session');
          return;
        }

        if (!session?.user?.id) {
          console.error('No user session found');
          toast.error('Please sign in again');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          toast.error('Error fetching company information');
          return;
        }

        if (!profile?.company_id) {
          console.error('No company ID found');
          toast.error('Please create a company first');
          return;
        }

        console.log('Company ID fetched:', profile.company_id);
        setCompanyId(profile.company_id);
      } catch (error) {
        console.error('Error in fetchCompanyId:', error);
        toast.error('Failed to fetch company information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyId();
  }, []);

  return { companyId, isLoading };
}