import { Channel } from "@/types/chart";
import { LABELS } from "@/utils/constants";

interface ChannelsSectionProps {
  channels: Channel[];
}

export default function ChannelsSection({ channels }: ChannelsSectionProps) {
  return (
    <div className="material-card bg-white">
      <h3 className="text-xl font-bold text-primary mb-4">{LABELS.activeChannels}</h3>
      <div className="flex flex-wrap gap-2">
        {channels.length > 0 ? (
          channels.map((channel, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-accent/10 text-accent font-medium rounded-full text-sm border border-accent/20"
            >
              {channel.code}
            </span>
          ))
        ) : (
          <p className="text-secondary italic">No active channels found.</p>
        )}
      </div>
    </div>
  );
}
