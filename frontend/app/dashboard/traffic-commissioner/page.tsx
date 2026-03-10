"use client";

import { ClientAction } from "@/service/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TrafficCommissionerPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ClientAction.getClients({ showPerPage: 1, pageNo: 1 })
      .then((res) => {
        if (res.status && res.data?.data?.length) {
          const firstClientId = res.data.data[0].client._id;
          router.replace(`/dashboard/traffic-commissioner/${firstClientId}`);
        } else {
          setError("No clients found. Please add a client first.");
        }
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
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
        <p className="text-muted-foreground">
          Loading Traffic Commissioner Communication...
        </p>
      </div>
    </div>
  );
}
