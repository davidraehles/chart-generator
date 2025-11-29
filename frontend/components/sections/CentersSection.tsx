import { Center } from "@/types/chart";
import { LABELS } from "@/utils/constants";

interface CentersSectionProps {
  centers: Center[];
}

export default function CentersSection({ centers }: CentersSectionProps) {
  const defined = centers.filter((c) => c.defined);
  const open = centers.filter((c) => !c.defined);

  return (
    <div className="material-card bg-white">
      <h3 className="text-xl font-bold text-primary mb-4">{LABELS.yourCenters}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-primary mb-3 pb-2 border-b border-border">{LABELS.defined}</h4>
          <ul className="space-y-2">
            {defined.map((center) => (
              <li key={center.code} className="text-text flex items-center">
                 <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                {center.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-primary mb-3 pb-2 border-b border-border">{LABELS.open}</h4>
          <ul className="space-y-2">
            {open.map((center) => (
              <li key={center.code} className="text-secondary flex items-center">
                <span className="w-2 h-2 rounded-full border border-secondary mr-2"></span>
                {center.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
