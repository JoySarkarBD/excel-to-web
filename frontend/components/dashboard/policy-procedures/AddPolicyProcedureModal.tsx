"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CreatePolicyProcedureInput } from "@/lib/policy-procedures/policy-procedure.types";

const addPolicyProcedureSchema = z.object({
  policyName: z
    .string()
    .min(1, "Policy name is required")
    .max(300, "Policy name must not exceed 300 characters"),
  policyCategory: z
    .string()
    .min(1, "Policy category is required")
    .max(200, "Policy category must not exceed 200 characters"),
  fileLocations: z
    .string()
    .min(1, "At least one file location is required"),
  versionNumber: z.coerce
    .number()
    .min(0, "Version number must be 0 or more"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  responsiblePerson: z
    .string()
    .min(1, "Responsible person is required")
    .max(200, "Responsible person must not exceed 200 characters"),
  reviewStatus: z.string().min(1, "Review status is required"),
  type: z.string().min(1, "Type is required"),
  reviewFrequencyMonths: z.coerce
    .number()
    .int()
    .positive("Must be a positive integer")
    .optional()
    .or(z.literal("")),
  lastReviewDate: z.string().optional(),
  notesActionsNeeded: z
    .string()
    .max(2000, "Notes must not exceed 2000 characters")
    .optional(),
  nextReviewDue: z.string().optional(),
});

type AddPolicyProcedureForm = z.infer<typeof addPolicyProcedureSchema>;

interface AddPolicyProcedureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePolicyProcedureInput) => Promise<void> | void;
  standAloneId: string;
}

export default function AddPolicyProcedureModal({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
}: AddPolicyProcedureModalProps) {
  const fields: FieldConfig<AddPolicyProcedureForm>[] = [
    {
      name: "policyName",
      label: "Policy Name",
      type: "text",
      placeholder: "Enter policy name",
      required: true,
    },
    {
      name: "policyCategory",
      label: "Policy Category",
      type: "text",
      placeholder: "Enter policy category",
      required: true,
    },
    {
      name: "fileLocations",
      label: "File Locations",
      type: "textarea",
      placeholder: "Enter file locations (one per line)",
      required: true,
    },
    {
      name: "versionNumber",
      label: "Version Number",
      type: "number",
      placeholder: "0",
      required: true,
    },
    {
      name: "effectiveDate",
      label: "Effective Date",
      type: "date",
      required: true,
    },
    {
      name: "responsiblePerson",
      label: "Responsible Person",
      type: "text",
      placeholder: "Name of responsible person",
      required: true,
    },
    {
      name: "reviewStatus",
      label: "Review Status",
      type: "text",
      placeholder: "e.g. Pending, Approved, Overdue",
      required: true,
    },
    {
      name: "type",
      label: "Type",
      type: "text",
      placeholder: "Enter policy type",
      required: true,
    },
    {
      name: "reviewFrequencyMonths",
      label: "Review Frequency (Months)",
      type: "number",
      placeholder: "e.g. 12",
    },
    {
      name: "lastReviewDate",
      label: "Last Review Date",
      type: "date",
    },
    {
      name: "nextReviewDue",
      label: "Next Review Due",
      type: "date",
    },
    {
      name: "notesActionsNeeded",
      label: "Notes / Actions Needed",
      type: "textarea",
      placeholder: "Any additional notes or actions needed",
    },
  ];

  const handleSubmit = async (data: AddPolicyProcedureForm) => {
    const fileLocations = data.fileLocations
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const payload: CreatePolicyProcedureInput = {
      policyName: data.policyName,
      policyCategory: data.policyCategory,
      fileLocations,
      versionNumber: data.versionNumber,
      effectiveDate: new Date(data.effectiveDate).toISOString(),
      responsiblePerson: data.responsiblePerson,
      reviewStatus: data.reviewStatus,
      type: data.type,
      standAloneId,
      ...(data.reviewFrequencyMonths &&
        data.reviewFrequencyMonths !== ("" as unknown) && {
          reviewFrequencyMonths: Number(data.reviewFrequencyMonths),
        }),
      ...(data.lastReviewDate && {
        lastReviewDate: new Date(data.lastReviewDate).toISOString(),
      }),
      ...(data.nextReviewDue && {
        nextReviewDue: new Date(data.nextReviewDue).toISOString(),
      }),
      ...(data.notesActionsNeeded && {
        notesActionsNeeded: data.notesActionsNeeded,
      }),
    };
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogTitle className="text-primary text-xl font-bold mb-4">
          Add New Policy Procedure
        </DialogTitle>

        <UniversalForm<AddPolicyProcedureForm>
          title="Policy Procedure Details"
          fields={fields}
          schema={addPolicyProcedureSchema}
          defaultValues={{
            policyName: "",
            policyCategory: "",
            fileLocations: "",
            versionNumber: 0,
            effectiveDate: "",
            responsiblePerson: "",
            reviewStatus: "",
            type: "",
            reviewFrequencyMonths: undefined,
            lastReviewDate: "",
            notesActionsNeeded: "",
            nextReviewDue: "",
          }}
          onSubmit={handleSubmit}
          submitText="Create Policy Procedure"
          setOpen={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
