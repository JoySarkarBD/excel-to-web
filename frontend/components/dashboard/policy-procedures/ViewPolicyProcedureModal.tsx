"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PolicyProcedureRow } from "@/lib/policy-procedures/policy-procedure.types";
import { Loader2 } from "lucide-react";

interface ViewPolicyProcedureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policyProcedure: PolicyProcedureRow | null;
  loading: boolean;
}

function formatDate(value?: string | Date): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-GB", {
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

export default function ViewPolicyProcedureModal({
  open,
  onOpenChange,
  policyProcedure,
  loading,
}: ViewPolicyProcedureModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-primary text-xl font-bold">
          Policy Procedure Details
        </DialogTitle>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : policyProcedure ? (
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <DetailItem
              label="Policy Name"
              value={policyProcedure.policyName}
            />
            <DetailItem
              label="Policy Category"
              value={policyProcedure.policyCategory}
            />
            <DetailItem label="Type" value={policyProcedure.type} />
            <DetailItem
              label="Version Number"
              value={`v${policyProcedure.versionNumber}`}
            />
            <DetailItem
              label="Review Status"
              value={
                <span
                  className={
                    ["approved", "completed"].includes(
                      policyProcedure.reviewStatus.toLowerCase(),
                    )
                      ? "font-medium text-green-600"
                      : ["overdue", "rejected"].includes(
                            policyProcedure.reviewStatus.toLowerCase(),
                          )
                        ? "font-medium text-red-500"
                        : policyProcedure.reviewStatus.toLowerCase() ===
                            "pending"
                          ? "font-medium text-yellow-600"
                          : "font-medium"
                  }
                >
                  {policyProcedure.reviewStatus}
                </span>
              }
            />
            <DetailItem
              label="Responsible Person"
              value={policyProcedure.responsiblePerson}
            />
            <DetailItem
              label="Effective Date"
              value={formatDate(policyProcedure.effectiveDate)}
            />
            <DetailItem
              label="Last Review Date"
              value={formatDate(policyProcedure.lastReviewDate)}
            />
            <DetailItem
              label="Next Review Due"
              value={formatDate(policyProcedure.nextReviewDue)}
            />
            <DetailItem
              label="Review Frequency"
              value={
                policyProcedure.reviewFrequencyMonths
                  ? `${policyProcedure.reviewFrequencyMonths} months`
                  : "—"
              }
            />
            <div className="sm:col-span-2">
              <DetailItem
                label="File Locations"
                value={
                  policyProcedure.fileLocations?.length ? (
                    <ul className="list-disc list-inside space-y-0.5">
                      {policyProcedure.fileLocations.map((loc, i) => (
                        <li key={i}>{loc}</li>
                      ))}
                    </ul>
                  ) : (
                    "—"
                  )
                }
              />
            </div>
            <div className="sm:col-span-2">
              <DetailItem
                label="Notes / Actions Needed"
                value={policyProcedure.notesActionsNeeded || "—"}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No policy procedure data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
