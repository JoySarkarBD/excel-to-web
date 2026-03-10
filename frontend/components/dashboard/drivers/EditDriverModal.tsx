"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DriverRow,
  UpdateDriverInput,
  CheckStatus,
} from "@/lib/drivers/driver.types";
import { Loader2 } from "lucide-react";

/** Zod schema for edit — all fields optional but with validation when present */
const editDriverSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name is too long")
    .trim(),
  licenseNumber: z
    .string()
    .min(2, "License number must be at least 2 characters")
    .max(80, "License number is too long")
    .trim(),
  postCode: z
    .string()
    .min(2, "Post code must be at least 2 characters")
    .max(20, "Post code is too long")
    .trim(),
  niNumber: z
    .string()
    .min(2, "NI number must be at least 2 characters")
    .max(30, "NI number is too long")
    .trim(),
  nextCheckDueDate: z.string().min(1, "Next check due date is required"),
  points: z.coerce.number().int().min(0, "Points must be 0 or more"),
  checkFrequencyDays: z.coerce
    .number()
    .int()
    .min(0, "Check frequency must be 0 or more"),
  employed: z.coerce.boolean(),
  licenseExpiry: z.string().optional(),
  licenseExpiryDTC: z.string().optional(),
  cpcExpiry: z.string().optional(),
  lastChecked: z.string().optional(),
  checkStatus: z.nativeEnum(CheckStatus).optional(),
});

type EditDriverForm = z.infer<typeof editDriverSchema>;

const fields: FieldConfig<EditDriverForm>[] = [
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "Enter full name",
    required: true,
  },
  {
    name: "licenseNumber",
    label: "License Number",
    type: "text",
    placeholder: "Enter license number",
    required: true,
  },
  {
    name: "postCode",
    label: "Post Code",
    type: "text",
    placeholder: "Enter post code",
    required: true,
  },
  {
    name: "niNumber",
    label: "NI Number",
    type: "text",
    placeholder: "Enter NI number",
    required: true,
  },
  {
    name: "nextCheckDueDate",
    label: "Next Check Due Date",
    type: "date",
    required: true,
  },
  {
    name: "points",
    label: "Points",
    type: "number",
    placeholder: "0",
    required: true,
  },
  {
    name: "checkFrequencyDays",
    label: "Check Frequency (Days)",
    type: "number",
    placeholder: "0",
    required: true,
  },
  {
    name: "employed",
    label: "Employed",
    type: "select",
    options: [
      { label: "Yes", value: "true" },
      { label: "No", value: "false" },
    ],
    required: true,
  },
  {
    name: "licenseExpiry",
    label: "License Expiry",
    type: "date",
  },
  {
    name: "licenseExpiryDTC",
    label: "License Expiry (DTC)",
    type: "date",
  },
  {
    name: "cpcExpiry",
    label: "CPC Expiry",
    type: "date",
  },
  {
    name: "lastChecked",
    label: "Last Checked",
    type: "date",
  },
  {
    name: "checkStatus",
    label: "Check Status",
    type: "select",
    options: [
      { label: "Okay", value: CheckStatus.OKAY },
      { label: "Due", value: CheckStatus.DUE },
    ],
  },
];

/** Format a date string to YYYY-MM-DD for form defaults */
function toDateInput(value?: string): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

interface EditDriverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateDriverInput) => Promise<void> | void;
  driver: DriverRow | null;
  loading: boolean;
}

export default function EditDriverModal({
  open,
  onOpenChange,
  onSubmit,
  driver,
  loading,
}: EditDriverModalProps) {
  const handleSubmit = async (data: EditDriverForm) => {
    const payload: UpdateDriverInput = {
      fullName: data.fullName,
      licenseNumber: data.licenseNumber,
      postCode: data.postCode,
      niNumber: data.niNumber,
      nextCheckDueDate: data.nextCheckDueDate,
      points: data.points,
      checkFrequencyDays: data.checkFrequencyDays,
      employed: data.employed,
      ...(data.licenseExpiry && { licenseExpiry: data.licenseExpiry }),
      ...(data.licenseExpiryDTC && {
        licenseExpiryDTC: data.licenseExpiryDTC,
      }),
      ...(data.cpcExpiry && { cpcExpiry: data.cpcExpiry }),
      ...(data.lastChecked && { lastChecked: data.lastChecked }),
      ...(data.checkStatus && { checkStatus: data.checkStatus }),
    };
    await onSubmit(payload);
  };

  if (loading || !driver) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Edit Driver</DialogTitle>
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Edit Driver</DialogTitle>
        <UniversalForm<EditDriverForm>
          title="Edit Driver"
          fields={fields}
          schema={editDriverSchema}
          defaultValues={{
            fullName: driver.fullName,
            licenseNumber: driver.licenseNumber,
            postCode: driver.postCode,
            niNumber: driver.niNumber,
            nextCheckDueDate: toDateInput(driver.nextCheckDueDate),
            points: driver.points,
            checkFrequencyDays: driver.checkFrequencyDays,
            employed: driver.employed,
            licenseExpiry: toDateInput(driver.licenseExpiry),
            licenseExpiryDTC: toDateInput(driver.licenseExpiryDTC),
            cpcExpiry: toDateInput(driver.cpcExpiry),
            lastChecked: toDateInput(driver.lastChecked),
            checkStatus: driver.checkStatus,
          }}
          onSubmit={handleSubmit}
          submitText="Update Driver"
          setOpen={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
