import { Button } from "@/components/ui/button";
import { RolesSelector } from "./staff/RolesSelector";
import { AvailabilitySelector } from "./staff/AvailabilitySelector";
import { FormField } from "./staff/FormField";
import { useStaffForm } from "@/hooks/useStaffForm";

export function AddStaffForm({ onClose }: { onClose: () => void }) {
  const { formData, setFormData, handleSubmit } = useStaffForm(onClose);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'hourly_pay' ? parseFloat(value) || 0 : value
    }));
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleAvailabilityChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter((d) => d !== day)
        : [...prev.availability, day]
    }));
  };

  return (
    <div className="space-y-4">
      <FormField
        id="name"
        label="Name"
        value={formData.name}
        onChange={(value) => handleFieldChange('name', value)}
        placeholder="Enter staff name"
        required
      />

      <RolesSelector
        selectedRoles={formData.roles}
        onRoleToggle={handleRoleToggle}
      />

      <FormField
        id="email"
        label="Email"
        value={formData.email}
        onChange={(value) => handleFieldChange('email', value)}
        type="email"
        placeholder="Enter email address"
        required
      />

      <FormField
        id="phone"
        label="Phone"
        value={formData.phone}
        onChange={(value) => handleFieldChange('phone', value)}
        placeholder="Enter phone number"
        required
      />

      <FormField
        id="hourly_pay"
        label="Hourly Pay ($)"
        value={formData.hourly_pay || ''}
        onChange={(value) => handleFieldChange('hourly_pay', value)}
        type="number"
        min="0"
        step="0.01"
        placeholder="Enter hourly pay rate"
        required
      />

      <AvailabilitySelector
        availability={formData.availability}
        onAvailabilityChange={handleAvailabilityChange}
      />

      <Button onClick={handleSubmit} className="w-full">
        Add Staff Member
      </Button>
    </div>
  );
}