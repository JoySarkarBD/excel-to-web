"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CreateRenewalTrackerInput } from "@/lib/renewal-tracker/renewal-tracker.types";

/** Zod schema for add renewal tracker form */
const addRenewalTrackerSchema = z.object({
  type: z.string().min(1, "Type is required").max(120, "Type is too long"),
  item: z.string().min(1, "Item is required").max(200, "Item is too long"),
  description: z.string().optional(),
  refOrPolicyNo: z.string().optional(),
  providerOrIssuer: z.string().optional(),
  startDate: z.string().optional(),
  expiryOrDueDate: z.string().optional(),
  reminderSet: z.coerce.boolean().optional(),
  reminderDate: z.string().optional(),
  notes: z.string().optional(),
});

type AddRenewalTrackerForm = z.infer<typeof addRenewalTrackerSchema>;

interface PolicyProcedureOption {
  value: string;
  label: string;
  responsiblePerson: string;
}

interface AddRenewalTrackerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRenewalTrackerInput) => Promise<void> | void;
  standAloneId: string;
  policyProcedureOptions: PolicyProcedureOption[];
}

export default function AddRenewalTrackerModal({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
  policyProcedureOptions,
}: AddRenewalTrackerModalProps) {
  const fields: FieldConfig<AddRenewalTrackerForm>[] = [
    {
      name: "type",
      label: "Type",
      type: "text",
      placeholder: "e.g. License, Insurance, Certification",
      required: true,
    },
    {
      name: "item",
      label: "Item",
      type: "text",
      placeholder: "e.g. Driver License, Vehicle Insurance",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter description (optional)",
    },
    {
      name: "refOrPolicyNo",
      label: "Ref/Policy No",
      type: "select",
      placeholder: "Select policy procedure",
      options: policyProcedureOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    },
    {
      name: "providerOrIssuer",
      label: "Provider/Issuer",
      type: "text",
      placeholder: "e.g. DVLA, Insurance Company",
    },
    {
      name: "startDate",
      label: "Start Date",
      type: "date",
    },
    {
      name: "expiryOrDueDate",
      label: "Expiry/Due Date",
      type: "date",
    },
    {
      name: "reminderSet",
      label: "Set Reminder",
      type: "checkbox",
    },
    {
      name: "reminderDate",
      label: "Reminder Date",
      type: "date",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Enter additional notes (optional)",
    },
  ];

  const handleFormSubmit = async (data: AddRenewalTrackerForm) => {
    const selectedPolicyId = data.refOrPolicyNo?.trim()
      ? data.refOrPolicyNo
      : undefined;

    await onSubmit({
      ...data,
      refOrPolicyNo: selectedPolicyId,
      responsiblePerson: selectedPolicyId,
      standAloneId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>Add Renewal Tracker</DialogTitle>
        <UniversalForm<AddRenewalTrackerForm>
          title=""
          schema={addRenewalTrackerSchema}
          fields={fields}
          onSubmit={handleFormSubmit}
          submitText="Add Renewal Tracker"
          setOpen={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
