import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DataEntry, AccessRule, Notification, DataType } from '../../shared/types';

interface MyDataVaultState {
  // User state
  user: {
    address: string;
    name?: string;
    email?: string;
    avatar?: string;
  } | null;
  isAuthenticated: boolean;
  authToken: string | null;

  // Data state
  dataEntries: DataEntry[];
  accessRules: AccessRule[];
  selectedDataEntry: DataEntry | null;

  // UI state
  isLoading: boolean;
  notifications: Notification[];
  activeTab: 'dashboard' | 'data' | 'access' | 'settings';
  
  // Actions
  setUser: (user: any) => void;
  setAuthToken: (token: string | null) => void;
  logout: () => void;
  
  setDataEntries: (entries: DataEntry[]) => void;
  addDataEntry: (entry: DataEntry) => void;
  updateDataEntry: (id: string, updates: Partial<DataEntry>) => void;
  removeDataEntry: (id: string) => void;
  setSelectedDataEntry: (entry: DataEntry | null) => void;
  
  setAccessRules: (rules: AccessRule[]) => void;
  addAccessRule: (rule: AccessRule) => void;
  updateAccessRule: (id: string, updates: Partial<AccessRule>) => void;
  removeAccessRule: (id: string) => void;
  
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  
  setActiveTab: (tab: 'dashboard' | 'data' | 'access' | 'settings') => void;
}

export const useStore = create<MyDataVaultState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      authToken: null,
      
      dataEntries: [],
      accessRules: [],
      selectedDataEntry: null,
      
      isLoading: false,
      notifications: [],
      activeTab: 'dashboard',

      // User actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setAuthToken: (token) => set({ authToken: token }),
      
      logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userAddress');
        set({ 
          user: null, 
          isAuthenticated: false, 
          authToken: null,
          dataEntries: [],
          accessRules: [],
          selectedDataEntry: null
        });
      },

      // Data actions
      setDataEntries: (entries) => set({ dataEntries: entries }),
      
      addDataEntry: (entry) => set((state) => ({
        dataEntries: [...state.dataEntries, entry]
      })),
      
      updateDataEntry: (id, updates) => set((state) => ({
        dataEntries: state.dataEntries.map(entry =>
          entry.id === id ? { ...entry, ...updates } : entry
        )
      })),
      
      removeDataEntry: (id) => set((state) => ({
        dataEntries: state.dataEntries.filter(entry => entry.id !== id),
        accessRules: state.accessRules.filter(rule => rule.dataId !== id)
      })),
      
      setSelectedDataEntry: (entry) => set({ selectedDataEntry: entry }),

      // Access rule actions
      setAccessRules: (rules) => set({ accessRules: rules }),
      
      addAccessRule: (rule) => set((state) => ({
        accessRules: [...state.accessRules, rule]
      })),
      
      updateAccessRule: (id, updates) => set((state) => ({
        accessRules: state.accessRules.map(rule =>
          rule.id === id ? { ...rule, ...updates } : rule
        )
      })),
      
      removeAccessRule: (id) => set((state) => ({
        accessRules: state.accessRules.filter(rule => rule.id !== id)
      })),

      // UI actions
      setLoading: (loading) => set({ isLoading: loading }),
      
      addNotification: (notification) => set((state) => ({
        notifications: [{
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date(),
          read: false
        }, ...state.notifications]
      })),
      
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'mydatavault-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        authToken: state.authToken,
        dataEntries: state.dataEntries,
        accessRules: state.accessRules,
        activeTab: state.activeTab,
      }),
    }
  )
);