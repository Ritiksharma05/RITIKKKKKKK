/**
 * components/OrderTracker.tsx
 * Flipkart-style animated delivery stepper component.
 * Shows completed steps in green, current step with a pulse animation, future steps in grey.
 */
'use client';

import { CheckCircle, Clock, Package, Truck, Bike, Circle } from 'lucide-react';

const STAGES = [
  { key: 'orderPlaced',    label: 'Order Placed',      icon: CheckCircle, status: 'Order Placed' },
  { key: 'processing',     label: 'Processing',         icon: Clock,       status: 'Processing' },
  { key: 'packed',         label: 'Packed',             icon: Package,     status: 'Packed' },
  { key: 'shipped',        label: 'Shipped',            icon: Truck,       status: 'Shipped' },
  { key: 'outForDelivery', label: 'Out for Delivery',   icon: Bike,        status: 'Out for Delivery' },
  { key: 'delivered',      label: 'Delivered',          icon: CheckCircle, status: 'Delivered' },
];

interface OrderTrackerProps {
  deliveryStatus: string;
  timeline: Record<string, string>;
  estimatedDelivery: string;
  trackingNumber?: string;
}

export default function OrderTracker({ deliveryStatus, timeline, estimatedDelivery, trackingNumber }: OrderTrackerProps) {
  const currentIndex = STAGES.findIndex((s) => s.status === deliveryStatus);

  return (
    <div className="w-full">
      {/* Estimated delivery banner */}
      <div className="mb-8 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 p-4">
        <p className="text-sm text-orange-400 font-medium uppercase tracking-wider mb-1">Estimated Delivery</p>
        <p className="text-2xl font-bold text-white">{new Date(estimatedDelivery).toDateString()}</p>
        {trackingNumber && (
          <p className="text-sm text-gray-400 mt-1">Tracking: <span className="text-orange-400 font-mono">{trackingNumber}</span></p>
        )}
      </div>

      {/* Stepper */}
      <div className="relative">
        {STAGES.map((stage, index) => {
          const isDone    = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture  = index > currentIndex;
          const Icon      = stage.icon;
          const timestamp = timeline[stage.key];
          const isLast    = index === STAGES.length - 1;

          return (
            <div key={stage.key} className="flex items-start gap-4">
              {/* Icon + connector */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500
                    ${isDone    ? 'bg-green-500 shadow-lg shadow-green-500/40'         : ''}
                    ${isCurrent ? 'bg-orange-500 shadow-lg shadow-orange-500/40 animate-pulse' : ''}
                    ${isFuture  ? 'bg-gray-700 border-2 border-gray-600'               : ''}
                  `}
                >
                  {isDone || isCurrent ? (
                    <Icon size={20} className="text-white" />
                  ) : (
                    <Circle size={20} className="text-gray-500" />
                  )}
                </div>
                {/* Vertical connector line */}
                {!isLast && (
                  <div
                    className={`w-0.5 h-12 transition-all duration-700 ${
                      isDone ? 'bg-green-500' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>

              {/* Stage info */}
              <div className="pb-12 flex-1">
                <p
                  className={`font-semibold text-base ${
                    isDone    ? 'text-green-400' :
                    isCurrent ? 'text-orange-400' :
                                'text-gray-500'
                  }`}
                >
                  {stage.label}
                </p>
                {timestamp && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(timestamp).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                )}
                {isCurrent && !timestamp && (
                  <p className="text-xs text-orange-400/70 mt-1 animate-pulse">In progress...</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
