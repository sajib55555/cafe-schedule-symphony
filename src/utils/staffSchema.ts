import { z } from "zod";

export const staffFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  hourly_pay: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Hourly pay must be a positive number",
  }),
});

export type StaffFormData = z.infer<typeof staffFormSchema>;