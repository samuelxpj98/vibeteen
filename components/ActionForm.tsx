import React, { useState } from 'react';
import { ActionType, User } from '../types';

interface ActionFormProps {
  onClose: () => void;
  onSubmit: (type: ActionType, friendName: string) => void;
  user: User;
}

export const ActionForm: React.FC<ActionFormProps> = ({ onClose, onSubmit, user }) => {
    const [friendName, setFriendName] = useState('');
    const [selectedType, setSelectedType] = useState<ActionType | null>(null);

    const handleSubmit = () => {
        if (!selectedType) return;
        onSubmit(selectedType, friendName);
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white/95 backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <header className="p-4 flex items-center justify-between">
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-900 active:scale-95 hover:bg-gray-200 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Nova Ação</h2>
                <div className="w-10"></div>
            </header>

            <div className="flex-1 px-6 py-4 overflow-y-auto">
                <h1 className="text-3xl font-black italic text-gray-900 leading-tight mb-2">
                    O QUE VOCÊ<br/> FEZ HOJE, {user.firstName.toUpperCase()}?
                </h1>
                <p className="text-gray-500 mb-8 font-medium">
                    Registre sua pequena ação e inspire outros.
                </p>

                {/* Input Friend */}
                <div className="mb-8">
                    <label className="text-sm font-bold text-gray-400 mb-2 block">Quem foi abençoado? <span className="opacity-50 font-normal">(Opcional)</span></label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">person</span>
                        <input 
                            type="text" 
                            value={friendName}
                            onChange={(e) => setFriendName(e.target.value)}
                            placeholder="Alguém especial..."
                            className="w-full h-14 pl-12 pr-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-semibold"
                        />
                    </div>
                </div>

                {/* Action Selection */}
                <div className="space-y-4">
                    <p className="text-sm font-bold text-gray-400">Selecione a ação</p>

                    {/* OREI */}
                    <button 
                        onClick={() => setSelectedType(ActionType.OREI)}
                        className={`w-full p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 text-left group
                            ${selectedType === ActionType.OREI ? 'bg-white border-action-blue shadow-[0_4px_20px_rgba(0,132,255,0.15)]' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selectedType === ActionType.OREI ? 'bg-action-blue text-white' : 'bg-blue-100 text-action-blue'}`}>
                            <span className="material-symbols-outlined text-2xl">volunteer_activism</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-gray-900 font-bold text-lg">Orei</h3>
                            <p className="text-gray-500 text-xs font-medium">Clamei a Deus por esta vida.</p>
                        </div>
                        {selectedType === ActionType.OREI && <span className="material-symbols-outlined text-action-blue">check_circle</span>}
                    </button>

                    {/* CUIDEI */}
                    <button 
                        onClick={() => setSelectedType(ActionType.CUIDEI)}
                        className={`w-full p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 text-left group
                            ${selectedType === ActionType.CUIDEI ? 'bg-white border-action-green shadow-[0_4px_20px_rgba(0,245,118,0.15)]' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selectedType === ActionType.CUIDEI ? 'bg-action-green text-white' : 'bg-green-100 text-action-green'}`}>
                            <span className="material-symbols-outlined text-2xl">potted_plant</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-gray-900 font-bold text-lg">Cuidei</h3>
                            <p className="text-gray-500 text-xs font-medium">Demonstrei amor prático.</p>
                        </div>
                        {selectedType === ActionType.CUIDEI && <span className="material-symbols-outlined text-action-green">check_circle</span>}
                    </button>

                    {/* COMPARTILHEI */}
                    <button 
                        onClick={() => setSelectedType(ActionType.COMPARTILHEI)}
                        className={`w-full p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 text-left group
                            ${selectedType === ActionType.COMPARTILHEI ? 'bg-white border-action-orange shadow-[0_4px_20px_rgba(255,94,0,0.15)]' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selectedType === ActionType.COMPARTILHEI ? 'bg-action-orange text-white' : 'bg-orange-100 text-action-orange'}`}>
                            <span className="material-symbols-outlined text-2xl">forum</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-gray-900 font-bold text-lg">Compartilhei</h3>
                            <p className="text-gray-500 text-xs font-medium">Falei de Jesus.</p>
                        </div>
                        {selectedType === ActionType.COMPARTILHEI && <span className="material-symbols-outlined text-action-orange">check_circle</span>}
                    </button>
                </div>
            </div>

            <div className="p-6 bg-gradient-to-t from-white via-white to-transparent">
                <button 
                    disabled={!selectedType}
                    onClick={handleSubmit}
                    className="w-full h-16 bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark text-black font-black italic text-xl uppercase tracking-tighter rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_20px_rgba(249,245,6,0.3)] border border-transparent"
                >
                    <span>Registrar no Muro</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};