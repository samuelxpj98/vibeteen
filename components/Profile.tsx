
import React, { useState } from 'react';
import { User, CauseAction, ActionType } from '../types';
import { getFixedDailyMission } from '../services/missionData';

interface ProfileProps {
  user: User;
  actions: CauseAction[];
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
}

const COLOR_GRID = [
    'bg-primary', 'bg-action-blue', 'bg-action-green', 'bg-action-orange',
    'bg-purple-600', 'bg-pink-500', 'bg-red-500', 'bg-orange-500',
    'bg-amber-500', 'bg-lime-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-sky-500', 'bg-indigo-500', 'bg-violet-500', 'bg-rose-500'
];

export const Profile: React.FC<ProfileProps> = ({ user, actions, onUpdateUser, onLogout }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<{label: string, desc: string, icon: string, color: string} | null>(null);

    const [editFirstName, setEditFirstName] = useState(user.firstName);
    const [editColor, setEditColor] = useState(user.avatarColor);
    
    const myActions = actions.filter(a => a.userId === user.uid);
    const count = (type: ActionType) => myActions.filter(a => a.action === type).length;
    
    const currentMission = getFixedDailyMission();

    const handleSave = () => {
        onUpdateUser({
            ...user,
            firstName: editFirstName,
            avatarColor: editColor,
        });
        setIsEditing(false);
    };

    return (
        <div className="w-full h-full overflow-y-auto bg-background pb-32 no-scrollbar">
            {/* Header com Cover */}
            <div className={`w-full h-44 relative ${isEditing ? editColor : user.avatarColor} transition-colors duration-500`}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>
                <div className="absolute top-6 right-6 z-20">
                    <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="px-5 py-2.5 rounded-full bg-white text-black font-black text-[10px] uppercase shadow-2xl transition-all active:scale-90">
                        {isEditing ? 'SALVAR' : 'EDITAR'}
                    </button>
                </div>
            </div>

            <div className="px-6 relative -mt-16 mb-6 flex flex-col items-center">
                <div className="relative group">
                    <div className={`w-32 h-32 rounded-[3rem] border-[8px] border-white shadow-2xl relative z-10 rotate-2 group-hover:rotate-0 transition-transform duration-500 flex items-center justify-center ${isEditing ? editColor : user.avatarColor}`}>
                        <span className="material-symbols-outlined text-white text-5xl font-black opacity-40">person</span>
                    </div>
                </div>
                
                <div className="text-center mt-6 w-full max-w-[280px]">
                    {isEditing ? (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                            <input 
                                type="text" 
                                value={editFirstName} 
                                onChange={(e) => setEditFirstName(e.target.value)}
                                className="text-center w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 text-xl font-black italic uppercase tracking-tighter outline-none focus:border-black transition-all"
                                placeholder="Seu Nome"
                            />
                            <div className="bg-white/80 backdrop-blur p-4 rounded-[2rem] border border-gray-100 shadow-xl">
                                <p className="text-[9px] font-black uppercase text-gray-400 mb-3 tracking-widest text-center">Cor do Perfil</p>
                                <div className="grid grid-cols-4 gap-2.5">
                                    {COLOR_GRID.map((colorClass) => (
                                        <button
                                            key={colorClass}
                                            onClick={() => setEditColor(colorClass)}
                                            className={`w-full aspect-square rounded-xl border-4 transition-all ${colorClass} ${editColor === colorClass ? 'border-black scale-110 z-10 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-4xl font-black italic text-gray-900 leading-none tracking-tighter uppercase">{user.firstName}</h2>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">Geração Vibe Teen</p>
                        </>
                    )}
                </div>
            </div>

            {/* STREAK */}
            <div className="px-6 mb-8">
                <div className="bg-orange-50 border-4 border-orange-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                        <span className="material-symbols-outlined text-9xl filled text-orange-600">local_fire_department</span>
                    </div>
                    <span className="material-symbols-outlined text-orange-500 text-6xl filled mb-2 drop-shadow-lg animate-pulse">local_fire_department</span>
                    <span className="text-orange-600 text-7xl font-black italic leading-none">{user.streak || 0}</span>
                    <span className="text-orange-400 text-xs font-black uppercase tracking-[0.4em] mt-2">DÍAS CONSECUTIVOS</span>
                </div>
            </div>

            {/* CONTADORES */}
            <div className="px-6 mb-10">
                <div className="grid grid-cols-4 gap-2 bg-gray-900 p-6 rounded-[2.5rem] shadow-2xl">
                    <Counter icon="volunteer_activism" color="text-action-blue" val={count(ActionType.OREI)} label="ORAR" />
                    <Counter icon="potted_plant" color="text-action-green" val={count(ActionType.CUIDEI)} label="CUIDAR" />
                    <Counter icon="forum" color="text-action-orange" val={count(ActionType.COMPARTILHEI)} label="PREGAR" />
                    <Counter icon="person_add" color="text-purple-400" val={count(ActionType.CONVIDEI)} label="VIP" />
                </div>
            </div>

            <div className="px-6 space-y-10">
                {/* MISSÃO DO DIA FIXA (Antiga Voz do Reino) */}
                <div className="bg-primary p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[120px] text-black">task_alt</span>
                    </div>
                    <h3 className="text-black/40 font-black italic text-[10px] uppercase tracking-widest mb-3">Missão Coletiva do Dia</h3>
                    <p className="text-black font-black text-xl leading-tight">
                        "{currentMission}"
                    </p>
                </div>

                {/* CONQUISTAS AUTOMÁTICAS */}
                <div className="space-y-6">
                    <h3 className="text-[11px] font-black italic text-gray-400 uppercase tracking-widest pl-2">Troféus de Impacto</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <Badge 
                            active={myActions.length >= 1} icon="emoji_events" label="Novato" color="bg-orange-500" 
                            onClick={() => setSelectedBadge({icon: "emoji_events", color: "bg-orange-500", label: "Novato", desc: "A chama foi acesa! Você registrou sua primeira ação no Reino."})}
                        />
                        <Badge 
                            active={count(ActionType.OREI) >= 10} icon="volunteer_activism" label="Intercessor" color="bg-action-blue" 
                            onClick={() => setSelectedBadge({icon: "volunteer_activism", color: "bg-action-blue", label: "Intercessor", desc: "Você orou por 10 pessoas. Sua vida de oração está gerando frutos eternos!"})}
                        />
                        <Badge 
                            active={count(ActionType.COMPARTILHEI) >= 10} icon="campaign" label="Evangelista" color="bg-red-500" 
                            onClick={() => setSelectedBadge({icon: "campaign", color: "bg-red-500", label: "Evangelista", desc: "Pregou o evangelho 10 vezes. O céu está em festa por sua ousadia!"})}
                        />
                        <Badge 
                            active={count(ActionType.CONVIDEI) >= 10} icon="stars" label="Influencer" color="bg-purple-600" 
                            onClick={() => setSelectedBadge({icon: "stars", color: "bg-purple-600", label: "Influencer", desc: "Trouxe 10 amigos para conhecer a Jesus. Você é um embaixador VIP!"})}
                        />
                        <Badge 
                            active={myActions.length >= 50} icon="military_tech" label="Embaixador" color="bg-yellow-600" 
                            onClick={() => setSelectedBadge({icon: "military_tech", color: "bg-yellow-600", label: "Embaixador do Reino", desc: "Alcançou 50 ações de fé. Seu impacto é inegável e sua constância inspira todos!"})}
                        />
                         <Badge 
                            active={(user.streak || 0) >= 7} icon="bolt" label="Pilar Fogo" color="bg-orange-600" 
                            onClick={() => setSelectedBadge({icon: "bolt", color: "bg-orange-600", label: "Pilar de Fogo", desc: "7 dias seguidos de fé. A constância é a base da maturidade espiritual."})}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <button onClick={onLogout} className="w-full p-5 rounded-3xl bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-red-500 transition-colors">
                        Sair da Conta
                    </button>
                    <div className="mt-8 text-center pb-4">
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                            Criado por Samuel Duarte
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal de Detalhe da Conquista */}
            {selectedBadge && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedBadge(null)}>
                    <div className="bg-white rounded-[3rem] p-8 max-w-xs text-center shadow-2xl border-[6px] border-primary animate-in zoom-in" onClick={e => e.stopPropagation()}>
                        <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${selectedBadge.color} text-white shadow-xl rotate-3`}>
                            <span className="material-symbols-outlined text-5xl">{selectedBadge.icon}</span>
                        </div>
                        <h4 className="text-3xl font-black italic mb-3 leading-none tracking-tighter uppercase">{selectedBadge.label}</h4>
                        <p className="text-gray-600 text-[13px] font-bold leading-relaxed">{selectedBadge.desc}</p>
                        <button 
                            onClick={() => setSelectedBadge(null)} 
                            className="mt-8 w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
                        >
                            FECHAR
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Counter = ({icon, color, val, label}: any) => (
    <div className="flex flex-col items-center">
        <span className={`material-symbols-outlined ${color} text-2xl mb-1`}>{icon}</span>
        <span className="text-white text-xl font-black italic leading-none">{val}</span>
        <span className="text-white/30 text-[8px] font-black uppercase tracking-tighter mt-1">{label}</span>
    </div>
);

const Badge = ({ active, icon, label, color, onClick }: any) => (
    <div 
        onClick={onClick} 
        className={`flex flex-col items-center p-5 rounded-[2.5rem] border transition-all active:scale-90 ${active ? 'bg-white border-gray-100 shadow-xl' : 'bg-gray-50 border-transparent opacity-20 grayscale'}`}
    >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-3 ${active ? color : 'bg-gray-300'} shadow-md`}>
            <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <span className="text-[9px] font-black uppercase text-center leading-none tracking-tighter">{label}</span>
    </div>
);
