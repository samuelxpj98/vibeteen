// Tipos de Ação
export enum ActionType {
    OREI = 'orei',                // Cor: Azul
    CUIDEI = 'cuidei',            // Cor: Verde
    COMPARTILHEI = 'compartilhei' // Cor: Laranja
}
  
export type UserRole = 'member' | 'visitor';

// O Usuário
export interface User {
    uid: string;
    firstName: string;
    lastName: string;
    email: string; // Used as login
    avatarColor: string;
    photoUrl?: string; // New field for custom image URL
    church?: 'Vibe Teen' | 'Outra Igreja';
    role: UserRole;
    createdAt: string;
}

// A Ação (O Impacto)
export interface CauseAction {
    id: string;
    userId: string;
    userName: string;
    userColor: string;
    friendName: string;       // Quem recebeu a ação (ex: "João")
    action: ActionType;       // Tipo
    timestamp: string;        // Data ISO
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
    category: PrayerCategory;
    description: string;
    prayedBy: string[]; // Lista de UIDs de quem orou
    timestamp: string;
}