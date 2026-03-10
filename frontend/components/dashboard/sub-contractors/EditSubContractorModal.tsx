"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import {
  SubContractorRow,
  UpdateSubContractorInput,
} from "@/lib/sub-contractors/sub-contractor.types";

/** Zod schema for edit sub-contractor form */
const editSubContractorSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must not exceed 200 characters"),
  contactPerson: z
    .string()
    .min(1, "Contact person is required")
    .max(150, "Contact person must not exceed 150 characters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(30, "Phone number must not exceed 30 characters"),
  email: z.string().email("Please provide a valid email address"),
  insurancePolicyNumber: z
    .string()
    .min(1, "Insurance policy number is required")
    .max(100, "Insurance policy number must not exceed 100 characters"),
  insuranceExpiryDate: z.string().min(1, "Insurance expiry date is required"),
  startDateOfAgreement: z
    .string()
    .min(1, "Start date of agreement is required"),
  checkedBy: z
    .string()
    .min(1, "Checked by is required")
    .max(150, "Checked by must not exceed 150 characters"),
  hiabAvailable: z.coerce.boolean(),
  gitPolicyNumber: z.string().optional(),
  gitExpiryDate: z.string().optional(),
  gitCoverPerTonne: z.coerce
    .number()
    .min(0, "GIT cover per tonne must be 0 or more")
    .optional(),
  otherCapabilities: z.string().optional(),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5")
    .optional(),
  notes: z.string().optional(),
});

type EditSubContractorForm = z.infer<typeof editSubContractorSchema>;

/** Format a date string/Date to YYYY-MM-DD for form defaults */
function toDateInput(value?: string | Date): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

interface EditSubContractorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateSubContractorInput) => Promise<void> | void;
  subContractor: SubContractorRow | null;
  loading: boolean;
}

export default function EditSubContractorModal({
  open,
  onOpenChange,
  onSubmit,
  subContractor,
  loading,
}: EditSubContractorModalProps) {
  const fields: FieldConfig<EditSubContractorForm>[] = [
    {
      name: "companyName",
      label: "Company Name",
      type: "text",
      placeholder: "Enter company name",
      required: true,
    },
    {
      name: "contactPerson",
      label: "Contact Person",
      type: "text",
      placeholder: "Primary contact name",
      required: true,
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
      placeholder: "Contact phone number",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Contact email",
      required: true,
    },
    {
      name: "insurancePolicyNumber",
      label: "Insurance Policy Number",
      type: "text",
      placeholder: "Enter policy number",
      required: true,
    },
    {
      name: "insuranceExpiryDate",
      label: "Insurance Expiry Date",
      type: "date",
      required: true,
    },
    {
      name: "startDateOfAgreement",
      label: "Start Date of Agreement",
      type: "date",
      required: true,
    },
    {
      name: "checkedBy",
      label: "Checked By",
      type: "text",
      placeholder: "Name of person who checked",
      required: true,
    },
    {
      name: "hiabAvailable",
      label: "HIAB Available",
      type: "select",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
      required: true,
    },
    {
      name: "gitPolicyNumber",
      label: "GIT Policy Number",
      type: "text",
      placeholder: "Goods In Transit policy number",
    },
    {
      name: "gitExpiryDate",
      label: "GIT Expiry Date",
      type: "date",
    },
    {
      name: "gitCoverPerTonne",
      label: "GIT Cover Per Tonne",
      type: "number",
      placeholder: "0",
    },
    {
      name: "otherCapabilities",
      label: "Other Capabilities",
      type: "textarea",
      placeholder: "Other capabilities / services",
    },
    {
      name: "rating",
      label: "Rating (1-5)",
      type: "number",
      placeholder: "1 to 5",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Any additional notes",
    },
  ];

  const handleSubmit = async (data: EditSubContractorForm) => {
    const payload: UpdateSubContractorInput = {
      companyName: data.companyName,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      insurancePolicyNumber: data.insurancePolicyNumber,
      insuranceExpiryDate: new Date(data.insuranceExpiryDate).toISOString(),
      startDateOfAgreement: new Date(data.startDateOfAgreement).toISOString(),
      checkedBy: data.checkedBy,
      hiabAvailable: data.hiabAvailable,
      ...(data.gitPolicyNumber && { gitPolicyNumber: data.gitPolicyNumber }),
      ...(data.gitExpiryDate && {
        gitExpiryDate: new Date(data.gitExpiryDate).toISOString(),
      }),
      ...(data.gitCoverPerTonne !== undefined &&
        data.gitCoverPerTonne > 0 && {
          gitCoverPerTonne: data.gitCoverPerTonne,
        }),
      ...(data.otherCapabilities && {
        otherCapabilities: data.otherCapabilities,
      }),
      ...(data.rating && { rating: data.rating }),
      ...(data.notes && { notes: data.notes }),
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
          Edit Subcontractor
        </DialogTitle>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : subContractor ? (
          <UniversalForm<EditSubContractorForm>
            title="Subcontractor Details"
            fields={fields}
            schema={editSubContractorSchema}
            defaultValues={{
              companyName: subContractor.companyName || "",
              contactPerson: subContractor.contactPerson || "",
              phone: subContractor.phone || "",
              email: subContractor.email || "",
              insurancePolicyNumber:
                subContractor.insurancePolicyNumber || "",
              insuranceExpiryDate: toDateInput(
                subContractor.insuranceExpiryDate,
              ),
              startDateOfAgreement: toDateInput(
                subContractor.startDateOfAgreement,
              ),
              checkedBy: subContractor.checkedBy || "",
              hiabAvailable: subContractor.hiabAvailable ?? false,
              gitPolicyNumber: subContractor.gitPolicyNumber || "",
              gitExpiryDate: toDateInput(subContractor.gitExpiryDate),
              gitCoverPerTonne: subContractor.gitCoverPerTonne ?? undefined,
              otherCapabilities: subContractor.otherCapabilities || "",
              rating: subContractor.rating ?? undefined,
              notes: subContractor.notes || "",
            }}
            onSubmit={handleSubmit}
            submitText="Update Subcontractor"
            setOpen={onOpenChange}
          />
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No subcontractor data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
