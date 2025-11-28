"use client";

import { ChartResponse } from "@/types/chart";
import { LABELS } from "@/utils/constants";
import TypeSection from "./sections/TypeSection";
import AuthoritySection from "./sections/AuthoritySection";
import ProfileSection from "./sections/ProfileSection";
import CentersSection from "./sections/CentersSection";
import ChannelsSection from "./sections/ChannelsSection";
import GatesSection from "./sections/GatesSection";
import IncarnationCrossSection from "./sections/IncarnationCrossSection";
import ImpulseSection from "./sections/ImpulseSection";
import Bodygraph from "./Bodygraph";
import EmailCaptureSection from "./EmailCaptureSection";

interface ChartDisplayProps {
  data: ChartResponse;
  onReset: () => void;
}

export default function ChartDisplay({ data, onReset }: ChartDisplayProps) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">
          {data.firstName}s Chart
        </h2>
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm bg-secondary text-white rounded-md hover:bg-opacity-90"
        >
          {LABELS.newChart}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <TypeSection type={data.type} />
        <AuthoritySection authority={data.authority} />
      </div>

      <ProfileSection profile={data.profile} />

      <div className="grid md:grid-cols-2 gap-6">
        <CentersSection centers={data.centers} />
        <ChannelsSection channels={data.channels} />
      </div>

      <GatesSection gates={data.gates} />

      <IncarnationCrossSection incarnationCross={data.incarnationCross} />

      <Bodygraph centers={data.centers} channels={data.channels} />

      <ImpulseSection impulse={data.shortImpulse} />

      <EmailCaptureSection />

      <div className="text-center text-xs text-gray-400 mt-8 pb-4">
        <p>Berechnet mit {data.calculationSource || "Swiss Ephemeris"}</p>
      </div>
    </div>
  );
}
