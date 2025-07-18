interface AdSlotProps {
  slotName: string;
  size?: string;
  className?: string;
}

export default function AdSlot({
  slotName,
  size = "728x90",
  className = "",
}: AdSlotProps) {
  return (
    <div
      className={`ad-slot p-6 border border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center space-y-2 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${className}`}
    >
      <p className="text-gray-700 font-semibold text-lg">{slotName}</p>
      <p className="text-blue-500 text-sm font-medium">
        {size} AdSense Placeholder
      </p>
      <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mt-2"></div>
    </div>
  );
}
