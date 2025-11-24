import { TypeInfo } from "@/types/chart";
import { LABELS } from "@/utils/constants";

interface TypeSectionProps {
  type: TypeInfo;
}

export default function TypeSection({ type }: TypeSectionProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-primary mb-3">{LABELS.yourType}</h3>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-accent">{type.label}</p>
        <p className="text-secondary leading-relaxed">{type.shortDescription}</p>
      </div>
    </div>
  );
}
