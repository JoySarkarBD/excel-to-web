"use client";

import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateClientInput } from "@/lib/clients/client.types";

/** Zod schema matching backend's zodCreateClientSchema */
const createClientSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long")
    .trim(),
  email: z.email("Invalid email format").trim().toLowerCase(),
});

type CreateClientForm = z.infer<typeof createClientSchema>;

const fields: FieldConfig<CreateClientForm>[] = [
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "Enter full name",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter email address",
    required: true,
  },
];

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateClientInput) => Promise<void> | void;
  loading?: boolean;
}

export default function AddClientModal({
  open,
  onOpenChange,
  onSubmit,
}: AddClientModalProps) {
  const handleSubmit = async (data: CreateClientForm) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        {/* Hidden title satisfies Radix accessibility requirement — visible title is rendered by UniversalForm */}
        <DialogTitle className="sr-only">Add New Client</DialogTitle>
        <UniversalForm<CreateClientForm>
          title="Add New Client"
          fields={fields}
          schema={createClientSchema}
          defaultValues={{ fullName: "", email: "" }}
          onSubmit={handleSubmit}
          submitText="Create Client"
          setOpen={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
