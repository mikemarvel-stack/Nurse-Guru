import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  authApi, 
  documentsApi, 
  ordersApi, 
  cartApi, 
  paymentApi
} from '@/services/api';
import type { 
  User, 
  Document, 
  Order, 
  CartItem, 
  DocumentFilters
} from '@/types';

// Auth Store with API
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: 'buyer' | 'seller') => Promise<boolean>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email, password) => {
        try {
          const { data } = await authApi.login({ email, password });
          localStorage.setItem('token', data.token);
          set({ user: data.user, isAuthenticated: true });
          return true;
        } catch (error: any) {
          console.error('Login error:', error);
          return false;
        }
      },
      
      register: async (email, password, name, role) => {
        try {
          const { data } = await authApi.register({ 
            email, 
            password, 
            name, 
            role: role.toUpperCase() 
          });
          localStorage.setItem('token', data.token);
          set({ user: data.user, isAuthenticated: true });
          return true;
        } catch (error: any) {
          console.error('Register error:', error.response?.data || error.message);
          throw new Error(
            error.response?.data?.error || 
            error.message || 
            'Registration failed. Please try again.'
          );
        }
      },
      
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false });
      },
      
      fetchUser: async () => {
        try {
          const { data } = await authApi.getMe();
          set({ user: data.user, isAuthenticated: true });
        } catch {
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false });
        }
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);

// Document Store with API
interface DocumentState {
  documents: Document[];
  featuredDocuments: Document[];
  bestsellerDocuments: Document[];
  currentDocument: Document | null;
  filters: DocumentFilters;
  categories: any[];
  levels: any[];
  subjects: string[];
  isLoading: boolean;
  pagination: { page: number; limit: number; total: number; pages: number } | null;
  
  setFilters: (filters: Partial<DocumentFilters>) => void;
  fetchDocuments: (params?: Record<string, string>) => Promise<void>;
  fetchFeatured: () => Promise<void>;
  fetchBestsellers: () => Promise<void>;
  fetchDocumentById: (id: string) => Promise<Document | null>;
  fetchMetadata: () => Promise<void>;
  uploadDocument: (data: any) => Promise<Document | null>;
  filterDocuments: () => Document[];
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  featuredDocuments: [],
  bestsellerDocuments: [],
  currentDocument: null,
  filters: { sortBy: 'newest' },
  categories: [],
  levels: [],
  subjects: [],
  isLoading: false,
  pagination: null,
  
  setFilters: (newFilters) => {
    set((state: DocumentState) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },
  
  fetchDocuments: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await documentsApi.getAll(params);
      set({ 
        documents: data.documents, 
        pagination: data.pagination,
        isLoading: false 
      });
    } catch (error) {
      console.error('Fetch documents error:', error);
      set({ isLoading: false });
    }
  },
  
  fetchFeatured: async () => {
    try {
      const { data } = await documentsApi.getFeatured();
      set({ featuredDocuments: data.documents });
    } catch (error) {
      console.error('Fetch featured error:', error);
    }
  },
  
  fetchBestsellers: async () => {
    try {
      const { data } = await documentsApi.getBestsellers();
      set({ bestsellerDocuments: data.documents });
    } catch (error) {
      console.error('Fetch bestsellers error:', error);
    }
  },
  
  fetchDocumentById: async (id) => {
    try {
      const { data } = await documentsApi.getById(id);
      set({ currentDocument: data.document });
      return data.document;
    } catch (error) {
      console.error('Fetch document error:', error);
      return null;
    }
  },
  
  fetchMetadata: async () => {
    try {
      const [categoriesRes, levelsRes, subjectsRes] = await Promise.all([
        documentsApi.getCategories(),
        documentsApi.getLevels(),
        documentsApi.getSubjects()
      ]);
      set({
        categories: categoriesRes.data.categories,
        levels: levelsRes.data.levels,
        subjects: subjectsRes.data.subjects
      });
    } catch (error) {
      console.error('Fetch metadata error:', error);
    }
  },
  
  uploadDocument: async (documentData) => {
    try {
      const { data } = await documentsApi.create(documentData);
      return data.document;
    } catch (error) {
      console.error('Upload document error:', error);
      return null;
    }
  },
  
  filterDocuments: () => {
    const state = get();
    const { documents, filters } = state;
    return documents.filter(doc => {
      if (filters.search && !doc.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.category && doc.category !== filters.category) {
        return false;
      }
      if (filters.level && doc.level !== filters.level) {
        return false;
      }
      if (filters.subject && doc.subject !== filters.subject) {
        return false;
      }
      return true;
    });
  }
}));

// Cart Store with API
interface CartState {
  items: CartItem[];
  isLoading: boolean;
  total: number;
  
  fetchCart: () => Promise<void>;
  addToCart: (documentId: string) => Promise<boolean>;
  removeFromCart: (documentId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  checkInCart: (documentId: string) => Promise<boolean>;
  getCartCount: () => number;
  isInCart: (documentId: string) => boolean;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  total: 0,
  
  fetchCart: async () => {
    try {
      const { data } = await cartApi.get();
      set({ items: data.items, total: data.total });
    } catch (error) {
      console.error('Fetch cart error:', error);
    }
  },
  
  addToCart: async (documentId) => {
    try {
      await cartApi.add(documentId);
      await get().fetchCart();
      return true;
    } catch (error: any) {
      console.error('Add to cart error:', error);
      return false;
    }
  },
  
  removeFromCart: async (documentId) => {
    try {
      await cartApi.remove(documentId);
      await get().fetchCart();
    } catch (error) {
      console.error('Remove from cart error:', error);
    }
  },
  
  clearCart: async () => {
    try {
      await cartApi.clear();
      set({ items: [], total: 0 });
    } catch (error) {
      console.error('Clear cart error:', error);
    }
  },
  
  checkInCart: async (documentId) => {
    try {
      const { data } = await cartApi.check(documentId);
      return data.inCart;
    } catch {
      return false;
    }
  },
  
  getCartCount: () => {
    return get().items.length;
  },
  
  isInCart: (documentId) => {
    return get().items.some(item => item.document.id === documentId);
  },
  
  getCartTotal: () => {
    return get().items.reduce((total, item) => total + item.document.price, 0);
  }
}));

// Order Store with API
interface OrderState {
  orders: Order[];
  sellerOrders: Order[];
  isLoading: boolean;
  stats: any | null;
  
  fetchMyOrders: () => Promise<void>;
  fetchSellerOrders: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createOrder: (documentId: string, paymentIntentId: string) => Promise<Order | null>;
  completeOrder: (orderId: string) => Promise<Order | null>;
  downloadDocument: (orderId: string) => Promise<Blob | null>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  sellerOrders: [],
  isLoading: false,
  stats: null,
  
  fetchMyOrders: async () => {
    try {
      const { data } = await ordersApi.getMyOrders();
      set({ orders: data.orders });
    } catch (error) {
      console.error('Fetch orders error:', error);
    }
  },
  
  fetchSellerOrders: async () => {
    try {
      const { data } = await ordersApi.getSellerOrders();
      set({ sellerOrders: data.orders });
    } catch (error) {
      console.error('Fetch seller orders error:', error);
    }
  },
  
  fetchStats: async () => {
    try {
      const { data } = await ordersApi.getStats();
      set({ stats: data.stats });
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  },
  
  createOrder: async (documentId, paymentIntentId) => {
    try {
      const { data } = await ordersApi.create({ documentId, paymentIntentId });
      return data.order;
    } catch (error) {
      console.error('Create order error:', error);
      return null;
    }
  },
  
  completeOrder: async (orderId) => {
    try {
      const { data } = await ordersApi.getById(orderId);
      return data.order;
    } catch (error) {
      console.error('Complete order error:', error);
      return null;
    }
  },
  
  downloadDocument: async (orderId) => {
    try {
      const response = await ordersApi.download(orderId);
      return response.data;
    } catch (error) {
      console.error('Download error:', error);
      return null;
    }
  }
}));

// Payment Store
interface PaymentState {
  clientSecret: string | null;
  isLoading: boolean;
  
  createPaymentIntent: (items: string[]) => Promise<{ clientSecret: string; amount: number } | null>;
  confirmPayment: (paymentIntentId: string) => Promise<any>;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  clientSecret: null,
  isLoading: false,
  
  createPaymentIntent: async (items) => {
    try {
      const { data } = await paymentApi.createIntent(items);
      set({ clientSecret: data.clientSecret });
      return { clientSecret: data.clientSecret, amount: data.amount };
    } catch (error) {
      console.error('Create payment intent error:', error);
      return null;
    }
  },
  
  confirmPayment: async (paymentIntentId) => {
    try {
      const { data } = await paymentApi.confirm(paymentIntentId);
      return data;
    } catch (error) {
      console.error('Confirm payment error:', error);
      return null;
    }
  }
}));
