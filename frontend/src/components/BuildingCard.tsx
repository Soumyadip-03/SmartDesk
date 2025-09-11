import { useTheme } from '../contexts/ThemeContext';

interface BuildingCardProps {
  id: string;
  name: string;
  buildingNumber?: string;
  roomCount?: number;
  onClick?: () => void;
}

export function BuildingCard({ id, name, buildingNumber, roomCount = 0, onClick }: BuildingCardProps) {
  const { theme } = useTheme();
  
  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <div className={`backdrop-blur-sm p-4 border transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-white/20 to-white/10 border-white/10 hover:from-white/25 hover:to-white/15'
          : 'bg-gradient-to-r from-gray-800/90 to-gray-700/90 border-gray-600 hover:from-gray-800/95 hover:to-gray-700/95 shadow-lg'
      }`} style={{borderRadius: '3rem'}}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
            theme === 'dark'
              ? 'bg-black/30 border-white/10'
              : 'bg-gray-900/80 border-gray-500'
          }`}>
            <span className="text-white text-xs font-medium">B{buildingNumber || id}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white text-sm font-medium">{name}</h3>
            <p className="text-white/80 text-xs">{roomCount} rooms</p>
          </div>
        </div>
      </div>
    </div>
  );
}