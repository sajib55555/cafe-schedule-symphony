import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Staff {
  id: number;
  name: string;
  hours: number;
  role: string;
  email: string;
  phone: string;
  availability: string[];
  hourly_pay: number;
  company_id?: string;
}

interface StaffContextType {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  resetAllHours: () => Promise<void>;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
};

export const StaffProvider = ({ children }: { children: React.ReactNode }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const { session } = useAuth();

  useEffect(() => {
    const loadStaff = async () => {
      if (!session?.user?.id) return;

      try {
        // First get the user's company_id
        const { data: profileData } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', session.user.id)
          .single();

        if (!profileData?.company_id) return;

        // Then load staff for that company
        const { data: staffData, error } = await supabase
          .from('staff')
          .select('*')
          .eq('company_id', profileData.company_id);

        if (error) {
          console.error('Error loading staff:', error);
          return;
        }

        if (staffData) {
          setStaff(staffData);
        }
      } catch (error) {
        console.error('Error in loadStaff:', error);
      }
    };

    loadStaff();
  }, [session]);

  const resetAllHours = async () => {
    if (!session?.user?.id) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session.user.id)
        .single();

      if (!profileData?.company_id) return;

      const { error } = await supabase
        .from('staff')
        .update({ hours: 0 })
        .eq('company_id', profileData.company_id);

      if (error) throw error;

      setStaff(prev => prev.map(employee => ({
        ...employee,
        hours: 0
      })));
    } catch (error) {
      console.error('Error resetting hours:', error);
    }
  };

  return (
    <StaffContext.Provider value={{ staff, setStaff, resetAllHours }}>
      {children}
    </StaffContext.Provider>
  );
};