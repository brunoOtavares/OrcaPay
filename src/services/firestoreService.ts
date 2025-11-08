import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserProfile {
  email: string;
  createdAt: string;
  hourlyRate: number;
  subscription?: {
    plan: 'free' | 'pro' | 'agency';
    status: 'active' | 'inactive' | 'canceled';
    startDate?: string;
    endDate?: string;
    mercadoPagoSubscriptionId?: string;
  };
  calculatorData?: {
    fixedCosts: Array<{ description: string; value: number }>;
    variableCosts: Array<{ description: string; value: number }>;
    salary1?: number;
    salary2?: number;
    desiredSalary: number;
    hoursPerDay: number;
    daysPerMonth: number;
  };
  settings: {
    complexityMultipliers: {
      baixa: number;
      media: number;
      alta: number;
    };
    commercialUseMultipliers: {
      local: number;
      regional: number;
      nacional: number;
    };
    urgencyMultiplier: number;
    priceRangePercentage: number;
  };
  quotes: SavedQuote[];
}

export interface SavedQuote {
  id: string;
  clientName: string;
  projectType: string;
  description: string;
  deliveryDate: string;
  totalHours: number;
  finalPrice: number;
  complexity: string;
  urgency: boolean;
  commercialUse: string;
  revisions: number;
  createdAt: string;
  completed?: boolean;
  completedAt?: string;
}

// Criar perfil de usuário no Firestore
export const createUserProfile = async (userId: string, email: string): Promise<void> => {
  try {
    const userProfile: UserProfile = {
      email,
      createdAt: new Date().toISOString(),
      hourlyRate: 50,
      subscription: {
        plan: 'free',
        status: 'inactive',
        startDate: new Date().toISOString()
      },
      calculatorData: {
        fixedCosts: [],
        variableCosts: [],
        salary1: 0,
        salary2: 0,
        desiredSalary: 0,
        hoursPerDay: 8,
        daysPerMonth: 20
      },
      settings: {
        complexityMultipliers: {
          baixa: 1.5,
          media: 2.0,
          alta: 2.5
        },
        commercialUseMultipliers: {
          local: 1.0,
          regional: 1.3,
          nacional: 1.8
        },
        urgencyMultiplier: 1.5,
        priceRangePercentage: 20
      },
      quotes: []
    };

    await setDoc(doc(db, 'users', userId), userProfile);
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    throw new Error('Erro ao criar perfil do usuário');
  }
};

// Buscar perfil de usuário
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    throw new Error('Erro ao buscar perfil do usuário');
  }
};

// Atualizar valor/hora
export const updateHourlyRate = async (userId: string, hourlyRate: number): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { hourlyRate });
  } catch (error) {
    console.error('Erro ao atualizar valor/hora:', error);
    throw new Error('Erro ao atualizar valor/hora');
  }
};

// Atualizar dados da calculadora
export const updateCalculatorData = async (userId: string, calculatorData: UserProfile['calculatorData']): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { calculatorData });
  } catch (error) {
    console.error('Erro ao atualizar dados da calculadora:', error);
    throw new Error('Erro ao atualizar dados da calculadora');
  }
};

// Atualizar configurações
export const updateSettings = async (userId: string, settings: UserProfile['settings']): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { settings });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    throw new Error('Erro ao atualizar configurações');
  }
};

// Salvar orçamento
export const saveQuote = async (userId: string, quote: SavedQuote): Promise<void> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) throw new Error('Perfil não encontrado');

    const updatedQuotes = [...profile.quotes, quote];
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { quotes: updatedQuotes });
  } catch (error) {
    console.error('Erro ao salvar orçamento:', error);
    throw new Error('Erro ao salvar orçamento');
  }
};

// Atualizar orçamento
export const updateQuote = async (userId: string, quoteId: string, updatedQuote: Partial<SavedQuote>): Promise<void> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) throw new Error('Perfil não encontrado');

    const quoteIndex = profile.quotes.findIndex(q => q.id === quoteId);
    if (quoteIndex === -1) throw new Error('Orçamento não encontrado');

    profile.quotes[quoteIndex] = { ...profile.quotes[quoteIndex], ...updatedQuote };
    
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { quotes: profile.quotes });
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    throw new Error('Erro ao atualizar orçamento');
  }
};

// Deletar orçamento
export const deleteQuote = async (userId: string, quoteId: string): Promise<void> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) throw new Error('Perfil não encontrado');

    const updatedQuotes = profile.quotes.filter(q => q.id !== quoteId);
    
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { quotes: updatedQuotes });
  } catch (error) {
    console.error('Erro ao deletar orçamento:', error);
    throw new Error('Erro ao deletar orçamento');
  }
};

// Marcar projeto como concluído
export const completeProject = async (userId: string, quoteId: string): Promise<void> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) throw new Error('Perfil não encontrado');

    const quoteIndex = profile.quotes.findIndex(q => q.id === quoteId);
    if (quoteIndex === -1) throw new Error('Orçamento não encontrado');

    profile.quotes[quoteIndex].completed = true;
    profile.quotes[quoteIndex].completedAt = new Date().toISOString();
    
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { quotes: profile.quotes });
  } catch (error) {
    console.error('Erro ao concluir projeto:', error);
    throw new Error('Erro ao concluir projeto');
  }
};

// Atualizar assinatura
export const updateSubscription = async (
  userId: string, 
  subscription: UserProfile['subscription']
): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { subscription });
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
    throw new Error('Erro ao atualizar assinatura');
  }
};
