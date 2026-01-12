import React, { useState } from 'react';
import { User, CauseAction, ActionType } from '../types';

interface ProfileProps {
  user: User;
  actions: CauseAction[];
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onClearData?: () => void;
}

// Expanded Color Palette for Cover
const COLORS = [
    { name: 'Neon', class: 'bg-primary' },
    { name: 'Blue', class: 'bg-blue-600' },
    { name: 'Indigo', class: 'bg-indigo-600' },
    { name: 'Purple', class: 'bg-purple-600' },
    { name: 'Pink', class: 'bg-pink-500' },
    { name: 'Red', class: 'bg-red-600' },
    { name: 'Orange', class: 'bg-orange-500' },
    { name: 'Green', class: 'bg-green-600' },
    { name: 'Teal', class: 'bg-teal-600' },
    { name: 'Black', class: 'bg-gray-900' },
];

export const Profile: React.FC<ProfileProps> = ({ user, actions, onUpdateUser, onLogout, onClearData }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editFirstName, setEditFirstName] = useState(user.firstName);
    const [editLastName, setEditLastName] = useState(user.lastName);
    const [editColor, setEditColor] = useState(user.avatarColor); // Now acts as Cover Color
    const [editPhotoUrl, setEditPhotoUrl] = useState(user.photoUrl || '');
    
    // Seed for default random images if no URL is provided
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
        <div className="w-full h-full overflow-y-auto bg-background pb-32">
            
            {/* --- PROFILE COVER --- */}
            <div className={`w-full h-48 relative ${isEditing ? editColor : user.avatarColor} transition-colors duration-500`}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30"></div>
                
                {/* Header Buttons */}
                <div className="absolute top-4 right-4 z-20">
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/30 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">edit</span> Editar Perfil
                        </button>
                    ) : (
                        <button 
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-2 rounded-full bg-white text-xs font-bold uppercase tracking-wider text-black hover:scale-105 shadow-lg transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">check</span> Salvar
                        </button>
                    )}
                </div>
            </div>

            <div className="px-4 relative -mt-16 mb-8">
                {/* Avatar & Badge */}
                <div className="flex flex-col items-center">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full border-[6px] border-white bg-gray-200 shadow-xl overflow-hidden relative z-10">
                            <img src={currentImageSrc} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        
                        {/* Verified Badge */}
                        <div className="absolute bottom-1 right-1 z-20">
                            <div className="bg-blue-600 rounded-full p-1.5 border-4 border-white shadow-md flex items-center justify-center" title="Membro Verificado">
                                <span className="material-symbols-outlined text-white text-base font-bold filled">verified</span>
                            </div>
                        </div>
                    </div>

                    {/* Edit Mode Content */}
                    {isEditing ? (
                        <div className="w-full max-w-sm mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl">
                            
                            {/* Names */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nome</label>
                                    <input 
                                        type="text" 
                                        value={editFirstName}
                                        onChange={(e) => setEditFirstName(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Sobrenome</label>
                                    <input 
                                        type="text" 
                                        value={editLastName}
                                        onChange={(e) => setEditLastName(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    />
                                </div>
                            </div>

                            {/* Photo URL */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block">Foto de Perfil (Link/URL)</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Cole o link da imagem aqui..."
                                        value={editPhotoUrl}
                                        onChange={(e) => setEditPhotoUrl(e.target.value)}
                                        className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-400"
                                    />
                                    {editPhotoUrl && (
                                        <button 
                                            onClick={() => setEditPhotoUrl('')}
                                            className="px-3 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100"
                                            title="Remover foto"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 ml-1">Cole qualquer link de imagem da web (ex: Google Imagens, Instagram CDN, etc).</p>
                            </div>

                            {/* Cover Color Picker */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-3 block">Cor da Capa</label>
                                <div className="flex flex-wrap gap-3 justify-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    {COLORS.map(c => (
                                        <button
                                            key={c.name}
                                            onClick={() => setEditColor(c.class)}
                                            className={`w-8 h-8 rounded-full shadow-sm transition-all duration-300 ${c.class} ${editColor === c.class ? 'ring-4 ring-black/20 scale-110' : 'hover:scale-105'}`}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Read Only View */
                        <div className="text-center mt-3">
                            <h2 className="text-3xl font-black italic text-gray-900 leading-none tracking-tight">
                                {user.firstName} {user.lastName}
                            </h2>
                            <div className="flex items-center justify-center gap-1.5 mt-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Membro Ativo</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!isEditing && (
                <div className="px-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black italic text-gray-900">MEU IMPACTO</h3>
                        <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Acumulado</span>
                    </div>

                    <div className="space-y-3 mb-8">
                        {stats.map(stat => (
                            <div key={stat.label} className="flex items-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm gap-4 group hover:border-gray-200 transition-colors">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} border border-black/5`}>
                                    <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-2xl font-black text-gray-900 leading-none">{stat.count}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-8 space-y-3">
                        <button 
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-gray-50 text-gray-600 font-bold text-xs uppercase tracking-widest border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Sair da Conta
                        </button>

                         {onClearData && (
                            <button 
                                onClick={onClearData}
                                className="w-full text-center text-[10px] text-gray-300 hover:text-red-400 font-bold uppercase tracking-widest transition-colors py-2"
                            >
                                Resetar Dados Locais
                            </button>
                        )}
                        
                        <div className="flex justify-center mt-4">
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">VIBE TEEN ID: {user.uid.slice(-6)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
