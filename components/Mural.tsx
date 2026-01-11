import React, { useMemo, useEffect, useRef, useState } from 'react';
import { ActionType, CauseAction, Coordinates } from '../types';
import { ActionDetailModal } from './ActionDetailModal';

interface MuralProps {
  actions: CauseAction[];
  onAddClick: () => void;
  mission: string;
  isVisitor?: boolean;
}

const getActionColor = (type: ActionType) => {
    switch (type) {
        case ActionType.OREI: return 'bg-action-blue shadow-[0_4px_15px_rgba(0,132,255,0.25)]';
        case ActionType.CUIDEI: return 'bg-action-green shadow-[0_4px_15px_rgba(0,245,118,0.25)]';
        case ActionType.COMPARTILHEI: return 'bg-action-orange shadow-[0_4px_15px_rgba(255,94,0,0.25)]';
        default: return 'bg-gray-200';
    }
};

const getActionIcon = (type: ActionType) => {
    switch (type) {
        case ActionType.OREI: return 'volunteer_activism';
        case ActionType.CUIDEI: return 'potted_plant';
        case ActionType.COMPARTILHEI: return 'forum';
        default: return 'circle';
    }
};

export const Mural: React.FC<MuralProps> = ({ actions, onAddClick, mission, isVisitor }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedAction, setSelectedAction] = useState<CauseAction | null>(null);
    
    // Drag to Scroll Logic
    const isDown = useRef(false);
    const startX = useRef(0);
    const startY = useRef(0);
    const scrollLeft = useRef(0);
    const scrollTop = useRef(0);

    // Hexagonal Spiral Algorithm
    const spiralCoords = useMemo(() => {
        const coords: Coordinates[] = [];
        
        // Configuração para "Colar" os hexágonos (Tight Packing)
        // O hexágono CSS tem w-24 (96px) e h-24 (96px).
        // Para encaixar perfeitamente sem gaps, usamos passos menores que a largura total para criar sobreposição nas bordas cortadas.
        const hexWidth = 94; // Largura efetiva da coluna (96px - 2px overlap)
        const hexHeightStep = 70; // Passo vertical (96px * 0.75 ≈ 72px) - reduzido para 70 para colar bem.

        // Skip 0,0 para o logo central VIBE TEEN
        const directions = [
            {q: 1, r: 0}, {q: 0, r: 1}, {q: -1, r: 1}, 
            {q: -1, r: 0}, {q: 0, r: -1}, {q: 1, r: -1}
        ];

        let q = 0;
        let r = 0;
        const maxRings = Math.ceil(Math.sqrt(actions.length)) + 5; 

        for (let ring = 1; ring <= maxRings; ring++) {
            r--; // Move para o anel exterior
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < ring; j++) {
                    // Conversão Axial -> Pixel customizada para hexágonos "Fat" (1:1 aspect ratio)
                    // x = Width * (q + r/2)
                    // y = HeightStep * r
                    const x = hexWidth * (q + r/2);
                    const y = hexHeightStep * r;
                    
                    coords.push({x, y});
                    
                    q += directions[i].q;
                    r += directions[i].r;
                }
            }
        }
        return coords;
    }, [actions.length]);

    // Center Logic
    const centerMural = () => {
        if (containerRef.current) {
            const { scrollWidth, scrollHeight, clientWidth, clientHeight } = containerRef.current;
            containerRef.current.scrollTo({
                left: (scrollWidth - clientWidth) / 2,
                top: (scrollHeight - clientHeight) / 2,
                behavior: 'smooth'
            });
        }
    };

    // Center on mount
    useEffect(() => {
        if (containerRef.current) {
            const { scrollWidth, scrollHeight, clientWidth, clientHeight } = containerRef.current;
            containerRef.current.scrollTo({
                left: (scrollWidth - clientWidth) / 2,
                top: (scrollHeight - clientHeight) / 2,
                behavior: 'auto'
            });
        }
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        isDown.current = true;
        containerRef.current.classList.add('cursor-grabbing');
        containerRef.current.classList.remove('cursor-grab');
        startX.current = e.pageX - containerRef.current.offsetLeft;
        startY.current = e.pageY - containerRef.current.offsetTop;
        scrollLeft.current = containerRef.current.scrollLeft;
        scrollTop.current = containerRef.current.scrollTop;
    };

    const handleMouseLeave = () => {
        if (!containerRef.current) return;
        isDown.current = false;
        containerRef.current.classList.remove('cursor-grabbing');
        containerRef.current.classList.add('cursor-grab');
    };

    const handleMouseUp = () => {
        if (!containerRef.current) return;
        isDown.current = false;
        containerRef.current.classList.remove('cursor-grabbing');
        containerRef.current.classList.add('cursor-grab');
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDown.current || !containerRef.current) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const y = e.pageY - containerRef.current.offsetTop;
        const walkX = (x - startX.current) * 1.5; // Scroll speed multiplier
        const walkY = (y - startY.current) * 1.5;
        containerRef.current.scrollLeft = scrollLeft.current - walkX;
        containerRef.current.scrollTop = scrollTop.current - walkY;
    };

    return (
        <div className="relative w-full h-full">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-30 p-4 pt-4 pointer-events-none">
                <div className="glass-panel rounded-full p-2 pl-4 flex items-center justify-between shadow-lg pointer-events-auto bg-white/80">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center border border-black/5">
                             <span className="material-symbols-outlined text-black text-sm font-bold">all_inclusive</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Missão do Dia</span>
                            <span className="text-sm font-black italic text-gray-900 leading-none">
                                {mission || "Carregando..."}
                            </span>
                        </div>
                    </div>
                    <div className="bg-gray-100 rounded-full px-3 py-1 border border-gray-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-action-green text-xs">favorite</span>
                        <span className="text-xs font-bold text-gray-700">{actions.length}</span>
                    </div>
                </div>
            </header>

            {/* Infinite Canvas */}
            <div 
                ref={containerRef}
                className="w-full h-full overflow-auto no-scrollbar relative cursor-grab bg-white touch-none"
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
                
                <div className="w-[4000px] h-[4000px] relative flex items-center justify-center">
                    {/* Center Piece (VIBE TEEN) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                         <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl animate-pulse"></div>
                         <div className="w-24 h-24 bg-primary flex flex-col items-center justify-center clip-hexagon shadow-[0_0_40px_rgba(249,245,6,0.5)] relative z-10 border-4 border-white/20">
                             <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/5 pointer-events-none" />
                             <div className="flex flex-col items-center justify-center z-20">
                                <span className="text-black font-black italic text-[10px] leading-none tracking-[0.2em] opacity-80 mb-0.5">VIBE</span>
                                <span className="text-black font-black italic text-2xl leading-none tracking-tighter drop-shadow-sm">TEEN</span>
                             </div>
                         </div>
                    </div>

                    {/* Honeycomb Items */}
                    <div className="absolute left-1/2 top-1/2">
                        {actions.map((action, index) => {
                            const coord = spiralCoords[index];
                            if (!coord) return null;

                            return (
                                <div 
                                    key={action.id}
                                    className="absolute transition-all duration-700 animate-in zoom-in fade-in"
                                    style={{
                                        transform: `translate(${coord.x}px, ${coord.y}px)`,
                                        marginLeft: '-3rem', 
                                        marginTop: '-3rem'
                                    }}
                                >
                                    <div 
                                        onClick={(e) => {
                                            setSelectedAction(action);
                                        }}
                                        className={`w-24 h-24 ${getActionColor(action.action)} clip-hexagon flex flex-col items-center justify-center relative group hover:z-50 hover:scale-110 transition-transform cursor-pointer p-1 shadow-sm`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/10 pointer-events-none" />
                                        
                                        <span className="material-symbols-outlined text-white text-2xl z-10 drop-shadow-md mb-0.5">
                                            {getActionIcon(action.action)}
                                        </span>
                                        
                                        <span className="text-[9px] font-bold text-white leading-none text-center uppercase drop-shadow-md z-10 line-clamp-1 w-full px-1 break-all tracking-tight">
                                            {action.userName.split(' ')[0]}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Recenter Button */}
            <div className="absolute bottom-24 left-6 z-40">
                <button 
                    onClick={centerMural}
                    className="w-10 h-10 bg-white/90 backdrop-blur text-gray-600 rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined text-xl">center_focus_strong</span>
                </button>
            </div>

            {/* Action Detail Modal */}
            {selectedAction && (
                <ActionDetailModal 
                    action={selectedAction} 
                    onClose={() => setSelectedAction(null)} 
                />
            )}

            {/* FAB */}
            <div className="absolute bottom-24 right-6 z-40">
                <button 
                    onClick={onAddClick}
                    className={`w-16 h-16 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-2 border-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all group ${isVisitor ? 'bg-gray-200 text-gray-400' : 'bg-primary text-black'}`}
                >
                    <span className={`material-symbols-outlined text-4xl ${!isVisitor && 'group-hover:rotate-90'} transition-transform duration-300`}>
                        {isVisitor ? 'lock' : 'add'}
                    </span>
                </button>
            </div>

            <style>{`
                .clip-hexagon {
                    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                }
            `}</style>
        </div>
    );
};