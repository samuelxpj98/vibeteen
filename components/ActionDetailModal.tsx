import React from 'react';
import { ActionType, CauseAction } from '../types';

interface ActionDetailModalProps {
  action: CauseAction;
  onClose: () => void;
}

const getActionTheme = (type: ActionType) => {
    switch (type) {
        case ActionType.OREI: return { color: 'text-action-blue', bg: 'bg-blue-50', border: 'border-blue-100', icon: 'volunteer_activism' };
        case ActionType.CUIDEI: return { color: 'text-action-green', bg: 'bg-green-50', border: 'border-green-100', icon: 'potted_plant' };
        case ActionType.COMPARTILHEI: return { color: 'text-action-orange', bg: 'bg-orange-50', border: 'border-orange-100', icon: 'forum' };
        default: return { color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', icon: 'circle' };
    }
};

const getInspirationalMessage = (type: ActionType): string => {
    switch (type) {
        case ActionType.OREI:
            return "A oração é o wi-fi do céu. Você conectou alguém a Deus hoje! Sua voz moveu o espiritual.";
        case ActionType.CUIDEI:
            return "O amor não é apenas um sentimento, é atitude. Hoje você foi as mãos e os pés de Jesus para alguém.";
        case ActionType.COMPARTILHEI:
            return "Uma palavra pode mudar tudo. Você plantou uma semente eterna que o Espírito Santo fará crescer.";
        default:
            return "Cada pequena ação conta para o Reino.";
    }
};

export const ActionDetailModal: React.FC<ActionDetailModalProps> = ({ action, onClose }) => {
    const theme = getActionTheme(action.action);
    const message = getInspirationalMessage(action.action);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>

                {/* Header Icon */}
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${theme.bg} ${theme.color} border ${theme.border} shadow-sm`}>
                    <span className="material-symbols-outlined text-4xl">{theme.icon}</span>
                </div>

                {/* Action Type Title */}
                <div className="text-center mb-6">
                    <span className={`text-xs font-bold uppercase tracking-widest ${theme.color}`}>{action.action}</span>
                    <h2 className="text-2xl font-black italic text-gray-900 leading-none mt-1">
                        IMPACTO REAL
                    </h2>
                </div>

                {/* Connection Line */}
                <div className="flex flex-col gap-3 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    {/* From User */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white overflow-hidden shadow-sm">
                             <img src={`https://picsum.photos/200/200?random=${action.userId}`} alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Realizado por</span>
                            <span className="text-sm font-bold text-gray-900 leading-none">{action.userName}</span>
                        </div>
                    </div>

                    {/* Arrow Divider */}
                    <div className="pl-3.5">
                        <div className="h-4 w-0.5 bg-gray-300/50 rounded-full"></div>
                    </div>

                    {/* To Friend */}
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${theme.bg} ${theme.color}`}>
                             <span className="material-symbols-outlined text-sm">favorite</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Dedicado a</span>
                            <span className="text-sm font-bold text-gray-900 leading-none">
                                {action.friendName || "Alguém especial"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Inspirational Message */}
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 text-center">
                    <p className="text-sm font-medium text-gray-700 italic leading-relaxed">
                        "{message}"
                    </p>
                </div>
            </div>
        </div>
    );
};