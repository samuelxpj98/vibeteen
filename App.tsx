import React, { useState, useEffect } from 'react';
import { User, CauseAction, ActionType, PrayerRequest, PrayerCategory } from './types';
import { getDailyMission } from './services/geminiService';
import { Mural } from './components/Mural';
import { ActionForm } from './components/ActionForm';
import { Stats } from './components/Stats';
import { Profile } from './components/Profile';
import { MembersList } from './components/MembersList';
import { WelcomeScreen } from './components/WelcomeScreen';

const App: React.FC = () => {
  // --- STATE INITIALIZATION (PERSISTENCE) ---
  
  const [user, setUser] = useState<User | null>(() => {
      try {
          const savedUser = localStorage.getItem('vibeteen_user');
          return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
          console.error("Error loading user", e);
          return null;
      }
  });

  const [members, setMembers] = useState<User[]>(() => {
      try {
          const savedMembers = localStorage.getItem('vibeteen_members');
          return savedMembers ? JSON.parse(savedMembers) : [];
      } catch (e) {
          return [];
      }
  });

  const [actions, setActions] = useState<CauseAction[]>(() => {
      try {
          const saved = localStorage.getItem('vibeteen_actions');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          console.error("Error loading actions", e);
          return [];
      }
  });

  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(() => {
      try {
          const saved = localStorage.getItem('vibeteen_prayers');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          return [];
      }
  });

  const [currentView, setCurrentView] = useState<'mural' | 'rank' | 'members' | 'profile'>('mural');
  const [showAddForm, setShowAddForm] = useState(false);
  const [dailyMission, setDailyMission] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- PERSISTENCE EFFECTS ---

  useEffect(() => {
      if (user) localStorage.setItem('vibeteen_user', JSON.stringify(user));
      else localStorage.removeItem('vibeteen_user');
  }, [user]);

  useEffect(() => {
      localStorage.setItem('vibeteen_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
      localStorage.setItem('vibeteen_actions', JSON.stringify(actions));
  }, [actions]);

  useEffect(() => {
      localStorage.setItem('vibeteen_prayers', JSON.stringify(prayerRequests));
  }, [prayerRequests]);

  // Toast Timer
  useEffect(() => {
      if (toastMessage) {
          const timer = setTimeout(() => setToastMessage(null), 3000);
          return () => clearTimeout(timer);
      }
  }, [toastMessage]);

  // --- API ---

  useEffect(() => {
    const fetchMission = async () => {
        const mission = await getDailyMission();
        setDailyMission(mission);
    };
    fetchMission();
  }, []); 

  // --- HANDLERS ---

  const handleLogin = (incomingUser: User) => {
      // Try to recover existing profile by email to keep stats/photo consistent
      const existingMember = members.find(m => m.email.toLowerCase() === incomingUser.email.toLowerCase());
      
      let finalUser = incomingUser;

      if (existingMember) {
          finalUser = { ...existingMember };
      }

      setUser(finalUser);

      // Add to members list if it's a new valid member
      if (!existingMember && finalUser.role === 'member') {
          setMembers(prev => [finalUser, ...prev]);
      }
  };

  const handleLogout = () => {
      setUser(null);
      setCurrentView('mural');
  };

  const onAddButtonClick = () => {
      if (!user) return;
      if (user.role === 'visitor') {
          alert("🔒 Modo Visitante\n\nCrie uma conta para registrar suas ações!");
          return;
      }
      setShowAddForm(true);
  };

  const handleAddAction = (type: ActionType, friendName: string) => {
    if (!user || user.role === 'visitor') return;

    const newAction: CauseAction = {
        id: Date.now().toString(),
        userId: user.uid,
        userName: user.firstName, 
        userColor: user.avatarColor,
        friendName,
        action: type,
        timestamp: new Date().toISOString()
    };

    setActions(prev => {
        const updated = [newAction, ...prev];
        return updated;
    });
    
    setToastMessage("Ação Registrada com Sucesso! 🚀");
    setShowAddForm(false);
    setCurrentView('mural');
  };

  const handleUpdateUser = (updatedUser: User) => {
      setUser(updatedUser);
      // Sync update with members list
      setMembers(prev => prev.map(m => m.uid === updatedUser.uid ? updatedUser : m));
      setToastMessage("Perfil Atualizado! ✅");
  };

  const handleClearData = () => {
      if (window.confirm("Tem certeza? Isso apagará todas as ações locais.")) {
          setActions([]);
          setPrayerRequests([]);
          localStorage.removeItem('vibeteen_actions');
          localStorage.removeItem('vibeteen_prayers');
          setToastMessage("Dados Limpos 🗑️");
      }
  };

  const handleAddPrayerRequest = (category: PrayerCategory, description: string) => {
      if (!user) return;
      const newRequest: PrayerRequest = {
          id: Date.now().toString(),
          userId: user.uid,
          userName: user.firstName,
          userAvatarColor: user.avatarColor,
          category,
          description,
          prayedBy: [],
          timestamp: new Date().toISOString()
      };
      setPrayerRequests(prev => [newRequest, ...prev]);
      setToastMessage("Pedido de Oração Enviado 🙏");
  };

  const handleTogglePray = (requestId: string) => {
      if (!user) return;
      setPrayerRequests(prev => prev.map(req => {
          if (req.id === requestId) {
              const hasPrayed = req.prayedBy.includes(user.uid);
              const newPrayedBy = hasPrayed 
                  ? req.prayedBy.filter(uid => uid !== user.uid)
                  : [...req.prayedBy, user.uid];
              return { ...req, prayedBy: newPrayedBy };
          }
          return req;
      }));
  };

  // If not logged in, show Welcome Screen
  if (!user) {
      return <WelcomeScreen onLogin={handleLogin} />;
  }

  return (
    <div className="bg-background min-h-screen text-gray-900 font-sans overflow-hidden relative">
      
      {/* Toast Notification */}
      {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-top-4 duration-300 fade-in">
              <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-gray-700">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
              </div>
          </div>
      )}

      {/* View Router */}
      <main className="w-full h-screen relative">
        {currentView === 'mural' && (
            <Mural 
                actions={actions} 
                onAddClick={onAddButtonClick}
                mission={dailyMission}
                isVisitor={user.role === 'visitor'}
            />
        )}
        {currentView === 'rank' && <Stats actions={actions} />}
        {currentView === 'members' && (
            <MembersList 
                members={members} 
                currentUser={user}
                prayerRequests={prayerRequests}
                onAddPrayer={handleAddPrayerRequest}
                onPray={handleTogglePray}
            />
        )}
        {currentView === 'profile' && (
            <Profile 
                user={user} 
                actions={actions} 
                onUpdateUser={handleUpdateUser} 
                onLogout={handleLogout}
                onClearData={handleClearData}
            />
        )}
      </main>

      {/* Action Form Modal */}
      {showAddForm && (
        <ActionForm 
            user={user} 
            onClose={() => setShowAddForm(false)} 
            onSubmit={handleAddAction} 
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-40 px-4 pb-6 pt-2 pointer-events-none">
        <div className="h-[72px] w-full max-w-lg mx-auto bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl shadow-gray-200/50 flex items-center justify-between px-4 relative pointer-events-auto">
            {/* Active Indicator Background */}
            <div 
                className={`absolute top-1/2 -translate-y-1/2 w-14 h-12 bg-primary/20 rounded-xl -z-10 transition-all duration-300`}
                style={{
                    left: currentView === 'mural' ? '1rem' : 
                          currentView === 'rank' ? 'calc(25% + 0.5rem)' : 
                          currentView === 'members' ? 'calc(50% + 0.5rem)' : 
                          'calc(75% + 0.5rem)'
                }}
            />
            
            <button 
                onClick={() => setCurrentView('mural')}
                className={`flex flex-col items-center justify-center gap-1 w-14 h-full transition-colors ${currentView === 'mural' ? 'text-black' : 'text-gray-400'}`}
            >
                <span className={`material-symbols-outlined text-[24px] ${currentView === 'mural' ? 'font-bold fill-current' : ''}`}>grid_view</span>
                <span className="text-[9px] font-medium">Mural</span>
            </button>

            <button 
                onClick={() => setCurrentView('rank')}
                className={`flex flex-col items-center justify-center gap-1 w-14 h-full transition-colors ${currentView === 'rank' ? 'text-black' : 'text-gray-400'}`}
            >
                <span className={`material-symbols-outlined text-[24px] ${currentView === 'rank' ? 'font-bold fill-current' : ''}`}>leaderboard</span>
                <span className="text-[9px] font-medium">Rank</span>
            </button>

            <button 
                onClick={() => setCurrentView('members')}
                className={`flex flex-col items-center justify-center gap-1 w-14 h-full transition-colors ${currentView === 'members' ? 'text-black' : 'text-gray-400'}`}
            >
                <span className={`material-symbols-outlined text-[24px] ${currentView === 'members' ? 'font-bold fill-current' : ''}`}>groups</span>
                <span className="text-[9px] font-medium">Rede</span>
            </button>

            <button 
                onClick={() => setCurrentView('profile')}
                className={`flex flex-col items-center justify-center gap-1 w-14 h-full transition-colors ${currentView === 'profile' ? 'text-black' : 'text-gray-400'}`}
            >
                <div className={`w-6 h-6 rounded-full overflow-hidden border-2 ${currentView === 'profile' ? 'border-black' : 'border-transparent'}`}>
                    <img src={user.photoUrl || `https://picsum.photos/200/200?random=${user.uid}`} alt="Me" className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] font-medium">Perfil</span>
            </button>
        </div>
      </nav>
      
      {/* Vignette Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.05)_100%)] z-10" />
    </div>
  );
};

export default App;