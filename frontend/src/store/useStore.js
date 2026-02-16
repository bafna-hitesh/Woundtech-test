// Zustand Store - Global state management
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '../api/client';
import dayjs from 'dayjs';

const useStore = create(
  persist(
    (set, get) => ({
      // ============ AUTH STATE ============
      user: null,
      isLoggedIn: false,

      // ============ DATA STATE ============
      clinicians: [],
      patients: [],
      visits: [],
      
      // Loading states
      loading: {
        clinicians: false,
        patients: false,
        visits: false,
      },
      
      // Error states
      errors: {
        clinicians: null,
        patients: null,
        visits: null,
      },

      // ============ FILTER STATE ============
      filters: {
        clinician_id: null,
        patient_id: null,
        status: null,
      },
      
      // Current month for calendar view
      currentMonth: dayjs(),

      // ============ UI STATE ============
      modals: {
        visitForm: false,
        clinicianForm: false,
        patientForm: false,
        checkIn: false,
      },
      
      // Selected visit for editing
      selectedVisit: null,
      
      // Selected date for new visit
      selectedDate: null,

      // ============ CHECK-IN QUEUE STATE ============
      checkInQueue: [],           // Today's scheduled visits (sorted by time)
      currentCheckInIndex: 0,     // Current position in queue
      checkInActive: false,       // Is check-in mode active?

      // ============ AUTH ACTIONS ============
      
      login: (username) => {
        set({
          user: { username, role: 'admin' },
          isLoggedIn: true,
        });
      },

      logout: () => {
        set({
          user: null,
          isLoggedIn: false,
          checkInActive: false,
          checkInQueue: [],
          currentCheckInIndex: 0,
        });
      },

      // ============ DATA ACTIONS ============
      
      // Fetch clinicians from API
      fetchClinicians: async () => {
        set((state) => ({ 
          loading: { ...state.loading, clinicians: true },
          errors: { ...state.errors, clinicians: null },
        }));
        
        try {
          const clinicians = await api.getClinicians();
          set((state) => ({ 
            clinicians,
            loading: { ...state.loading, clinicians: false },
          }));
        } catch (error) {
          set((state) => ({ 
            loading: { ...state.loading, clinicians: false },
            errors: { ...state.errors, clinicians: error.message },
          }));
        }
      },

      // Fetch patients from API
      fetchPatients: async () => {
        set((state) => ({ 
          loading: { ...state.loading, patients: true },
          errors: { ...state.errors, patients: null },
        }));
        
        try {
          const patients = await api.getPatients();
          set((state) => ({ 
            patients,
            loading: { ...state.loading, patients: false },
          }));
        } catch (error) {
          set((state) => ({ 
            loading: { ...state.loading, patients: false },
            errors: { ...state.errors, patients: error.message },
          }));
        }
      },

      // Fetch visits from API (with current filters and month)
      fetchVisits: async () => {
        const { currentMonth, filters } = get();
        
        set((state) => ({ 
          loading: { ...state.loading, visits: true },
          errors: { ...state.errors, visits: null },
        }));
        
        try {
          // Get visits for the current month view
          const start_date = currentMonth.startOf('month').format('YYYY-MM-DD');
          const end_date = currentMonth.endOf('month').format('YYYY-MM-DD');
          
          const visits = await api.getVisits({
            start_date,
            end_date,
            ...filters,
          });
          
          set((state) => ({ 
            visits,
            loading: { ...state.loading, visits: false },
          }));
        } catch (error) {
          set((state) => ({ 
            loading: { ...state.loading, visits: false },
            errors: { ...state.errors, visits: error.message },
          }));
        }
      },

      // Create new visit
      createVisit: async (data) => {
        try {
          await api.createVisit(data);
          // Refresh visits after creating
          get().fetchVisits();
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // Update visit
      updateVisit: async (id, data) => {
        try {
          await api.updateVisit(id, data);
          get().fetchVisits();
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // Delete visit
      deleteVisit: async (id) => {
        try {
          await api.deleteVisit(id);
          get().fetchVisits();
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // Create clinician
      createClinician: async (data) => {
        try {
          await api.createClinician(data);
          get().fetchClinicians();
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // Create patient
      createPatient: async (data) => {
        try {
          await api.createPatient(data);
          get().fetchPatients();
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // ============ CHECK-IN ACTIONS ============

      // Start check-in process for today's scheduled visits
      startCheckIn: async () => {
        const today = dayjs().format('YYYY-MM-DD');
        
        try {
          // Fetch today's scheduled visits
          const todayVisits = await api.getVisits({
            start_date: today,
            end_date: today,
            status: 'scheduled',
          });

          // Sort by time (earliest first)
          const sortedVisits = todayVisits.sort((a, b) => {
            return dayjs(a.visit_date).valueOf() - dayjs(b.visit_date).valueOf();
          });

          if (sortedVisits.length === 0) {
            return { success: false, error: 'No scheduled visits for today' };
          }

          set({
            checkInQueue: sortedVisits,
            currentCheckInIndex: 0,
            checkInActive: true,
            modals: { ...get().modals, checkIn: true },
          });

          return { success: true, count: sortedVisits.length };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // Get current visit in check-in queue
      getCurrentCheckInVisit: () => {
        const { checkInQueue, currentCheckInIndex } = get();
        return checkInQueue[currentCheckInIndex] || null;
      },

      // Complete current patient and move to next
      completeCheckIn: async (notes) => {
        const { checkInQueue, currentCheckInIndex, fetchVisits } = get();
        const currentVisit = checkInQueue[currentCheckInIndex];

        if (!currentVisit) return;

        // Update visit status to completed
        await api.updateVisit(currentVisit.id, {
          status: 'completed',
          notes: notes || currentVisit.notes,
        });

        // Move to next patient
        const nextIndex = currentCheckInIndex + 1;

        if (nextIndex >= checkInQueue.length) {
          // All patients checked in
          set({
            checkInActive: false,
            currentCheckInIndex: 0,
            checkInQueue: [],
            modals: { ...get().modals, checkIn: false },
          });
          // Refresh visits to show updated statuses
          fetchVisits();
          return { done: true };
        } else {
          set({ currentCheckInIndex: nextIndex });
          return { done: false, remaining: checkInQueue.length - nextIndex };
        }
      },

      // Skip current patient and move to next
      skipCheckIn: () => {
        const { checkInQueue, currentCheckInIndex, fetchVisits } = get();
        const nextIndex = currentCheckInIndex + 1;

        if (nextIndex >= checkInQueue.length) {
          // No more patients
          set({
            checkInActive: false,
            currentCheckInIndex: 0,
            checkInQueue: [],
            modals: { ...get().modals, checkIn: false },
          });
          fetchVisits();
          return { done: true };
        } else {
          set({ currentCheckInIndex: nextIndex });
          return { done: false, remaining: checkInQueue.length - nextIndex };
        }
      },

      // Cancel check-in process
      cancelCheckIn: () => {
        set({
          checkInActive: false,
          currentCheckInIndex: 0,
          checkInQueue: [],
          modals: { ...get().modals, checkIn: false },
        });
        get().fetchVisits();
      },

      // ============ UI ACTIONS ============
      
      // Set filters
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
        // Refetch visits with new filters
        get().fetchVisits();
      },
      
      // Clear all filters
      clearFilters: () => {
        set({ filters: { clinician_id: null, patient_id: null, status: null } });
        get().fetchVisits();
      },

      // Navigate calendar months
      goToPreviousMonth: () => {
        set((state) => ({
          currentMonth: state.currentMonth.subtract(1, 'month'),
        }));
        get().fetchVisits();
      },
      
      goToNextMonth: () => {
        set((state) => ({
          currentMonth: state.currentMonth.add(1, 'month'),
        }));
        get().fetchVisits();
      },
      
      goToToday: () => {
        set({ currentMonth: dayjs() });
        get().fetchVisits();
      },

      // Modal controls
      openModal: (modalName) => {
        set((state) => ({
          modals: { ...state.modals, [modalName]: true },
        }));
      },
      
      closeModal: (modalName) => {
        set((state) => ({
          modals: { ...state.modals, [modalName]: false },
          selectedVisit: null,
          selectedDate: null,
        }));
      },

      // Select visit for editing
      setSelectedVisit: (visit) => {
        set({ selectedVisit: visit });
      },
      
      // Select date for new visit
      setSelectedDate: (date) => {
        set({ selectedDate: date });
      },
    }),
    {
      name: 'patient-tracker-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

export default useStore;
