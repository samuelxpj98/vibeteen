
// Tipos de Ação
export enum ActionType {
    OREI = 'orei',                // Cor: Azul
    CUIDEI = 'cuidei',            // Cor: Verde
    COMPARTILHEI = 'compartilhei', // Cor: Laranja
    CONVIDEI = 'convidei'         // Cor: Roxo (Novo)
}
  
export type UserRole = 'member' | 'visitor';

// O Usuário
export interface User {
    uid: string;
    firstName: string;
    lastName: string;
    email: string; 
    avatarColor: string;
    photoUrl?: string; 
    church?: 'Vibe Teen' | 'Outra Igreja';
    birthDate?: string; // Novo campo
    role: UserRole;
    createdAt: string;
    // Gamificação
    xp: number;
    streak: number;
    lastActionDate?: string;
}

// A Ação
export interface CauseAction {
    id: string;
    userId: string;
    userName: string;
    userColor: string;
    userPhotoUrl?: string;    
    friendName: string;       
    action: ActionType;       
    timestamp: string;        
    prayedBy: string[];       
}

export interface Coordinates {
    x: number;
    y: number;
}

// Tipos de Pedido de Oração
export type PrayerCategory = 'Saúde' | 'Escola' | 'Família' | 'Pessoal' | 'Outro';

export interface PrayerRequest {
    id: string;
    userId: string;
    userName: string;
    userAvatarColor: string;
    userPhotoUrl?: string; 
    category: PrayerCategory;
    description: string;
    prayedBy: string[]; 
    timestamp: string;
}
