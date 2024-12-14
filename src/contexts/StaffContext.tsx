import React, { createContext, useContext, useState } from 'react';

export interface Staff {
  id: number;
  name: string;
  hours: number;
  role: string;
  email: string;
  phone: string;
  availability: string[];
}

interface StaffContextType {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
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
    { id: 1, name: 'Courtney', hours: 17, role: 'Barista', email: 'courtney@example.com', phone: '123-456-7890', availability: ['Monday', 'Tuesday'] },
    { id: 2, name: 'Saj', hours: 55, role: 'Floor', email: 'saj@example.com', phone: '234-567-8901', availability: ['Wednesday', 'Thursday'] },
    { id: 3, name: 'Tia', hours: 23, role: 'Barista', email: 'tia@example.com', phone: '345-678-9012', availability: ['Friday', 'Saturday'] },
    { id: 4, name: 'Lucy', hours: 15.5, role: 'Floor', email: 'lucy@example.com', phone: '456-789-0123', availability: ['Sunday', 'Monday'] },
    { id: 5, name: 'Nick', hours: 9, role: 'Barista', email: 'nick@example.com', phone: '567-890-1234', availability: ['Tuesday', 'Wednesday'] },
    { id: 6, name: 'Niloufar', hours: 23.5, role: 'Floor', email: 'niloufar@example.com', phone: '678-901-2345', availability: ['Thursday', 'Friday'] }
  ]);

  return (
    <StaffContext.Provider value={{ staff, setStaff }}>
      {children}
    </StaffContext.Provider>
  );
};