"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RenewalTrackerTableRow } from "./RenewalTrackerTable";
import { Loader2 } from "lucide-react";

interface ViewRenewalTrackerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renewalTracker: RenewalTrackerTableRow | null;
  loading: boolean;
}

export default function ViewRenewalTrackerModal({
  open,
  onOpenChange,
  renewalTracker,
  loading,
}: ViewRenewalTrackerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
        <DialogTitle>View Renewal Tracker</DialogTitle>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        ) : renewalTracker ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Type
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {renewalTracker.type}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Item
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {renewalTracker.item}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {renewalTracker.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Ref/Policy No
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {renewalTracker.refOrPolicyNo}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Responsible Person
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {renewalTracker.responsiblePerson}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Provider/Issuer
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {renewalTracker.providerOrIssuer}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {renewalTracker.status}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {renewalTracker.startDate}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Expiry/Due Date
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {renewalTracker.expiryOrDueDate}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Reminder Set
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {renewalTracker.reminderSet}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <p className="mt-1 text-sm text-gray-900">
                {renewalTracker.notes}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            No data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
