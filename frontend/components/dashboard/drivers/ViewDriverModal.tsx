"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { DriverRow } from "@/lib/drivers/driver.types";
import { Loader2 } from "lucide-react";

interface ViewDriverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: DriverRow | null;
  loading: boolean;
}

function formatDate(value?: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

export default function ViewDriverModal({
  open,
  onOpenChange,
  driver,
  loading,
}: ViewDriverModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-primary text-xl font-bold">
          Driver Details
        </DialogTitle>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : driver ? (
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <DetailItem label="Full Name" value={driver.fullName} />
            <DetailItem label="License Number" value={driver.licenseNumber} />
            <DetailItem label="NI Number" value={driver.niNumber} />
            <DetailItem label="Post Code" value={driver.postCode} />
            <DetailItem label="Points" value={driver.points} />
            <DetailItem
              label="Employed"
              value={
                <span
                  className={
                    driver.employed
                      ? "font-medium text-green-600"
                      : "font-medium text-red-500"
                  }
                >
                  {driver.employed ? "Yes" : "No"}
                </span>
              }
            />
            <DetailItem label="Check Status" value={driver.checkStatus || "—"} />
            <DetailItem
              label="Check Frequency (Days)"
              value={driver.checkFrequencyDays}
            />
            <DetailItem
              label="Next Check Due Date"
              value={formatDate(driver.nextCheckDueDate)}
            />
            <DetailItem
              label="Last Checked"
              value={formatDate(driver.lastChecked)}
            />
            <DetailItem
              label="License Expiry"
              value={formatDate(driver.licenseExpiry)}
            />
            <DetailItem
              label="License Expiry (DTC)"
              value={formatDate(driver.licenseExpiryDTC)}
            />
            <DetailItem
              label="CPC Expiry"
              value={formatDate(driver.cpcExpiry)}
            />
            <DetailItem
              label="Endorsement Codes"
              value={
                driver.endorsementCodes?.length
                  ? driver.endorsementCodes.join(", ")
                  : "—"
              }
            />
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">No driver data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
