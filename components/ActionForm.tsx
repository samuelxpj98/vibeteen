
import React, { useState } from 'react';
import { ActionType, User } from '../types';

interface ActionFormProps {
  onClose: () => void;
  onSubmit: (type: ActionType, friendName: string) => Promise<void>;
  user: User;
}

export const ActionForm: React.FC<ActionFormProps> = ({ onClose, onSubmit, user }) => {
    const [selectedType, setSelectedType] = useState<ActionType | null>(null);
    const [friendName, setFriendName] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handlePublish = async () => {
        if (!selectedType || !friendName.trim() || status !== 'idle') return;
        setStatus('submitting');
        try {
            await onSubmit(selectedType, friendName);
            setStatus('success');
            setTimeout(() => {
                onClose();
            }, 1200);
        } catch (e) {
            setStatus('idle');
            alert("Erro ao publicar. Tente novamente.");
        }
    };

    if (status === 'success') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary animate-in fade-in duration-300">
                <div className="text-center animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-black text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <span className="material-symbols-outlined text-6xl font-black">check</span>
                    </div>
                    <h2 className="text-3xl font-black italic text-black uppercase tracking-tighter">Impacto Registrado!</h2>
                    <p className="text-black/60 font-bold uppercase text-xs mt-2 tracking-widest">O Reino de Deus avançou hoje.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white/95 backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
            <header className="p-4 flex items-center justify-between flex-none">
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center transition-transform active:scale-90">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Registrar Impacto</h2>
                <div className="w-10"></div>
            </header>

            {/* Adicionado pb-48 para garantir muito espaço de rolagem acima do botão fixo */}
            <div className="flex-1 px-6 py-2 overflow-y-auto no-scrollbar pb-48">
                <h1 className="text-3xl font-black italic text-gray-900 leading-tight mb-1 uppercase tracking-tighter">
                    O que você fez<br/> hoje, {user.firstName}?
                </h1>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-6">Selecione o tipo de ação</p>
                
                {/* Reduzi o espaçamento vertical entre botões para economizar espaço */}
                <div className="space-y-3 mb-6">
                    <ActionBtn 
                        active={selectedType === ActionType.OREI} 
                        onClick={() => setSelectedType(ActionType.OREI)} 
                        icon="volunteer_activism" 
                        title="ORAR" 
                        color="text-action-blue" 
                        bg="bg-blue-50" 
                        disabled={status === 'submitting'} 
                    />
                    <ActionBtn 
                        active={selectedType === ActionType.CUIDEI} 
                        onClick={() => setSelectedType(ActionType.CUIDEI)} 
                        icon="potted_plant" 
                        title="CUIDAR" 
                        color="text-action-green" 
                        bg="bg-green-50" 
                        disabled={status === 'submitting'} 
                    />
                    <ActionBtn 
                        active={selectedType === ActionType.COMPARTILHEI} 
                        onClick={() => setSelectedType(ActionType.COMPARTILHEI)} 
                        icon="forum" 
                        title="COMPARTILHAR" 
                        color="text-action-orange" 
                        bg="bg-orange-50" 
                        disabled={status === 'submitting'} 
                    />
                    <ActionBtn 
                        active={selectedType === ActionType.CONVIDEI} 
                        onClick={() => setSelectedType(ActionType.CONVIDEI)} 
                        icon="person_add" 
                        title="CONVIDAR" 
                        color="text-purple-600" 
                        bg="bg-purple-50" 
                        disabled={status === 'submitting'} 
                    />
                </div>

                {/* Input agora tem um container dedicado e margem superior ajustada */}
                {selectedType && (
                    <div className="animate-in slide-in-from-bottom-4 duration-300 bg-gray-50 p-4 rounded-3xl border border-gray-100 mb-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-2 block tracking-widest">
                            QUEM RECEBEU ESSA AÇÃO?
                        </label>
                        <div className="relative">
                            <input 
                                type="text"
                                autoFocus
                                value={friendName}
                                onChange={(e) => setFriendName(e.target.value)}
                                placeholder="Nome da pessoa..."
                                className="w-full h-14 bg-white border-2 border-gray-200 focus:border-black rounded-xl px-4 text-lg font-bold outline-none transition-all shadow-sm"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <span className="material-symbols-outlined text-gray-300">edit</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 bg-white border-t border-gray-100 absolute bottom-0 w-full">
                <button 
                    disabled={!selectedType || !friendName.trim() || status === 'submitting'} 
                    onClick={handlePublish} 
                    className={`w-full h-16 bg-primary text-black font-black italic text-xl uppercase tracking-tighter rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${status === 'submitting' ? '' : 'hover:scale-[1.02]'}`}
                >
                    {status === 'submitting' ? (
                        <>
                            <span className="animate-spin material-symbols-outlined">sync</span>
                            <span>Sincronizando...</span>
                        </>
                    ) : (
                        <>
                            <span>Publicar Impacto</span>
                            <span className="material-symbols-outlined">send</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const ActionBtn = ({active, onClick, icon, title, color, bg, disabled}: any) => (
    <button 
        disabled={disabled}
        onClick={onClick} 
        className={`w-full p-3.5 rounded-2xl border-2 transition-all flex items-center gap-4 ${active ? 'bg-white border-black shadow-xl scale-[1.02] z-10' : 'bg-gray-50 border-transparent opacity-60 hover:opacity-100'}`}
    >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${color}`}>
            <span className="material-symbols-outlined text-xl font-bold">{icon}</span>
        </div>
        <span className="text-base font-black italic text-gray-900 uppercase tracking-tight">{title}</span>
        {active && <span className="ml-auto material-symbols-outlined text-black">check_circle</span>}
    </button>
);
