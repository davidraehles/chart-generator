import { LABELS } from "@/utils/constants";

interface GatesSectionProps {
  gates: {
    conscious: string[];
    unconscious: string[];
  };
}

export default function GatesSection({ gates }: GatesSectionProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-primary mb-4">{LABELS.activeGates}</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-primary mb-3">{LABELS.conscious}</h4>
          <div className="flex flex-wrap gap-2">
            {gates.conscious.map((gate, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary bg-opacity-10 text-primary rounded text-sm"
              >
                {gate}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-medium text-primary mb-3">{LABELS.unconscious}</h4>
          <div className="flex flex-wrap gap-2">
            {gates.unconscious.map((gate, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-secondary bg-opacity-10 text-secondary rounded text-sm"
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
