import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface CallState {
  isActive: boolean;
  phoneNumber: string;
  duration: number; // em segundos
  isPaused: boolean;
}

interface WebPhoneState {
  isLoggedIn: boolean;
  hasMicrophonePermission: boolean | null; // null = não verificado ainda
}

interface CallContextType {
  callState: CallState;
  webPhoneState: WebPhoneState;
  startCall: (phoneNumber: string) => void;
  endCall: () => void;
  pauseCall: () => void;
  resumeCall: () => void;
  loginWebPhone: () => void;
  logoutWebPhone: () => void;
  checkMicrophonePermission: () => Promise<boolean>;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: ReactNode }) {
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    phoneNumber: '',
    duration: 0,
    isPaused: false,
  });

  const [webPhoneState, setWebPhoneState] = useState<WebPhoneState>({
    isLoggedIn: false,
    hasMicrophonePermission: null,
  });

  // Verificar permissão de microfone ao carregar
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      const hasPermission = result.state === 'granted';
      setWebPhoneState((prev) => ({ ...prev, hasMicrophonePermission: hasPermission }));
      
      // Listener para mudanças de permissão
      result.addEventListener('change', () => {
        setWebPhoneState((prev) => ({ ...prev, hasMicrophonePermission: result.state === 'granted' }));
      });
      
      return hasPermission;
    } catch (error) {
      // Fallback: tentar acessar o microfone diretamente
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setWebPhoneState((prev) => ({ ...prev, hasMicrophonePermission: true }));
        return true;
      } catch (err) {
        setWebPhoneState((prev) => ({ ...prev, hasMicrophonePermission: false }));
        return false;
      }
    }
  };

  const loginWebPhone = () => {
    // Aqui você pode adicionar lógica de autenticação real
    setWebPhoneState((prev) => ({ ...prev, isLoggedIn: true }));
  };

  const logoutWebPhone = () => {
    // Deslogar e encerrar chamada se ativa
    if (callState.isActive) {
      endCall();
    }
    setWebPhoneState((prev) => ({ ...prev, isLoggedIn: false }));
  };

  const startCall = (phoneNumber: string) => {
    setCallState({
      isActive: true,
      phoneNumber,
      duration: 0,
      isPaused: false,
    });
  };

  const endCall = () => {
    setCallState({
      isActive: false,
      phoneNumber: '',
      duration: 0,
      isPaused: false,
    });
  };

  const pauseCall = () => {
    setCallState((prev) => ({ ...prev, isPaused: true }));
  };

  const resumeCall = () => {
    setCallState((prev) => ({ ...prev, isPaused: false }));
  };

  return (
    <CallContext.Provider value={{ 
      callState, 
      webPhoneState,
      startCall, 
      endCall, 
      pauseCall, 
      resumeCall,
      loginWebPhone,
      logoutWebPhone,
      checkMicrophonePermission
    }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within CallProvider');
  }
  return context;
}