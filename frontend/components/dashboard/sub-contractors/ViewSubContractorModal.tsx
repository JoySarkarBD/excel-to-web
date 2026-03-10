"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SubContractorRow } from "@/lib/sub-contractors/sub-contractor.types";
import { Loader2 } from "lucide-react";

interface ViewSubContractorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subContractor: SubContractorRow | null;
  loading: boolean;
}

function formatDate(value?: string | Date): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className="text-foreground text-sm">{value || "—"}</span>
    </div>
  );
}

export default function ViewSubContractorModal({
  open,
  onOpenChange,
  subContractor,
  loading,
}: ViewSubContractorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-primary text-xl font-bold">
          Subcontractor Details
        </DialogTitle>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : subContractor ? (
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <DetailItem
              label="Company Name"
              value={subContractor.companyName}
            />
            <DetailItem
              label="Contact Person"
              value={subContractor.contactPerson}
            />
            <DetailItem label="Phone" value={subContractor.phone} />
            <DetailItem label="Email" value={subContractor.email} />
            <DetailItem
              label="Insurance Policy Number"
              value={subContractor.insurancePolicyNumber}
            />
            <DetailItem
              label="Insurance Expiry Date"
              value={formatDate(subContractor.insuranceExpiryDate)}
            />
            <DetailItem
              label="Start Date of Agreement"
              value={formatDate(subContractor.startDateOfAgreement)}
            />
            <DetailItem label="Checked By" value={subContractor.checkedBy} />
            <DetailItem
              label="HIAB Available"
              value={
                <span
                  className={
                    subContractor.hiabAvailable
                      ? "font-medium text-green-600"
                      : "font-medium text-red-500"
                  }
                >
                  {subContractor.hiabAvailable ? "Yes" : "No"}
                </span>
              }
            />
            <DetailItem
              label="GIT Policy Number"
              value={subContractor.gitPolicyNumber || "—"}
            />
            <DetailItem
              label="GIT Expiry Date"
              value={formatDate(subContractor.gitExpiryDate)}
            />
            <DetailItem
              label="GIT Cover Per Tonne"
              value={
                subContractor.gitCoverPerTonne !== undefined
                  ? `£${subContractor.gitCoverPerTonne}`
                  : "—"
              }
            />
            <DetailItem
              label="Other Capabilities"
              value={subContractor.otherCapabilities || "—"}
            />
            <DetailItem
              label="Rating"
              value={
                subContractor.rating ? `${subContractor.rating}/5` : "—"
              }
            />
            <DetailItem
              label="Notes"
              value={subContractor.notes || "—"}
            />
          </div>
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
