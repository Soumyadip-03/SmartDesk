import { useTheme } from '../contexts/ThemeContext';

interface BuildingCardProps {
  id: string;
  name: string;
  buildingNumber?: string;
  roomCount?: number;
  onClick?: () => void;
  onRefresh?: () => void;
}

export function BuildingCard({ id, name, buildingNumber, roomCount = 0, onClick, onRefresh }: BuildingCardProps) {
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
          {onRefresh && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
              className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                theme === 'dark'
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-gray-700/50 hover:bg-gray-600/70 text-white'
              }`}
              title="Refresh building data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}