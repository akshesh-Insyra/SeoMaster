interface AdSlotProps {
  slotName: string;
  size?: string;
  className?: string;
}

export default function AdSlot({ slotName, size = "728x90", className = "" }: AdSlotProps) {
  return (
    <div className={`ad-slot ${className}`}>
      <p className="text-slate-500 font-medium">{slotName}</p>
      <p className="text-slate-400 text-sm">{size} AdSense Placeholder</p>
    </div>
  );
}
