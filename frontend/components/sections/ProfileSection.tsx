import { ProfileInfo } from "@/types/chart";
import { LABELS } from "@/utils/constants";

interface ProfileSectionProps {
  profile: ProfileInfo;
}

export default function ProfileSection({ profile }: ProfileSectionProps) {
  return (
    <div className="material-card bg-white">
      <h3 className="text-xl font-bold text-primary mb-3">{LABELS.yourProfile}</h3>
      <div className="space-y-3">
        <p className="text-3xl font-bold text-accent">{profile.code}</p>
        <p className="text-text leading-relaxed">{profile.shortDescription}</p>
      </div>
    </div>
  );
}
