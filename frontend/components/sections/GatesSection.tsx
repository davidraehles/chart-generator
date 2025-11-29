import { LABELS } from "@/utils/constants";

interface GatesSectionProps {
  gates: {
    conscious: string[];
    unconscious: string[];
  };
}

export default function GatesSection({ gates }: GatesSectionProps) {
  return (
    <div className="material-card bg-white">
      <h3 className="text-xl font-bold text-primary mb-4">{LABELS.activeGates}</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-primary mb-3 pb-2 border-b border-border">{LABELS.conscious}</h4>
          <div className="flex flex-wrap gap-2">
            {gates.conscious.map((gate, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-text/5 text-text rounded text-sm font-medium border border-text/10"
              >
                {gate}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-error mb-3 pb-2 border-b border-border">{LABELS.unconscious}</h4>
          <div className="flex flex-wrap gap-2">
            {gates.unconscious.map((gate, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-error/10 text-error rounded text-sm font-medium border border-error/20"
              >
                {gate}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
