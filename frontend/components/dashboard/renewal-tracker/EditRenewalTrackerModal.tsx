"use client";

import { useMemo } from "react";
import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { UpdateRenewalTrackerInput } from "@/lib/renewal-tracker/renewal-tracker.types";
import { RenewalTrackerTableRow } from "./RenewalTrackerTable";

/** Zod schema for edit renewal tracker form */
const editRenewalTrackerSchema = z.object({
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

type EditRenewalTrackerForm = z.infer<typeof editRenewalTrackerSchema>;

interface PolicyProcedureOption {
  value: string;
  label: string;
  responsiblePerson: string;
}

interface EditRenewalTrackerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateRenewalTrackerInput) => Promise<void> | void;
  renewalTracker: RenewalTrackerTableRow | null;
  loading: boolean;
  policyProcedureOptions: PolicyProcedureOption[];
}

export default function EditRenewalTrackerModal({
  open,
  onOpenChange,
  onSubmit,
  renewalTracker,
  loading,
  policyProcedureOptions,
}: EditRenewalTrackerModalProps) {
  // Compute defaultValues using useMemo to avoid setState in useEffect
  const defaultValues = useMemo(() => {
    if (!renewalTracker) return {};

    // Convert date strings back to YYYY-MM-DD format for date inputs
    const parseDate = (dateStr: string) => {
      if (!dateStr || dateStr === "—") return "";
      // If already in YYYY-MM-DD format, return as is
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
      // Parse from display format (e.g., "3/10/2026")
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    };

    return {
      type: renewalTracker.type,
      item: renewalTracker.item,
      description:
        renewalTracker.description === "—" ? "" : renewalTracker.description,
      refOrPolicyNo: renewalTracker.refOrPolicyNoId || "",
      providerOrIssuer:
        renewalTracker.providerOrIssuer === "—"
          ? ""
          : renewalTracker.providerOrIssuer,
      startDate: parseDate(renewalTracker.startDate),
      expiryOrDueDate: parseDate(renewalTracker.expiryOrDueDate),
      reminderSet: renewalTracker.reminderSet === "Yes",
      reminderDate: "", // Not displayed in table, so we can't populate this
      notes: renewalTracker.notes === "—" ? "" : renewalTracker.notes,
    };
  }, [renewalTracker]);

  const fields: FieldConfig<EditRenewalTrackerForm>[] = [
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>Edit Renewal Tracker</DialogTitle>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : renewalTracker ? (
          <UniversalForm<EditRenewalTrackerForm>
            key={renewalTracker._id}
            title=""
            schema={editRenewalTrackerSchema}
            fields={fields}
            defaultValues={defaultValues}
            onSubmit={(data) => {
              const selectedPolicyId = data.refOrPolicyNo?.trim()
                ? data.refOrPolicyNo
                : undefined;

              onSubmit({
                ...data,
                refOrPolicyNo: selectedPolicyId,
                responsiblePerson: selectedPolicyId,
              });
            }}
            submitText="Update Renewal Tracker"
            setOpen={onOpenChange}
          />
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            No data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
