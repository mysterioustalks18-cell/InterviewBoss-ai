import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  serverTimestamp,
  logout as firebaseLogout
} from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      
      if (fUser) {
        // Subscribe to user document in Firestore
        const userRef = doc(db, 'users', fUser.uid);
        
        const unsubscribeDoc = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            setUser({
              ...docSnap.data() as User,
              isVerified: fUser.emailVerified
            });
          } else {
            // Create user document if it doesn't exist
            const newUser: User = {
              uid: fUser.uid,
              email: fUser.email || '',
              displayName: fUser.displayName || '',
              photoURL: fUser.photoURL || '',
              plan: 'FREE',
              isVerified: fUser.emailVerified,
              usage: {
                resumes: 0,
                interviews: 0,
                codeAudits: 0,
                lastReset: new Date().toISOString()
              },
              createdAt: new Date().toISOString()
            };
            await setDoc(userRef, {
              ...newUser,
              createdAt: serverTimestamp()
            });
            setUser(newUser);
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Firestore error in AuthContext:", error);
          setIsLoading(false);
        });

        return () => unsubscribeDoc();
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (!firebaseUser) return;
    const userRef = doc(db, 'users', firebaseUser.uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      setUser(docSnap.data() as User);
    }
  };

  const logout = async () => {
    await firebaseLogout();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      isLoading, 
      isAuthenticated: !!firebaseUser,
      refreshUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
