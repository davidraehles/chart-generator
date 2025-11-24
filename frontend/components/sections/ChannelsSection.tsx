import { Channel } from "@/types/chart";
import { LABELS } from "@/utils/constants";

interface ChannelsSectionProps {
  channels: Channel[];
}

export default function ChannelsSection({ channels }: ChannelsSectionProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-primary mb-4">{LABELS.activeChannels}</h3>
      <div className="flex flex-wrap gap-2">
        {channels.map((channel, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-accent bg-opacity-10 text-accent rounded-full text-sm"
          >
            {channel.code}
          </span>
        ))}
      </div>
    </div>
  );
}
