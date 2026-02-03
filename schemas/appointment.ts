import { z } from "zod";

export const appointmentFormSchema = z.object({
  doctor_id: z.number().int().positive("Doctor ID is required"),
  slot_id: z.number().int().positive("Please select a time slot"),
  report: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => {
        if (!file) return true;
        const validTypes = [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/jpg",
        ];
        return validTypes.includes(file.type);
      },
      {
        message: "Report must be a PDF or image file (JPEG, PNG)",
      },
    )
    .refine(
      (file) => {
        if (!file) return true;
        const maxSize = 5 * 1024 * 1024; // 5MB
        return file.size <= maxSize;
      },
      {
        message: "File size must be less than 5MB",
      },
    ),
});

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

// For server-side slot data
export const slotSchema = z.object({
  id: z.number(),
  doctor_id: z.number(),
  date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  status: z.enum(["FREE", "BOOKED", "BLOCKED"]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Slot = z.infer<typeof slotSchema>;

export const doctorSlotsResponseSchema = z.object({
  total: z.number(),
  slots: z.array(slotSchema),
});

export type DoctorSlotsResponse = z.infer<typeof doctorSlotsResponseSchema>;
