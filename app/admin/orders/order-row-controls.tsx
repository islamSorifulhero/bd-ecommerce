"use client";

import { useState, useTransition } from "react";
import { Truck } from "lucide-react";
import { updateOrderStatus, dispatchOrder } from "./actions";

interface ControlsProps {
  orderId: string;
  currentStatus: string;
  statusOptions: string[];
  hasShipment: boolean;
}

function OrderRowControls({ orderId, currentStatus, statusOptions }: ControlsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string) => {
    setStatus(value);
    startTransition(() => {
      updateOrderStatus(orderId, value);
    });
  };

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value)}
      className="border rounded-lg px-2 py-1 text-xs"
    >
      {statusOptions.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

function DispatchButton({
  orderId,
  hasShipment,
}: {
  orderId: string;
  hasShipment: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (hasShipment) {
    return <span className="text-xs text-gray-400">বুক করা হয়েছে</span>;
  }

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => dispatchOrder(orderId))}
      className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      <Truck className="w-3 h-3" />
      {isPending ? "বুকিং হচ্ছে..." : "কুরিয়ার বুক করুন"}
    </button>
  );
}

OrderRowControls.DispatchButton = DispatchButton;

export default OrderRowControls;
