
import React, { useState, useEffect } from 'react';
import { User, CauseAction, ActionType, PrayerRequest, PrayerCategory } from './types';
import { getFixedDailyMission } from './services/missionData';
import { Mural } from './components/Mural';
import { ActionForm } from './components/ActionForm';
import { Stats } from './components/Stats';
import { Profile } from './components/Profile';
import { MembersList } from './components/MembersList';
import { WelcomeScreen } from './components/WelcomeScreen';

import { db } from './services/firebaseConfig';
import { 
    collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, setDoc, where, getDocs
} from 'firebase/firestore';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
      try {
          const savedUser = localStorage.getItem('vibeteen_user_session');
          return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) { return null; }
  });

  const [members, setMembers] = useState<User[]>([]);
  const [actions, setActions] = useState<CauseAction[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [currentView, setCurrentView] = useState<'mural' | 'rank' | 'members' | 'profile'>('mural');
  const [showAddForm, setShowAddForm] = useState(false);
  const [dailyMission, setDailyMission] = useState<string>(getFixedDailyMission());
  const [toastMessage, setToastMessage] = useState<{msg: string, icon: string} | null>(null);

  useEffect(() => {
    const q = query(collection(db, "actions"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => setActions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CauseAction[]));
  }, []);

  useEffect(() => {
    const q = query(collection(db, "prayers"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
        setPrayerRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PrayerRequest[]);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, "users"));
    return onSnapshot(q, (snapshot) => {
        const ms = snapshot.docs.map(doc => ({ ...doc.data() })) as User[];
        setMembers(ms);
        if (user) { 
            const me = ms.find(m => m.uid === user.uid); 
            if (me) {
                setUser(me);
                localStorage.setItem('vibeteen_user_session', JSON.stringify(me));
            } 
        }
    });
  }, [user?.uid]);

  // Atualizar missão ao mudar o dia (se o app ficar aberto na virada)
  useEffect(() => {
    const interval = setInterval(() => {
        setDailyMission(getFixedDailyMission());
    }, 1000 * 60 * 30); // Checa a cada 30min
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string, icon: string = 'bolt') => {
      setToastMessage({ msg, icon });
      setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddAction = async (type: ActionType, friendName: string) => {
    if (!user || user.role === 'visitor') return;
    
    const xpTable = { [ActionType.OREI]: 10, [ActionType.CUIDEI]: 15, [ActionType.COMPARTILHEI]: 25, [ActionType.CONVIDEI]: 50 };
    const xpGain = xpTable[type];
    const newXp = (user.xp || 0) + xpGain;
    
    const today = new Date().toISOString().split('T')[0];
    const lastDate = user.lastActionDate;
    let newStreak = user.streak || 0;
    if (lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        newStreak = (lastDate === yesterday) ? newStreak + 1 : 1;
    }

    // Salvar nome completo para exibição correta no mural (ex: Samuel D.)
    const fullName = `${user.firstName} ${user.lastName}`.trim();

    try {
        await addDoc(collection(db, "actions"), {
            userId: user.uid, 
            userName: fullName, // Salva nome completo
            userColor: user.avatarColor,
            friendName, action: type,
            timestamp: new Date().toISOString(), prayedBy: []
        });

        await updateDoc(doc(db, "users", user.uid), { 
            xp: newXp, streak: newStreak, lastActionDate: today 
        });

        showToast(`Impacto +${xpGain} XP!`, 'rocket_launch');
    } catch (e) { console.error(e); showToast("Erro ao postar", "error"); }
  };

  const handleAddPrayerRequest = async (category: PrayerCategory, description: string) => {
      if (!user) return;
      try {
          await addDoc(collection(db, "prayers"), {
              userId: user.uid, userName: user.firstName, userAvatarColor: user.avatarColor,
              category, description, prayedBy: [], timestamp: new Date().toISOString()
          });
          showToast("Pedido no Mural!", "volunteer_activism");
      } catch (e) { console.error(e); }
  };

  const handleTogglePray = async (requestId: string) => {
      if (!user) return;
      const req = prayerRequests.find(r => r.id === requestId);
      if (!req) return;
      const newPrayedBy = req.prayedBy.includes(user.uid) ? req.prayedBy.filter(u => u !== user.uid) : [...req.prayedBy, user.uid];
      await updateDoc(doc(db, "prayers", requestId), { prayedBy: newPrayedBy });
      if (!req.prayedBy.includes(user.uid)) showToast("Você Orou! 🔥", "bolt");
  };

  const handleLogin = async (userData: User) => {
      const userRef = doc(db, "users", userData.uid);
      const userSnap = await getDocs(query(collection(db, "users"), where("uid", "==", userData.uid)));
      
      if (userSnap.empty) {
          // Se não tiver cor definida (ex: visitante ou registro manual sem cor), atribui uma aleatória
          if (!userData.avatarColor) {
              const colors = [
                  'bg-primary', 'bg-action-blue', 'bg-action-green', 'bg-action-orange',
                  'bg-purple-600', 'bg-pink-500', 'bg-red-500', 'bg-orange-500',
              ];
              userData.avatarColor = colors[Math.floor(Math.random() * colors.length)];
          }
          await setDoc(userRef, userData);
      } else {
          userData = userSnap.docs[0].data() as User;
      }
      setUser(userData);
      localStorage.setItem('vibeteen_user_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('vibeteen_user_session');
  };

  if (!user) return <WelcomeScreen onLogin={handleLogin} />;

  return (
    <div className="bg-background min-h-screen text-gray-900 font-sans overflow-hidden relative">
      {toastMessage && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top-10 duration-500">
              <div className="bg-gray-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-3 border-2 border-primary/20">
                  <span className="material-symbols-outlined text-primary text-2xl filled">{toastMessage.icon}</span>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">{toastMessage.msg}</span>
              </div>
          </div>
      )}

      <main className="w-full h-screen relative">
        {currentView === 'mural' && <Mural actions={actions} onAddClick={() => setShowAddForm(true)} mission={dailyMission} isVisitor={user.role === 'visitor'} currentUser={user} onToggleSupport={() => {}} />}
        {currentView === 'rank' && <Stats actions={actions} />}
        {currentView === 'members' && <MembersList members={members} currentUser={user} prayerRequests={prayerRequests} onAddPrayer={handleAddPrayerRequest} onPray={handleTogglePray} />}
        {currentView === 'profile' && <Profile user={user} actions={actions} onUpdateUser={async (u) => await updateDoc(doc(db, "users", u.uid), u as any)} onLogout={handleLogout} />}
      </main>

      {showAddForm && <ActionForm user={user} onClose={() => setShowAddForm(false)} onSubmit={handleAddAction} />}

      <nav className="fixed bottom-0 w-full z-40 px-4 pb-6 pt-2 pointer-events-none">
        <div className="h-[76px] w-full max-w-lg mx-auto bg-white/95 backdrop-blur-xl border border-gray-200 rounded-[2.5rem] shadow-2xl flex items-center justify-between px-8 pointer-events-auto">
            <NavBtn icon="grid_view" label="Mural" active={currentView === 'mural'} onClick={() => setCurrentView('mural')} />
            <NavBtn icon="leaderboard" label="Vibe" active={currentView === 'rank'} onClick={() => setCurrentView('rank')} />
            <NavBtn icon="volunteer_activism" label="Oração" active={currentView === 'members'} onClick={() => setCurrentView('members')} />
            <button onClick={() => setCurrentView('profile')} className={`flex flex-col items-center gap-1 transition-all ${currentView === 'profile' ? 'scale-125' : 'opacity-100 grayscale'}`}>
                <div className={`w-8 h-8 rounded-2xl flex items-center justify-center border-2 transition-all ${currentView === 'profile' ? 'border-primary' : 'border-gray-200'} ${user.avatarColor}`}>
                    <span className="material-symbols-outlined text-white text-xs opacity-50">person</span>
                </div>
            </button>
        </div>
      </nav>
    </div>
  );
};

const NavBtn = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-black scale-110' : 'text-black/60 hover:text-black'}`}>
        <span className={`material-symbols-outlined text-[26px] ${active ? 'font-black filled' : ''}`}>{icon}</span>
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </button>
);

export default App;
