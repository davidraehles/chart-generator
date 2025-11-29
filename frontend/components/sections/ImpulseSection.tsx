import { LABELS } from "@/utils/constants";

interface ImpulseSectionProps {
  impulse: string;
}

export default function ImpulseSection({ impulse }: ImpulseSectionProps) {
  return (
    <div className="p-6 bg-surface rounded-lg border-l-4 border-accent shadow-sm">
      <h3 className="text-xl font-bold text-primary mb-3">{LABELS.yourImpulse}</h3>
      <p className="text-lg text-text italic leading-relaxed">{impulse}</p>
    </div>
  );
}
