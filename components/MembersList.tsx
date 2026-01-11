import React, { useState } from 'react';
import { User, PrayerRequest, PrayerCategory } from '../types';

interface MembersListProps {
  members: User[];
  currentUser: User;
  prayerRequests: PrayerRequest[];
  onAddPrayer: (category: PrayerCategory, description: string) => void;
  onPray: (requestId: string) => void;
}

const CATEGORIES: { label: PrayerCategory; color: string; bg: string; icon: string }[] = [
    { label: 'Saúde', color: 'text-pink-600', bg: 'bg-pink-100', icon: 'favorite' },
    { label: 'Família', color: 'text-blue-600', bg: 'bg-blue-100', icon: 'family_restroom' },
    { label: 'Escola', color: 'text-orange-600', bg: 'bg-orange-100', icon: 'school' },
    { label: 'Pessoal', color: 'text-purple-600', bg: 'bg-purple-100', icon: 'person' },
    { label: 'Outro', color: 'text-gray-600', bg: 'bg-gray-100', icon: 'more_horiz' },
];

export const MembersList: React.FC<MembersListProps> = ({ 
    members, 
    currentUser, 
    prayerRequests,
    onAddPrayer,
    onPray
}) => {
    const [activeTab, setActiveTab] = useState<'members' | 'prayers'>('prayers');
    const [isAddingPrayer, setIsAddingPrayer] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<PrayerCategory>('Pessoal');
    const [prayerDescription, setPrayerDescription] = useState('');

    // Helper to get names of people who prayed
    const getPrayedByNames = (uids: string[]) => {
        return uids.map(uid => {
            if (uid === currentUser.uid) return "Você";
            const member = members.find(m => m.uid === uid);
            return member ? member.firstName : "Alguém";
        });
    };

    const handleSubmitPrayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (prayerDescription.trim()) {
            onAddPrayer(selectedCategory, prayerDescription);
            setIsAddingPrayer(false);
            setPrayerDescription('');
            setSelectedCategory('Pessoal');
        }
    };

    return (
        <div className="w-full h-full overflow-hidden flex flex-col pt-24 pb-32 bg-background relative">
            
            {/* Header / Tabs */}
            <div className="px-4 mb-6 flex-none">
                <div className="flex items-center justify-between mb-6">
                     <h2 className="text-4xl font-black italic text-gray-900 leading-none tracking-tighter drop-shadow-sm">
                         {activeTab === 'members' ? 'REDE TEEN' : 'MURAL PRAYER'}
                     </h2>
                </div>

                <div className="flex p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
                    <button 
                        onClick={() => setActiveTab('prayers')}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'prayers' ? 'bg-black text-white shadow-lg shadow-black/20 scale-100' : 'text-gray-400 hover:text-gray-600 scale-95'}`}
                    >
                        Pedidos
                    </button>
                    <button 
                        onClick={() => setActiveTab('members')}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'members' ? 'bg-black text-white shadow-lg shadow-black/20 scale-100' : 'text-gray-400 hover:text-gray-600 scale-95'}`}
                    >
                        Membros
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-20 no-scrollbar">
                
                {/* PRAYER REQUESTS TAB */}
                {activeTab === 'prayers' && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500">
                        {/* New Request Button */}
                        <button 
                            onClick={() => setIsAddingPrayer(true)}
                            className="w-full h-16 rounded-[2rem] bg-gradient-to-r from-gray-900 to-gray-800 text-white font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200"
                        >
                            <span className="material-symbols-outlined text-primary text-2xl animate-pulse">add_circle</span>
                            Deixe seu pedido
                        </button>

                        {/* List */}
                        {prayerRequests.length === 0 ? (
                            <div className="text-center py-10 opacity-50 flex flex-col items-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-4xl text-gray-300">volunteer_activism</span>
                                </div>
                                <p className="text-sm font-bold uppercase tracking-widest text-gray-400">O mural está vazio...</p>
                                <p className="text-xs text-gray-400 mt-1">Seja o primeiro a pedir oração!</p>
                            </div>
                        ) : (
                            prayerRequests.map((req) => {
                                const categoryStyle = CATEGORIES.find(c => c.label === req.category) || CATEGORIES[4];
                                const hasPrayed = req.prayedBy.includes(currentUser.uid);
                                const isMine = req.userId === currentUser.uid;
                                const prayedNames = getPrayedByNames(req.prayedBy);
                                
                                return (
                                    <div 
                                        key={req.id} 
                                        className={`relative rounded-[2rem] p-6 transition-all duration-500 overflow-hidden group
                                            ${hasPrayed 
                                                ? 'bg-primary shadow-[0_10px_40px_rgba(249,245,6,0.4)] scale-[1.02]' 
                                                : 'bg-white border-2 border-gray-100 shadow-sm hover:border-gray-300'
                                            }`}
                                    >
                                        {/* Background Decoration */}
                                        {hasPrayed && (
                                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none animate-pulse"></div>
                                        )}

                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-2xl ${req.userAvatarColor} border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                                                     <span className="text-xl">😎</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-3xl font-black italic leading-none tracking-tighter ${hasPrayed ? 'text-black' : 'text-gray-900'}`}>
                                                        {req.userName}
                                                    </span>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${hasPrayed ? 'text-black/60' : 'text-gray-400'}`}>
                                                        {new Date(req.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className={`px-3 py-1.5 rounded-full border-2 border-black/5 flex items-center gap-1.5 shadow-sm ${hasPrayed ? 'bg-white/90' : categoryStyle.bg}`}>
                                                <span className={`material-symbols-outlined text-[14px] ${hasPrayed ? 'text-black' : categoryStyle.color}`}>{categoryStyle.icon}</span>
                                                <span className={`text-[10px] font-black uppercase tracking-wide ${hasPrayed ? 'text-black' : categoryStyle.color}`}>{req.category}</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className={`p-4 rounded-2xl mb-5 relative z-10 ${hasPrayed ? 'bg-black/5' : 'bg-gray-50'}`}>
                                            <span className="absolute -top-3 -left-2 text-4xl opacity-20">❝</span>
                                            <p className={`text-base font-bold leading-tight ${hasPrayed ? 'text-black' : 'text-gray-700'}`}>
                                                {req.description}
                                            </p>
                                        </div>

                                        {/* Footer / Interaction */}
                                        <div className="flex flex-col gap-3 relative z-10">
                                            {/* Who Prayed List */}
                                            {req.prayedBy.length > 0 && (
                                                <div className="flex flex-wrap gap-1 items-center mb-2">
                                                    <span className="material-symbols-outlined text-sm mr-1">bolt</span>
                                                    {prayedNames.slice(0, 3).map((name, i) => (
                                                        <span key={i} className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${hasPrayed ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                            {name}
                                                        </span>
                                                    ))}
                                                    {req.prayedBy.length > 3 && (
                                                        <span className={`text-[10px] font-bold ${hasPrayed ? 'text-black/70' : 'text-gray-400'}`}>
                                                            e +{req.prayedBy.length - 3}
                                                        </span>
                                                    )}
                                                    <span className={`text-[10px] font-medium ml-1 ${hasPrayed ? 'text-black/70' : 'text-gray-400'}`}>oraram</span>
                                                </div>
                                            )}

                                            {/* Action Button */}
                                            {isMine ? (
                                                <div className="w-full py-3 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center gap-2 text-gray-400 font-bold uppercase text-xs tracking-widest cursor-default">
                                                    <span className="material-symbols-outlined text-sm">lock</span>
                                                    Seu Pedido
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => onPray(req.id)}
                                                    className={`w-full py-3.5 rounded-xl font-black italic uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95
                                                        ${hasPrayed 
                                                            ? 'bg-black text-white shadow-lg' 
                                                            : 'bg-gray-900 text-white hover:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[2px] hover:translate-y-[2px]'
                                                        }`}
                                                >
                                                    <span className={`material-symbols-outlined text-lg ${hasPrayed ? 'text-primary' : 'text-white'}`}>
                                                        {hasPrayed ? 'check_circle' : 'volunteer_activism'}
                                                    </span>
                                                    {hasPrayed ? 'Você já orou' : 'Eu Orei por isso!'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div className="h-20"></div> {/* Spacing */}
                    </div>
                )}

                {/* MEMBERS LIST TAB */}
                {activeTab === 'members' && (
                    <div className="space-y-3 animate-in slide-in-from-right duration-300">
                         {/* Current User Card */}
                        <div className="bg-surface border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                            <div className="relative">
                                <div className={`w-12 h-12 rounded-full ${currentUser.avatarColor} border-2 border-white overflow-hidden shadow-sm`}>
                                    <img src={currentUser.photoUrl || `https://picsum.photos/200/200?random=${currentUser.uid}`} className="w-full h-full object-cover" alt="Me" />
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Você</p>
                                <p className="text-lg font-bold text-gray-900">{currentUser.firstName} {currentUser.lastName}</p>
                            </div>
                        </div>

                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2 mt-4">Todos os Membros</p>
                        
                        {members.filter(m => m.uid !== currentUser.uid).length === 0 ? (
                            <p className="text-sm text-gray-400 italic pl-2">Ainda não há outros membros. Convide seus amigos!</p>
                        ) : (
                            members.filter(m => m.uid !== currentUser.uid).map((member) => (
                                <div key={member.uid} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full ${member.avatarColor} border border-white overflow-hidden`}>
                                            <img src={member.photoUrl || `https://picsum.photos/200/200?random=${member.uid}`} className="w-full h-full object-cover" alt={member.firstName} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{member.firstName} {member.lastName}</p>
                                            <p className="text-[10px] text-gray-500">Membro da Rede</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* ADD PRAYER MODAL */}
            {isAddingPrayer && (
                <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col animate-in slide-in-from-bottom duration-300">
                    <div className="p-4 flex items-center justify-between border-b border-gray-100">
                        <button onClick={() => setIsAddingPrayer(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Novo Pedido</span>
                        <div className="w-10"></div>
                    </div>

                    <form onSubmit={handleSubmitPrayer} className="flex-1 p-6 flex flex-col">
                        <h3 className="text-4xl font-black italic text-gray-900 mb-2 leading-none">PRECISA DE<br/><span className="text-primary bg-black px-2">ORAÇÃO?</span></h3>
                        <p className="text-gray-500 text-sm font-medium mb-8">A rede vai interceder por você.</p>
                        
                        <div className="mb-8">
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block tracking-widest">Sobre o que é?</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.label}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.label)}
                                        className={`px-4 py-3 rounded-2xl text-xs font-bold border-2 transition-all flex items-center gap-2 ${selectedCategory === cat.label ? 'bg-black text-white border-black scale-105 shadow-lg' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'}`}
                                    >
                                        <span className="material-symbols-outlined text-base">{cat.icon}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block tracking-widest">Detalhes do Pedido</label>
                            <textarea 
                                value={prayerDescription}
                                onChange={(e) => setPrayerDescription(e.target.value)}
                                placeholder="Conte para nós o que está acontecendo..."
                                className="w-full h-40 bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 text-base font-bold text-gray-900 focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none resize-none placeholder-gray-400 transition-all"
                                required
                            />
                        </div>

                        <button 
                            type="submit"
                            className="w-full h-16 bg-primary hover:bg-primary-dark text-black font-black italic text-xl uppercase tracking-tighter rounded-2xl flex items-center justify-center gap-2 mt-4 shadow-[0_8px_30px_rgba(249,245,6,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <span>Enviar Pedido</span>
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};