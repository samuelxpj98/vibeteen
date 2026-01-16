
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
    const [submittingPrayerId, setSubmittingPrayerId] = useState<string | null>(null);

    const getPrayedByNames = (uids: string[]) => {
        return uids.map(uid => {
            if (uid === currentUser.uid) return "Você";
            const member = members.find(m => m.uid === uid);
            return member ? member.firstName : "Alguém";
        });
    };

    const handlePrayClick = async (requestId: string) => {
        if (submittingPrayerId) return;
        setSubmittingPrayerId(requestId);
        try {
            await onPray(requestId);
        } finally {
            setSubmittingPrayerId(null);
        }
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
            <div className="px-4 mb-6 flex-none">
                <div className="flex items-center justify-between mb-4">
                     <h2 className="text-4xl font-black italic text-gray-900 leading-none tracking-tighter uppercase">
                         {activeTab === 'members' ? 'Rede Teen' : 'Oração'}
                     </h2>
                </div>

                <div className="flex p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
                    <button 
                        onClick={() => setActiveTab('prayers')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${activeTab === 'prayers' ? 'bg-black text-white shadow-xl' : 'text-gray-400'}`}
                    >
                        Mural
                    </button>
                    <button 
                        onClick={() => setActiveTab('members')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${activeTab === 'members' ? 'bg-black text-white shadow-xl' : 'text-gray-400'}`}
                    >
                        Membros
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-20 no-scrollbar">
                
                {activeTab === 'prayers' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <button 
                            onClick={() => setIsAddingPrayer(true)}
                            className="w-full p-6 rounded-[2rem] bg-gray-900 text-white flex items-center justify-center gap-4 hover:bg-black transition-colors shadow-2xl shadow-gray-200"
                        >
                            <span className="material-symbols-outlined text-primary text-3xl animate-bounce">add_circle</span>
                            <span className="text-sm font-black uppercase tracking-widest">Pedir Oração</span>
                        </button>

                        {prayerRequests.length === 0 ? (
                            <div className="text-center py-16 opacity-30 flex flex-col items-center">
                                <span className="material-symbols-outlined text-6xl mb-4">sentiment_dissatisfied</span>
                                <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Silêncio no Mural...</p>
                            </div>
                        ) : (
                            prayerRequests.map((req) => {
                                const cat = CATEGORIES.find(c => c.label === req.category) || CATEGORIES[4];
                                const hasPrayed = req.prayedBy.includes(currentUser.uid);
                                const isMine = req.userId === currentUser.uid;
                                const isSubmitting = submittingPrayerId === req.id;

                                return (
                                    <div key={req.id} className={`rounded-[2.5rem] p-6 border-2 transition-all ${hasPrayed ? 'bg-primary border-primary shadow-xl scale-[1.02]' : 'bg-white border-gray-100 shadow-sm'}`}>
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-2xl border-2 border-white flex items-center justify-center shadow-sm ${req.userAvatarColor || 'bg-gray-200'}`}>
                                                     <span className="material-symbols-outlined text-white text-xl opacity-40">person</span>
                                                </div>
                                                <div>
                                                    <p className={`text-xl font-black italic leading-none ${hasPrayed ? 'text-black' : 'text-gray-900'}`}>{req.userName}</p>
                                                    <p className={`text-[9px] font-bold uppercase ${hasPrayed ? 'text-black/50' : 'text-gray-400'}`}>{req.category}</p>
                                                </div>
                                            </div>
                                            <div className={`p-2 rounded-xl ${hasPrayed ? 'bg-black text-white' : cat.bg + ' ' + cat.color}`}>
                                                <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                                            </div>
                                        </div>

                                        <div className={`p-5 rounded-2xl mb-6 ${hasPrayed ? 'bg-black/5' : 'bg-gray-50'}`}>
                                            <p className={`text-base font-bold italic leading-tight ${hasPrayed ? 'text-black' : 'text-gray-700'}`}>"{req.description}"</p>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            {req.prayedBy.length > 0 && (
                                                <div className="flex items-center gap-1 mb-1">
                                                     <span className="material-symbols-outlined text-sm text-gray-400 mr-1">bolt</span>
                                                     {getPrayedByNames(req.prayedBy).slice(0, 3).map((n, i) => (
                                                         <span key={i} className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${hasPrayed ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-400'}`}>{n}</span>
                                                     ))}
                                                     {req.prayedBy.length > 3 && <span className="text-[8px] text-gray-400 font-bold">+{req.prayedBy.length - 3}</span>}
                                                </div>
                                            )}

                                            <button 
                                                disabled={isMine || isSubmitting}
                                                onClick={() => handlePrayClick(req.id)}
                                                className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${isMine ? 'bg-gray-100 text-gray-300' : hasPrayed ? 'bg-black text-white' : 'bg-gray-900 text-white'} ${isSubmitting ? 'opacity-50' : ''}`}
                                            >
                                                {isSubmitting ? (
                                                    <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-sm">{hasPrayed ? 'verified' : 'volunteer_activism'}</span>
                                                )}
                                                {isMine ? 'SEU PEDIDO' : isSubmitting ? 'ENVIANDO...' : hasPrayed ? 'EU JÁ OREI!' : 'EU OREI POR ISSO'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div className="h-20"></div>
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="space-y-4 animate-in slide-in-from-right duration-300">
                        {members.map(member => (
                            <div key={member.uid} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl border-2 border-primary flex items-center justify-center shadow-sm ${member.avatarColor}`}>
                                        <span className="material-symbols-outlined text-white text-xl opacity-40">person</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 uppercase italic tracking-tighter">{member.firstName} {member.lastName}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <span className="text-[8px] font-bold text-gray-400 uppercase">Vibe Teen</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-orange-500 italic">{member.streak}D FIRE</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Pedido de Oração Corrigido (Fixed inset-0) */}
            {isAddingPrayer && (
                <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
                    <header className="p-4 flex items-center justify-between border-b border-gray-100 flex-none">
                        <button onClick={() => setIsAddingPrayer(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><span className="material-symbols-outlined text-sm">close</span></button>
                        <span className="text-xs font-black uppercase tracking-widest">Novo Pedido</span>
                        <div className="w-10"></div>
                    </header>
                    <form onSubmit={handleSubmitPrayer} className="p-6 flex flex-col flex-1 overflow-y-auto no-scrollbar">
                        <h2 className="text-4xl font-black italic text-gray-900 leading-none mb-8">O QUE ESTÁ NO<br/><span className="text-primary bg-black px-2">CORAÇÃO?</span></h2>
                        <div className="mb-8">
                            <label className="text-[10px] font-black text-gray-400 uppercase mb-3 block tracking-widest">CATEGORIA</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(c => (
                                    <button key={c.label} type="button" onClick={() => setSelectedCategory(c.label)} className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${selectedCategory === c.label ? 'bg-black text-white scale-105 shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1">
                             <label className="text-[10px] font-black text-gray-400 uppercase mb-3 block tracking-widest">DESCRIÇÃO</label>
                             <textarea 
                                value={prayerDescription} 
                                onChange={e => setPrayerDescription(e.target.value)} 
                                placeholder="Conte aqui o seu pedido..." 
                                className="w-full h-40 bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 font-bold text-gray-900 focus:border-primary outline-none resize-none transition-all" 
                                required 
                             />
                        </div>
                        <button type="submit" className="w-full h-16 bg-primary text-black font-black italic text-xl uppercase rounded-2xl shadow-xl mt-6 flex items-center justify-center gap-2 mb-8">
                            <span>PUBLICAR PEDIDO</span>
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
