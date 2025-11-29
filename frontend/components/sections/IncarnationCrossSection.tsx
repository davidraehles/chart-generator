import { IncarnationCross } from "@/types/chart";
import { LABELS } from "@/utils/constants";

interface IncarnationCrossSectionProps {
  incarnationCross: IncarnationCross;
}

export default function IncarnationCrossSection({
  incarnationCross,
}: IncarnationCrossSectionProps) {
  return (
    <div className="material-card bg-white">
      <h3 className="text-xl font-bold text-primary mb-3">
        {LABELS.yourIncarnationCross}
      </h3>
      <div className="space-y-3">
        <p className="text-2xl font-bold text-accent">{incarnationCross.name}</p>
        <p className="text-secondary font-medium">
          ({incarnationCross.gates.join("/")})
        </p>
      </div>
    </div>
  );
}
