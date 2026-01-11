import React, { useState } from 'react';
import { User } from '../types';

interface WelcomeScreenProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'register';

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Info/User, Step 2: PIN
  
  // Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loginId, setLoginId] = useState(''); // Replaces Email
  const [pin, setPin] = useState('');
  const [church, setChurch] = useState<'Vibe Teen' | 'Outra Igreja'>('Vibe Teen');

  const handleNextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mode === 'login' && loginId.trim()) {
        setStep(2);
    } else if (mode === 'register' && firstName && lastName && loginId) {
        setStep(2);
    }
  };

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
        const newPin = pin + num;
        setPin(newPin);
        
        // Auto submit on 4th digit
        if (newPin.length === 4) {
           setTimeout(() => {
               submitAuth(newPin);
           }, 300);
        }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const submitAuth = (finalPin: string) => {
    // Mock Authentication Logic
    const mockUser: User = {
      uid: mode === 'login' ? 'mock-user-login-id' : Date.now().toString(),
      firstName: mode === 'login' ? 'Usuário' : firstName,
      lastName: mode === 'login' ? 'Teste' : lastName,
      email: loginId, // Storing login ID in email field for compatibility
      church: mode === 'login' ? 'Vibe Teen' : church,
      avatarColor: 'bg-primary',
      role: 'member',
      createdAt: new Date().toISOString()
    };

    console.log(`Authenticating [${mode}] User: ${loginId} with PIN: ${finalPin}`);
    onLogin(mockUser);
  };

  const handleVisitorAccess = () => {
      const guestUser: User = {
          uid: 'guest-user',
          firstName: 'Visitante',
          lastName: '',
          email: '',
          avatarColor: 'bg-gray-400',
          role: 'visitor',
          createdAt: new Date().toISOString()
      };
      onLogin(guestUser);
  };

  const resetFlow = (newMode: AuthMode) => {
      setMode(newMode);
      setStep(1);
      setPin('');
      // Optional: clear other fields or keep them
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-white text-gray-900 font-sans selection:bg-primary selection:text-black">
      
      {/* Colorful Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/40 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-action-blue/30 rounded-full blur-[100px] mix-blend-multiply opacity-70" />
      <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-purple-300/40 rounded-full blur-[80px] mix-blend-multiply opacity-60" />

      {/* Glass Container */}
      <div className="relative z-10 w-full max-w-sm bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-xl rotate-3">
                <span className="material-symbols-outlined text-3xl text-black font-bold">all_inclusive</span>
            </div>
            <div className="absolute -inset-2 bg-gradient-to-tr from-primary to-action-orange -z-10 blur-xl opacity-40 rounded-full"></div>
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-gray-900 leading-none">
            VIBE TEEN<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-dark to-orange-500">ACCESS</span>
          </h1>
        </div>

        {/* Tabs - Only show in Step 1 */}
        {step === 1 && (
            <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                <button 
                    onClick={() => resetFlow('login')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'login' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Entrar
                </button>
                <button 
                    onClick={() => resetFlow('register')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'register' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Cadastrar
                </button>
            </div>
        )}

        {/* STEP 1: Data Collection */}
        {step === 1 ? (
            <form onSubmit={handleNextStep} className="flex flex-col gap-3 animate-in slide-in-from-right duration-300">
                
                {mode === 'register' && (
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <input 
                                required
                                type="text" 
                                placeholder="Nome"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full bg-white border border-gray-200 focus:border-primary/50 rounded-xl h-12 px-4 text-sm font-bold placeholder-gray-400 outline-none transition-all"
                            />
                            <input 
                                required
                                type="text" 
                                placeholder="Sobrenome"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full bg-white border border-gray-200 focus:border-primary/50 rounded-xl h-12 px-4 text-sm font-bold placeholder-gray-400 outline-none transition-all"
                            />
                        </div>
                        
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Sua Igreja</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setChurch('Vibe Teen')}
                                    className={`flex-1 h-10 rounded-xl border text-xs font-bold uppercase transition-all ${church === 'Vibe Teen' ? 'bg-black text-primary border-black' : 'bg-white border-gray-200 text-gray-500'}`}
                                >
                                    Vibe Teen
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setChurch('Outra Igreja')}
                                    className={`flex-1 h-10 rounded-xl border text-xs font-bold uppercase transition-all ${church === 'Outra Igreja' ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-500'}`}
                                >
                                    Outra
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 block">
                        {mode === 'login' ? 'Login de acesso' : 'Crie seu usuário'}
                    </label>
                    <input 
                        required
                        type="text" 
                        placeholder="Ex: joao.silva"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-primary/50 rounded-xl h-12 px-4 text-sm font-bold placeholder-gray-400 outline-none transition-all"
                    />
                </div>

                <button 
                    type="submit"
                    className="mt-4 w-full h-14 bg-gray-900 hover:bg-black text-white font-black italic text-lg uppercase tracking-tight rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-gray-200"
                >
                    <span>Continuar</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
            </form>
        ) : (
            /* STEP 2: PIN Pad */
            <div className="w-full flex flex-col items-center animate-in slide-in-from-right duration-300">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                    {mode === 'login' ? 'Digite sua senha' : 'Crie sua senha'} (4 dígitos)
                </p>

                {/* PIN Display */}
                <div className="flex gap-3 mb-8 bg-white/50 p-4 rounded-2xl border border-white">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            i < pin.length 
                            ? 'bg-gray-900 scale-125' 
                            : 'bg-gray-300'
                        }`} />
                    ))}
                </div>

                {/* Numeric Keypad */}
                <div className="grid grid-cols-3 gap-3 w-full">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handlePinInput(num.toString())}
                            className="w-full aspect-square rounded-2xl bg-white border border-gray-100 shadow-[0_4px_0_0_rgba(0,0,0,0.02)] text-2xl font-bold text-gray-900 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md transition-all active:translate-y-0 active:shadow-none flex items-center justify-center"
                        >
                            {num}
                        </button>
                    ))}
                    <button onClick={() => setStep(1)} className="aspect-square flex items-center justify-center text-gray-400 hover:text-gray-900 font-bold text-[10px] uppercase tracking-wider">
                        Voltar
                    </button>
                    <button
                        onClick={() => handlePinInput('0')}
                        className="aspect-square rounded-2xl bg-white border border-gray-100 shadow-[0_4px_0_0_rgba(0,0,0,0.02)] text-2xl font-bold text-gray-900 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-md transition-all active:translate-y-0 active:shadow-none flex items-center justify-center"
                    >
                        0
                    </button>
                    <button
                        onClick={handleBackspace}
                        className="aspect-square rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all active:scale-95 flex items-center justify-center border border-red-100"
                    >
                        <span className="material-symbols-outlined">backspace</span>
                    </button>
                </div>
            </div>
        )}

        {/* Footer (Only in Step 1) */}
        {step === 1 && (
            <div className="mt-6 pt-6 border-t border-gray-200/50 flex flex-col items-center gap-4">
                <button 
                    onClick={handleVisitorAccess}
                    className="text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-black transition-colors flex items-center gap-1"
                >
                    Entrar como Visitante
                    <span className="material-symbols-outlined text-sm">visibility</span>
                </button>
            </div>
        )}

      </div>
      
      <p className="absolute bottom-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60">
        Cyber Gospel v2.2
      </p>
    </div>
  );
};