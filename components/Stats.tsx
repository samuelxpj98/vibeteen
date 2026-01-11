import React from 'react';
import { ActionType, CauseAction } from '../types';

interface StatsProps {
    actions: CauseAction[];
}

export const Stats: React.FC<StatsProps> = ({ actions }) => {
    
    const countByType = (type: ActionType) => actions.filter(a => a.action === type).length;
    
    // Helper to calculate "today's" actions (in this mock, just random for demo visual or actually filtering)
    // For this request, we keep the 'growth' label static or simple, but reset the total count.
    const getGrowth = (type: ActionType) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const count = actions.filter(a => a.action === type && a.timestamp.startsWith(todayStr)).length;
        return count > 0 ? `+${count} hoje` : '0 hoje';
    }

    const cards = [
        {
            type: ActionType.OREI,
            title: 'Intercessão',
            count: countByType(ActionType.OREI),
            label: 'Orações realizadas',
            growth: getGrowth(ActionType.OREI),
            color: 'text-action-blue',
            bg: 'bg-white border-gray-100 shadow-lg shadow-blue-500/5',
            icon: 'volunteer_activism',
            gradient: 'from-blue-50 to-transparent'
        },
        {
            type: ActionType.CUIDEI,
            title: 'Cuidado',
            count: countByType(ActionType.CUIDEI),
            label: 'Vidas alcançadas',
            growth: getGrowth(ActionType.CUIDEI),
            color: 'text-action-green',
            bg: 'bg-white border-gray-100 shadow-lg shadow-green-500/5',
            icon: 'potted_plant',
            gradient: 'from-green-50 to-transparent'
        },
        {
            type: ActionType.COMPARTILHEI,
            title: 'Evangelismo',
            count: countByType(ActionType.COMPARTILHEI),
            label: 'Compartilhamentos',
            growth: getGrowth(ActionType.COMPARTILHEI),
            color: 'text-action-orange',
            bg: 'bg-white border-gray-100 shadow-lg shadow-orange-500/5',
            icon: 'share',
            gradient: 'from-orange-50 to-transparent'
        }
    ];

    return (
        <div className="w-full h-full overflow-y-auto px-4 pt-24 pb-32 bg-background">
            <div className="mb-8">
                <h2 className="text-3xl font-black italic text-gray-900 leading-none tracking-tight">NOSSO MOVIMENTO</h2>
                <p className="text-gray-500 text-sm mt-2">Acompanhe em tempo real o impacto das nossas ações coletivas.</p>
            </div>

            <div className="flex flex-col gap-6">
                {cards.map((card) => (
                    <div key={card.title} className={`relative overflow-hidden rounded-[2rem] p-6 border ${card.bg}`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50 pointer-events-none`} />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 ${card.color}`}>
                                    <span className="material-symbols-outlined">{card.icon}</span>
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-widest ${card.color}`}>{card.title}</span>
                            </div>

                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-gray-900 tracking-tighter tabular-nums">{card.count}</span>
                            </div>
                            <p className="text-gray-500 font-bold text-xs mt-1">{card.label}</p>

                            <div className="mt-6 flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-xs font-bold ${card.color}`}>
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    {card.growth}
                                </span>
                            </div>
                        </div>

                        {/* Decorative Icon */}
                        <div className={`absolute -right-6 -top-6 opacity-5 rotate-12 ${card.color}`}>
                            <span className="material-symbols-outlined text-[150px]">{card.icon}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};