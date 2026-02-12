import React from 'react';
import { Kudos } from '../types';
import { Heart, Star, Zap } from 'lucide-react';

interface KudosWallProps {
  kudos: Kudos[];
}

const KudosWall: React.FC<KudosWallProps> = ({ kudos }) => {
  const getIcon = (cat: string) => {
    switch (cat) {
      case 'Creative': return <Star size={14} className="text-yellow-400" />;
      case 'Teamwork': return <Heart size={14} className="text-red-400" />;
      default: return <Zap size={14} className="text-blue-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Góc vinh danh</h3>
        <button className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20 hover:bg-primary/30 transition-colors">
          + Tặng Kudos
        </button>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {kudos.length > 0 ? (
          kudos.map(k => (
            <div key={k.id} className="bg-white/5 border border-white/5 p-3 rounded-xl flex gap-3 hover:bg-white/10 transition-colors">
              <img src={k.fromAvatar} alt={k.fromName} className="w-8 h-8 rounded-full border border-white/10" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold text-white">{k.fromName}</p>
                  <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded text-[10px] text-slate-300">
                    {getIcon(k.category)} {k.category}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1 italic">"{k.message}"</p>
                <p className="text-[10px] text-slate-600 mt-2 text-right">{k.date}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm">Chưa có Kudos nào. Hãy là người đầu tiên gửi lời khen ngợi!</div>
        )}
      </div>
    </div>
  );
};

export default KudosWall;