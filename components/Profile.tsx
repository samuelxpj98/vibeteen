import React, { useState } from 'react';
import { User, CauseAction, ActionType } from '../types';

interface ProfileProps {
  user: User;
  actions: CauseAction[];
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onClearData?: () => void;
}

const COLORS = [
    { name: 'Neon', class: 'bg-primary' },
    { name: 'Blue', class: 'bg-action-blue' },
    { name: 'Green', class: 'bg-action-green' },
    { name: 'Orange', class: 'bg-action-orange' },
    { name: 'Purple', class: 'bg-purple-500' },
    { name: 'Pink', class: 'bg-pink-500' },
];

export const Profile: React.FC<ProfileProps> = ({ user, actions, onUpdateUser, onLogout, onClearData }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editFirstName, setEditFirstName] = useState(user.firstName);
    const [editLastName, setEditLastName] = useState(user.lastName);
    const [editColor, setEditColor] = useState(user.avatarColor);
    const [editPhotoUrl, setEditPhotoUrl] = useState(user.photoUrl || '');
    
    // Seed for default random images
    const [photoSeed, setPhotoSeed] = useState(user.uid); 

    const myActions = actions.filter(a => a.userId === user.uid);
    
    const stats = [
        { type: ActionType.OREI, count: myActions.filter(a => a.action === ActionType.OREI).length, label: 'Orações', color: 'text-action-blue', bg: 'bg-blue-50', icon: 'volunteer_activism' },
        { type: ActionType.CUIDEI, count: myActions.filter(a => a.action === ActionType.CUIDEI).length, label: 'Cuidado', color: 'text-action-green', bg: 'bg-green-50', icon: 'potted_plant' },
        { type: ActionType.COMPARTILHEI, count: myActions.filter(a => a.action === ActionType.COMPARTILHEI).length, label: 'Evangelismo', color: 'text-action-orange', bg: 'bg-orange-50', icon: 'forum' },
    ];

    const handleSave = () => {
        onUpdateUser({
            ...user,
            firstName: editFirstName,
            lastName: editLastName,
            avatarColor: editColor,
            photoUrl: editPhotoUrl.trim() !== '' ? editPhotoUrl : undefined
        });
        setIsEditing(false);
    };

    const currentImageSrc = editPhotoUrl && editPhotoUrl.trim() !== '' 
        ? editPhotoUrl 
        : `https://picsum.photos/200/200?random=${photoSeed}`;

    return (
        <div className="w-full h-full overflow-y-auto px-4 pt-24 pb-32 bg-background">
            
            {/* Header / Actions */}
            <div className="flex justify-end mb-2">
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-200"
                    >
                        <span className="material-symbols-outlined text-sm">edit</span> Editar
                    </button>
                ) : (
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-xs font-bold uppercase tracking-wider text-black hover:bg-primary-dark"
                    >
                        <span className="material-symbols-outlined text-sm">check</span> Salvar
                    </button>
                )}
            </div>

            <div className="flex flex-col items-center mb-8">
                {/* Avatar Section */}
                <div className="relative mb-4 group">
                    <div className={`absolute -inset-1 rounded-full blur opacity-60 ${editColor.replace('bg-', 'bg-')}/50`}></div>
                    <div className={`w-32 h-32 rounded-full border-4 border-white ${editColor} overflow-hidden relative z-10 shadow-xl bg-gray-200`}>
                        <img src={currentImageSrc} alt="Profile" className="w-full h-full object-cover" />
                        
                        {isEditing && !editPhotoUrl && (
                            <button 
                                onClick={() => setPhotoSeed(`seed-${Date.now()}`)}
                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <span className="material-symbols-outlined text-white">refresh</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Edit Form or Display */}
                {isEditing ? (
                    <div className="w-full max-w-xs space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Nome</label>
                                <input 
                                    type="text" 
                                    value={editFirstName}
                                    onChange={(e) => setEditFirstName(e.target.value)}
                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Sobrenome</label>
                                <input 
                                    type="text" 
                                    value={editLastName}
                                    onChange={(e) => setEditLastName(e.target.value)}
                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                         <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Link da Foto (Opcional)</label>
                            <input 
                                type="text" 
                                placeholder="https://..."
                                value={editPhotoUrl}
                                onChange={(e) => setEditPhotoUrl(e.target.value)}
                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 outline-none focus:border-primary placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Cor do Perfil</label>
                            <div className="flex gap-2 justify-center">
                                {COLORS.map(c => (
                                    <button
                                        key={c.name}
                                        onClick={() => setEditColor(c.class)}
                                        className={`w-8 h-8 rounded-full border-2 ${c.class} ${editColor === c.class ? 'border-black scale-110' : 'border-transparent'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-black italic text-gray-900">{user.firstName} {user.lastName}</h2>
                        <div className={`mt-2 px-3 py-1 rounded-full bg-opacity-10 ${user.avatarColor.replace('bg-', 'text-')} bg-gray-900 text-xs font-bold uppercase tracking-wider border border-gray-100`}>
                            Membro da Rede
                        </div>
                    </>
                )}
            </div>

            {!isEditing && (
                <>
                    <div className="flex items-center justify-between px-2 mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Meu Impacto</h3>
                        <span className="text-xs text-gray-500">Total acumulado</span>
                    </div>

                    <div className="space-y-4 mb-8">
                        {stats.map(stat => (
                            <div key={stat.label} className="flex items-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm gap-4 group">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} border border-black/5`}>
                                    <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase">{stat.label}</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-black text-gray-900 leading-none">{stat.count}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-6 space-y-4">
                        <button 
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-widest border border-gray-100 hover:bg-gray-100 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Sair da Conta
                        </button>

                         {onClearData && (
                            <button 
                                onClick={onClearData}
                                className="w-full text-center text-[10px] text-red-300 hover:text-red-500 font-bold uppercase tracking-widest transition-colors"
                            >
                                Limpar Dados (Debug)
                            </button>
                        )}

                        <p className="text-center text-[10px] text-gray-300 mt-4 font-medium uppercase tracking-wider">
                            VIBE TEEN v1.2
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};