import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import type { UserCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

// Registrar novo usuário
export const registerUser = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Login de usuário
export const loginUser = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Logout de usuário
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error('Erro ao fazer logout');
  }
};

// Mensagens de erro em português
const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: { [key: string]: string } = {
    'auth/email-already-in-use': 'Este e-mail já está em uso',
    'auth/invalid-email': 'E-mail inválido',
    'auth/operation-not-allowed': 'Operação não permitida',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres',
    'auth/user-disabled': 'Este usuário foi desabilitado',
    'auth/user-not-found': 'Usuário não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/invalid-credential': 'E-mail ou senha incorretos',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde'
  };

  return errorMessages[errorCode] || 'Erro ao autenticar. Tente novamente';
};
