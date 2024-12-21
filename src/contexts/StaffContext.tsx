import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Staff {
  id: number;
  name: string;
  hours: number;
  role: string;
  email: string;
  phone: string;
  availability: string[];
  hourly_pay: number;
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
  const [staff, setStaff] = useState<Staff[]>([
    { id: 1, name: 'Courtney', hours: 0, role: 'Barista', email: 'courtney@example.com', phone: '123-456-7890', availability: ['Monday', 'Tuesday'], hourly_pay: 15 },
    { id: 2, name: 'Saj', hours: 0, role: 'Floor', email: 'saj@example.com', phone: '234-567-8901', availability: ['Wednesday', 'Thursday'], hourly_pay: 15 },
    { id: 3, name: 'Tia', hours: 0, role: 'Barista', email: 'tia@example.com', phone: '345-678-9012', availability: ['Friday', 'Saturday'], hourly_pay: 15 },
    { id: 4, name: 'Lucy', hours: 0, role: 'Floor', email: 'lucy@example.com', phone: '456-789-0123', availability: ['Sunday', 'Monday'], hourly_pay: 15 },
    { id: 5, name: 'Nick', hours: 0, role: 'Barista', email: 'nick@example.com', phone: '567-890-1234', availability: ['Tuesday', 'Wednesday'], hourly_pay: 15 },
    { id: 6, name: 'Niloufar', hours: 0, role: 'Floor', email: 'niloufar@example.com', phone: '678-901-2345', availability: ['Thursday', 'Friday'], hourly_pay: 15 }
  ]);

  const resetAllHours = async () => {
    try {
      // Update the database
      const { error } = await supabase
        .from('staff')
        .update({ hours: 0 })
        .neq('id', 0); // This will update all staff records

      if (error) throw error;

      // Update the local state
      setStaff(prev => prev.map(employee => ({
        ...employee,
        hours: 0
      })));
    } catch (error) {
      console.error('Error resetting hours:', error);
    }
  };

  useEffect(() => {
    // Load staff data from Supabase when component mounts
    const loadStaff = async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*');

      if (error) {
        console.error('Error loading staff:', error);
        return;
      }

      if (data) {
        setStaff(data);
      }
    };

    loadStaff();
  }, []);

  return (
    <StaffContext.Provider value={{ staff, setStaff, resetAllHours }}>
      {children}
    </StaffContext.Provider>
  );
};
