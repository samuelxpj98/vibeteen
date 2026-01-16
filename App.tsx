import React, { useState, useEffect } from 'react';
import { User, CauseAction, ActionType, PrayerRequest, PrayerCategory } from './types';
import { getDailyMission } from './services/geminiService';
import { Mural } from './components/Mural';
import { ActionForm } from './components/ActionForm';
import { Stats } from './components/Stats';
import { Profile } from './components/Profile';
import { MembersList } from './components/MembersList';
import { WelcomeScreen } from './components/WelcomeScreen';

// Firebase Imports
import { db } from './services/firebaseConfig';
import { 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    orderBy, 
    doc, 
    updateDoc, 
    setDoc,
    where,
    getDocs
} from 'firebase/firestore';

const App: React.FC = () => {
  // --- STATE ---
  // Nota: Não inicializamos mais com localStorage, pois os dados virão do Firebase
  const [user, setUser] = useState<User | null>(() => {
      // Mantemos apenas a sessão do usuário localmente para ele não precisar logar toda vez que der F5
      try {
          const savedUser = localStorage.getItem('vibeteen_user_session');
          return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
          return null;
      }
  });

  const [members, setMembers] = useState<User[]>([]);
  const [actions, setActions] = useState<CauseAction[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);

  const [currentView, setCurrentView] = useState<'mural' | 'rank' | 'members' | 'profile'>('mural');
  const [showAddForm, setShowAddForm] = useState(false);
  const [dailyMission, setDailyMission] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- FIREBASE REAL-TIME LISTENERS ---

  // 1. Ouvir Ações (Actions) em tempo real
  useEffect(() => {
    const q = query(collection(db, "actions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedActions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as CauseAction[];
        setActions(loadedActions);
    });
    return () => unsubscribe();
  }, []);

  // 2. Ouvir Pedidos de Oração (PrayerRequests) em tempo real
  useEffect(() => {
    const q = query(collection(db, "prayers"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedPrayers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as PrayerRequest[];
        setPrayerRequests(loadedPrayers);
    });
    return () => unsubscribe();
  }, []);

  // 3. Ouvir Membros (Users) em tempo real
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedMembers = snapshot.docs.map(doc => ({
            ...doc.data()
        })) as User[];
        setMembers(loadedMembers);
        
        // Se o usuário atual estiver logado, atualiza os dados dele também para garantir sincronia
        if (user) {
            const me = loadedMembers.find(m => m.uid === user.uid);
            if (me) {
                 setUser(me);
                 localStorage.setItem('vibeteen_user_session', JSON.stringify(me));
            }
        }
    });
    return () => unsubscribe();
  }, [user?.uid]); // Dependência apenas no UID para evitar loops, mas atualiza se o user mudar


  // --- SESSION PERSISTENCE ---
  useEffect(() => {
      if (user) localStorage.setItem('vibeteen_user_session', JSON.stringify(user));
      else localStorage.removeItem('vibeteen_user_session');
  }, [user]);

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

  const handleLogin = async (incomingUser: User) => {
      try {
        // Verificar se usuário já existe no Firebase pelo email (loginId)
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", incomingUser.email));
        const querySnapshot = await getDocs(q);

        let finalUser = incomingUser;

        if (!querySnapshot.empty) {
            // Usuário existe: Logar com dados do banco
            finalUser = querySnapshot.docs[0].data() as User;
            setToastMessage(`Bem-vindo de volta, ${finalUser.firstName}!`);
        } else {
            // Usuário novo: Criar no banco
            // Usamos o UID como ID do documento para facilitar updates futuros
            await setDoc(doc(db, "users", incomingUser.uid), incomingUser);
            setToastMessage("Conta criada com sucesso!");
        }

        setUser(finalUser);
      } catch (error) {
          console.error("Erro no login:", error);
          alert("Erro ao conectar ao servidor. Verifique sua internet.");
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

  const handleAddAction = async (type: ActionType, friendName: string) => {
    if (!user || user.role === 'visitor') return;

    // Remove ID manual, o Firebase cria automático, mas precisamos passar o objeto sem ID e depois pegar o ID gerado se necessário
    // Ou geramos um ID antes. Vamos deixar o Firebase gerar o ID do documento, mas salvaremos um ID dentro do objeto por compatibilidade
    
    const newActionBase = {
        userId: user.uid,
        userName: user.firstName, 
        userColor: user.avatarColor,
        userPhotoUrl: user.photoUrl || '',
        friendName,
        action: type,
        timestamp: new Date().toISOString(),
        prayedBy: []
    };

    try {
        await addDoc(collection(db, "actions"), newActionBase);
        setToastMessage("Ação Registrada e Sincronizada! 🚀");
        setShowAddForm(false);
        setCurrentView('mural');
    } catch (e) {
        console.error("Erro ao salvar ação", e);
        setToastMessage("Erro ao salvar. Tente novamente.");
    }
  };

  const handleToggleActionSupport = async (actionId: string) => {
      if (!user) return;
      
      const actionToUpdate = actions.find(a => a.id === actionId);
      if (!actionToUpdate) return;

      const hasPrayed = actionToUpdate.prayedBy.includes(user.uid);
      const newPrayedBy = hasPrayed
          ? actionToUpdate.prayedBy.filter(uid => uid !== user.uid)
          : [...actionToUpdate.prayedBy, user.uid];

      if (!hasPrayed && navigator.vibrate) navigator.vibrate(50);

      try {
          const actionRef = doc(db, "actions", actionId);
          await updateDoc(actionRef, { prayedBy: newPrayedBy });
      } catch (e) {
          console.error("Erro ao curtir ação", e);
      }
  };

  const handleUpdateUser = async (updatedUser: User) => {
      try {
          // 1. Atualizar documento do usuário
          const userRef = doc(db, "users", updatedUser.uid);
          await updateDoc(userRef, {
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              avatarColor: updatedUser.avatarColor,
              photoUrl: updatedUser.photoUrl || ''
          });

          // Opcional: Atualizar dados históricos. 
          // No NoSQL (Firebase), é comum desnormalizar dados.
          // Para um app pequeno, podemos fazer queries e atualizar tudo (Batch Update).
          // Para simplificar aqui, vamos confiar que o app exibe a foto nova baseada no ID do usuário se fizermos join no front,
          // MAS como o app atual salva nome/foto na Ação, seria ideal atualizar.
          // ATENÇÃO: Em produção com muitos dados, isso deve ser feito via Cloud Function. Aqui faremos no front com cuidado.
          
          // NÃO vamos atualizar todas as ações históricas agora para evitar muitas leituras/escritas no plano free do Firebase
          // O usuário verá os dados novos no perfil, mas ações antigas podem manter o nome antigo por enquanto (snapshot histórico).
          
          setUser(updatedUser);
          setToastMessage("Perfil Salvo na Nuvem! ✅");

      } catch (e) {
          console.error("Erro ao atualizar perfil", e);
          setToastMessage("Erro ao salvar perfil.");
      }
  };

  const handleClearData = () => {
      // Como agora é na nuvem, "limpar dados" é perigoso. Vamos apenas limpar o cache local/logout.
      if (window.confirm("Isso desconectará sua conta deste dispositivo.")) {
          handleLogout();
      }
  };

  const handleAddPrayerRequest = async (category: PrayerCategory, description: string) => {
      if (!user) return;
      
      const newRequestBase = {
          userId: user.uid,
          userName: user.firstName,
          userAvatarColor: user.avatarColor,
          userPhotoUrl: user.photoUrl || '',
          category,
          description,
          prayedBy: [],
          timestamp: new Date().toISOString()
      };

      try {
          await addDoc(collection(db, "prayers"), newRequestBase);
          setToastMessage("Pedido de Oração Enviado para a Rede 🙏");
      } catch (e) {
          console.error("Erro ao enviar oração", e);
          setToastMessage("Erro ao enviar.");
      }
  };

  const handleTogglePray = async (requestId: string) => {
      if (!user) return;

      const reqToUpdate = prayerRequests.find(r => r.id === requestId);
      if (!reqToUpdate) return;

      const hasPrayed = reqToUpdate.prayedBy.includes(user.uid);
      const newPrayedBy = hasPrayed 
          ? reqToUpdate.prayedBy.filter(uid => uid !== user.uid)
          : [...reqToUpdate.prayedBy, user.uid];

      try {
          const reqRef = doc(db, "prayers", requestId);
          await updateDoc(reqRef, { prayedBy: newPrayedBy });
      } catch (e) {
          console.error("Erro ao orar", e);
      }
  };

  // If not logged in, show Welcome Screen
  if (!user) {
      return <WelcomeScreen onLogin={handleLogin} />;
  }

  return (
    <div className="bg-background min-h-screen text-gray-900 font-sans overflow-hidden relative">
      
      {/* Toast Notification */}
      {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-top-4 duration-300 fade-in pointer-events-none">
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
                currentUser={user}
                onToggleSupport={handleToggleActionSupport}
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