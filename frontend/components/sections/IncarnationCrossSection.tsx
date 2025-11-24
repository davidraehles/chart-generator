import { IncarnationCross } from "@/types/chart";
import { LABELS } from "@/utils/constants";

interface IncarnationCrossSectionProps {
  incarnationCross: IncarnationCross;
}

export default function IncarnationCrossSection({
  incarnationCross,
}: IncarnationCrossSectionProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-primary mb-3">
        {LABELS.yourIncarnationCross}
      </h3>
      <div className="space-y-2">
        <p className="text-xl font-bold text-accent">{incarnationCross.name}</p>
        <p className="text-secondary">
          ({incarnationCross.gates.join("/")})
        </p>
      </div>
    </div>
  );
}
