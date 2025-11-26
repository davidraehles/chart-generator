import { ProfileInfo } from "@/types/chart";
import { LABELS } from "@/utils/constants";

interface ProfileSectionProps {
  profile: ProfileInfo;
}

export default function ProfileSection({ profile }: ProfileSectionProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-primary mb-3">{LABELS.yourProfile}</h3>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-accent">{profile.code}</p>
        <p className="text-secondary leading-relaxed">{profile.shortDescription}</p>
      </div>
    </div>
  );
}
