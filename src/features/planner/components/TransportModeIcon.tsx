import { Bus, Car, Plane, TrainFront } from "lucide-react";
import { TransportMode } from "../types";

const MODE_ICONS: Record<TransportMode, typeof Car> = {
  car: Car,
  bus: Bus,
  train: TrainFront,
  flight: Plane,
};

/** The icon for a transport leg's mode — one vocabulary across the planner. */
export default function TransportModeIcon({
  mode,
  size,
  className,
}: {
  mode: TransportMode;
  size?: number;
  className?: string;
}) {
  const Icon = MODE_ICONS[mode];
  return <Icon size={size} className={className} />;
}
