import { AuthorityInfo } from "@/types/chart";
import { LABELS } from "@/utils/constants";

interface AuthoritySectionProps {
  authority: AuthorityInfo;
}

export default function AuthoritySection({ authority }: AuthoritySectionProps) {
  return (
    <div className="material-card bg-white">
      <h3 className="text-xl font-bold text-primary mb-3">{LABELS.yourAuthority}</h3>
      <div className="space-y-3">
        <p className="text-3xl font-bold text-accent">{authority.label}</p>
        <p className="text-text leading-relaxed">{authority.decisionHint}</p>
      </div>
    </div>
  );
}
