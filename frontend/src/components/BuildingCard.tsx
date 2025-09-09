interface BuildingCardProps {
  id: string;
  name: string;
  buildingNumber?: string;
  roomCount?: number;
  onClick?: () => void;
}

export function BuildingCard({ id, name, buildingNumber, roomCount = 0, onClick }: BuildingCardProps) {
  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <div className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm p-4 border border-white/10 hover:from-white/25 hover:to-white/15 transition-all duration-300" style={{borderRadius: '3rem'}}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center border border-white/10">
            <span className="text-white text-xs font-medium">B{buildingNumber || id}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white text-sm font-medium">{name}</h3>
            <p className="text-white/60 text-xs">{roomCount} rooms</p>
          </div>
        </div>
      </div>
    </div>
  );
}