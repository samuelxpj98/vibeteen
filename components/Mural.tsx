
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { ActionType, CauseAction, Coordinates, User } from '../types';
import { ActionDetailModal } from './ActionDetailModal';

interface MuralProps {
  actions: CauseAction[];
  onAddClick: () => void;
  mission: string;
  isVisitor?: boolean;
  currentUser: User;
  onToggleSupport: (actionId: string) => void;
}

const getActionColor = (type: ActionType) => {
    switch (type) {
        case ActionType.OREI: return 'bg-action-blue shadow-[0_4px_15px_rgba(0,132,255,0.25)]';
        case ActionType.CUIDEI: return 'bg-action-green shadow-[0_4px_15px_rgba(0,245,118,0.25)]';
        case ActionType.COMPARTILHEI: return 'bg-action-orange shadow-[0_4px_15px_rgba(255,94,0,0.25)]';
        case ActionType.CONVIDEI: return 'bg-purple-600 shadow-[0_4px_15px_rgba(147,51,234,0.25)]';
        default: return 'bg-gray-200';
    }
};

const getActionIcon = (type: ActionType) => {
    switch (type) {
        case ActionType.OREI: return 'volunteer_activism';
        case ActionType.CUIDEI: return 'potted_plant';
        case ActionType.COMPARTILHEI: return 'forum';
        case ActionType.CONVIDEI: return 'person_add';
        default: return 'circle';
    }
};

export const Mural: React.FC<MuralProps> = ({ actions, onAddClick, mission, isVisitor, currentUser }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedAction, setSelectedAction] = useState<CauseAction | null>(null);
    
    // Zoom States
    const [scale, setScale] = useState(1);
    const [initialPinchDist, setInitialPinchDist] = useState<number | null>(null);
    const [initialScale, setInitialScale] = useState<number>(1);
    
    const MURAL_SIZE = 4000;

    const spiralCoords = useMemo(() => {
        const coords: Coordinates[] = [];
        const hexWidth = 94; 
        const hexHeightStep = 70; 
        const directions = [{q: 1, r: 0}, {q: 0, r: 1}, {q: -1, r: 1}, {q: -1, r: 0}, {q: 0, r: -1}, {q: 1, r: -1}];
        let q = 0, r = 0;
        const maxRings = Math.ceil(Math.sqrt(actions.length)) + 5; 
        for (let ring = 1; ring <= maxRings; ring++) {
            r--; 
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < ring; j++) {
                    coords.push({x: hexWidth * (q + r/2), y: hexHeightStep * r});
                    q += directions[i].q; r += directions[i].r;
                }
            }
        }
        return coords;
    }, [actions.length]);

    const centerMural = (smooth = true) => {
        setScale(1); 
        if (containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            containerRef.current.scrollTo({
                left: (MURAL_SIZE - clientWidth) / 2,
                top: (MURAL_SIZE - clientHeight) / 2,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => centerMural(false), 100);
        return () => clearTimeout(timer);
    }, []);

    // Logic for Pinch to Zoom
    const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const dist = getDistance(e.touches[0], e.touches[1]);
            setInitialPinchDist(dist);
            setInitialScale(scale);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && initialPinchDist) {
            const currentDist = getDistance(e.touches[0], e.touches[1]);
            const zoomFactor = currentDist / initialPinchDist;
            const newScale = Math.min(Math.max(initialScale * zoomFactor, 0.4), 2.5); // Limits: 0.4x to 2.5x
            setScale(newScale);
        }
    };

    const handleTouchEnd = () => {
        setInitialPinchDist(null);
    };

    // Helper para formatar o nome: "Samuel Duarte" -> "Samuel D."
    const formatName = (fullName: string) => {
        const parts = fullName.split(' ');
        if (parts.length > 1) {
            return `${parts[0]} ${parts[1][0]}.`;
        }
        return parts[0];
    };

    return (
        <div className="relative w-full h-full bg-white overflow-hidden">
            <header className="absolute top-0 left-0 right-0 z-30 p-4 pt-4 pointer-events-none">
                <div className="glass-panel rounded-full p-2 pl-4 flex items-center justify-between shadow-lg pointer-events-auto bg-white/80">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center border border-black/5">
                             <span className="material-symbols-outlined text-black text-sm font-bold">all_inclusive</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Missão Coletiva</span>
                            <span className="text-sm font-black italic text-gray-900 leading-none">
                                {mission}
                            </span>
                        </div>
                    </div>
                    <div className="bg-gray-100 rounded-full px-3 py-1 border border-gray-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-action-green text-xs">favorite</span>
                        <span className="text-xs font-bold text-gray-700">{actions.length}</span>
                    </div>
                </div>
            </header>

            <div 
                ref={containerRef} 
                className="w-full h-full overflow-auto no-scrollbar relative cursor-grab bg-white touch-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
                <div className="w-[4000px] h-[4000px] relative flex items-center justify-center transition-transform duration-75 origin-center ease-linear" style={{ transform: `scale(${scale})` }}>
                    <div onClick={() => centerMural(true)} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer active:scale-90 transition-transform">
                         <div className="w-24 h-24 bg-primary flex flex-col items-center justify-center clip-hexagon shadow-xl relative z-10 border-4 border-white">
                             <div className="flex flex-col items-center justify-center z-20">
                                <span className="text-black font-black italic text-[10px] leading-none tracking-[0.2em] opacity-80 mb-0.5">VIBE</span>
                                <span className="text-black font-black italic text-2xl leading-none tracking-tighter drop-shadow-sm">TEEN</span>
                             </div>
                         </div>
                    </div>

                    <div className="absolute left-1/2 top-1/2">
                        {actions.map((action, index) => {
                            const coord = spiralCoords[index];
                            if (!coord) return null;
                            return (
                                <div key={action.id} className="absolute transition-all duration-700 animate-in zoom-in fade-in" style={{ transform: `translate(${coord.x}px, ${coord.y}px)`, marginLeft: '-3rem', marginTop: '-3rem' }}>
                                    <div onClick={(e) => { e.stopPropagation(); setSelectedAction(action); }} className={`w-24 h-24 clip-hexagon flex flex-col items-center justify-center relative group hover:z-50 cursor-pointer p-1 transition-all duration-300 ${getActionColor(action.action)} shadow-sm`}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/10 pointer-events-none" />
                                        <span className="material-symbols-outlined text-2xl z-10 drop-shadow-md mb-0.5 text-white">{getActionIcon(action.action)}</span>
                                        <span className="text-[9px] font-bold leading-none text-center uppercase drop-shadow-md z-10 line-clamp-1 w-full px-1 break-all tracking-tight text-white">
                                            {formatName(action.userName)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-36 left-6 z-40 flex flex-col gap-2 pointer-events-none">
                <div className="pointer-events-auto flex flex-col gap-2">
                    {scale !== 1 && <button onClick={() => setScale(1)} className="w-10 h-10 bg-black/80 text-white rounded-full shadow-lg flex items-center justify-center text-[10px] font-bold">{Math.round(scale * 100)}%</button>}
                    <button onClick={() => centerMural(true)} className="w-10 h-10 bg-white/90 text-gray-600 rounded-full shadow-lg border border-gray-200 flex items-center justify-center"><span className="material-symbols-outlined text-xl">center_focus_strong</span></button>
                </div>
            </div>

            {selectedAction && <ActionDetailModal action={selectedAction} onClose={() => setSelectedAction(null)} />}

            <div className="absolute bottom-36 right-6 z-40">
                <button onClick={onAddClick} className={`w-16 h-16 rounded-full shadow-xl border-2 border-white flex items-center justify-center transition-all ${isVisitor ? 'bg-gray-200 text-gray-400' : 'bg-primary text-black'}`}>
                    <span className="material-symbols-outlined text-4xl">{isVisitor ? 'lock' : 'add'}</span>
                </button>
            </div>
            <style>{`.clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }`}</style>
        </div>
    );
};
