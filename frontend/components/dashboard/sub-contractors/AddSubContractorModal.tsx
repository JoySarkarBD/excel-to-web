"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CreateSubContractorInput } from "@/lib/sub-contractors/sub-contractor.types";

/** Zod schema — all required and optional fields for adding a sub-contractor */
const addSubContractorSchema = z.object({
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

type AddSubContractorForm = z.infer<typeof addSubContractorSchema>;

interface AddSubContractorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSubContractorInput) => Promise<void> | void;
  standAloneId: string;
}

export default function AddSubContractorModal({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
}: AddSubContractorModalProps) {
  const fields: FieldConfig<AddSubContractorForm>[] = [
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

  const handleSubmit = async (data: AddSubContractorForm) => {
    const payload: CreateSubContractorInput = {
      companyName: data.companyName,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      insurancePolicyNumber: data.insurancePolicyNumber,
      insuranceExpiryDate: new Date(data.insuranceExpiryDate).toISOString(),
      startDateOfAgreement: new Date(data.startDateOfAgreement).toISOString(),
      checkedBy: data.checkedBy,
      hiabAvailable: data.hiabAvailable,
      standAloneId,
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
          Add New Subcontractor
        </DialogTitle>

        <UniversalForm<AddSubContractorForm>
          title="Subcontractor Details"
          fields={fields}
          schema={addSubContractorSchema}
          defaultValues={{
            companyName: "",
            contactPerson: "",
            phone: "",
            email: "",
            insurancePolicyNumber: "",
            insuranceExpiryDate: "",
            startDateOfAgreement: "",
            checkedBy: "",
            hiabAvailable: false,
            gitPolicyNumber: "",
            gitExpiryDate: "",
            gitCoverPerTonne: undefined,
            otherCapabilities: "",
            rating: undefined,
            notes: "",
          }}
          onSubmit={handleSubmit}
          submitText="Create Subcontractor"
          setOpen={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
