import { AuthorityInfo } from "@/types/chart";
import { LABELS } from "@/utils/constants";

interface AuthoritySectionProps {
  authority: AuthorityInfo;
}

export default function AuthoritySection({ authority }: AuthoritySectionProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-primary mb-3">{LABELS.yourAuthority}</h3>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-accent">{authority.label}</p>
        <p className="text-secondary leading-relaxed">{authority.decisionHint}</p>
      </div>
    </div>
  );
}
