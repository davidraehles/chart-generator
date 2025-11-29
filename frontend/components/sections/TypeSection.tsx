import { TypeInfo } from "@/types/chart";
import { LABELS } from "@/utils/constants";

interface TypeSectionProps {
  type: TypeInfo;
}

export default function TypeSection({ type }: TypeSectionProps) {
  return (
    <div className="material-card bg-white">
      <h3 className="text-xl font-bold text-primary mb-3">{LABELS.yourType}</h3>
      <div className="space-y-3">
        <p className="text-3xl font-bold text-accent">{type.label}</p>
        <p className="text-text leading-relaxed">{type.shortDescription}</p>
      </div>
    </div>
  );
}
