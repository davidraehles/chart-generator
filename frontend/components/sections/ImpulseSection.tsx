import { LABELS } from "@/utils/constants";

interface ImpulseSectionProps {
  impulse: string;
}

export default function ImpulseSection({ impulse }: ImpulseSectionProps) {
  return (
    <div className="p-6 bg-accent bg-opacity-5 rounded-lg border-l-4 border-accent">
      <h3 className="text-lg font-semibold text-primary mb-3">{LABELS.yourImpulse}</h3>
      <p className="text-lg text-secondary italic leading-relaxed">{impulse}</p>
    </div>
  );
}
