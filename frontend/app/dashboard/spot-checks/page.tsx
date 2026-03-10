"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClientAction } from "@/service/client";

/**
 * Landing page for /dashboard/spot-checks (no standAloneId).
 * Fetches the client list and redirects to the first client's spot-checks page
 * so that the sidebar auto-selects the first client.
 */
export default function SpotChecksRedirectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ClientAction.getClients({ showPerPage: 1, pageNo: 1 })
      .then((res) => {
        if (res.status && res.data?.data?.length) {
          const firstClientId = res.data.data[0].client._id;
          router.replace(`/dashboard/spot-checks/${firstClientId}`);
        } else {
          setError("No clients found. Please add a client first.");
        }
      })
      .catch(() => {
        setError("Failed to load clients. Please try again.");
      });
  }, [router]);

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-10">
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading spot checks...</p>
      </div>
    </div>
  );
}
