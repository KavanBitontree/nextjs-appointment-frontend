import { z } from "zod";

export const doctorSignupSchema = z
  .object({
    email: z.string().email("Enter a valid email"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Add at least one uppercase letter")
      .regex(/[0-9]/, "Add at least one number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Add one special character"),

    confirm_password: z.string(),

    name: z.string().min(2, "Name is required"),
    speciality: z.string().min(2, "Speciality is required"),

    opd_fees: z.number().positive("OPD fees must be greater than 0"),
    minimum_slot_duration: z.number().min(0.25, "Slot duration is required"),

    // 📍 LOCATION (NEW)
    address: z.string().min(5, "Clinic address is required"),
    latitude: z
      .number()
      .min(-90, "Invalid latitude")
      .max(90, "Invalid latitude"),
    longitude: z
      .number()
      .min(-180, "Invalid longitude")
      .max(180, "Invalid longitude"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type DoctorSignupFormData = z.infer<typeof doctorSignupSchema>;
