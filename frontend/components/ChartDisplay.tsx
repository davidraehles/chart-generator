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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-border">
        <div>
           <h2 className="text-2xl font-bold text-primary">
            {data.firstName}s Chart
          </h2>
          <p className="text-secondary text-sm mt-1">
             Discover the details of your design below
          </p>
        </div>

        <button
          onClick={onReset}
          className="btn-secondary whitespace-nowrap"
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

      <div className="material-card bg-white overflow-hidden">
        <h3 className="text-xl font-bold text-primary mb-6">Bodygraph</h3>
        <div className="flex justify-center p-4">
           <Bodygraph centers={data.centers} channels={data.channels} />
        </div>
      </div>

      <ImpulseSection impulse={data.shortImpulse} />

      <EmailCaptureSection />
    </div>
  );
}
