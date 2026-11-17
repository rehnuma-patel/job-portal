import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { advanceApplication, createApplication, withdrawApplication } from '../lib/applications.js';

// Shared app state with React Context: saved jobs, applications and the applicant's profile.
// Any component can read it with useJobBoard() instead of passing props through every level.

const STORAGE_KEY = 'hirewave-state-v1';
const JobBoardContext = createContext(null);

const emptyState = { saved: [], applications: [], profile: { name: '', email: '', phone: '' } };

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.saved) && Array.isArray(saved.applications)) return { ...emptyState, ...saved };
  } catch {
    // ignore broken storage
  }
  return emptyState;
}

function reducer(state, action) {
  switch (action.type) {
    case 'toggleSave': {
      const isSaved = state.saved.includes(action.jobId);
      return { ...state, saved: isSaved ? state.saved.filter((id) => id !== action.jobId) : [action.jobId, ...state.saved] };
    }
    case 'apply':
      return {
        ...state,
        applications: [action.application, ...state.applications],
        profile: { ...action.application.applicant },
      };
    case 'withdraw':
      return {
        ...state,
        applications: state.applications.map((app) => (app.id === action.id ? withdrawApplication(app, action.now) : app)),
      };
    case 'remove':
      return { ...state, applications: state.applications.filter((app) => app.id !== action.id) };
    case 'tick': {
      let changed = false;
      const applications = state.applications.map((app) => {
        const next = advanceApplication(app, action.now);
        if (next !== app) changed = true;
        return next;
      });
      return changed ? { ...state, applications } : state;
    }
    default:
      return state;
  }
}

export function JobBoardProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // Save to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or blocked
    }
  }, [state]);

  // Check for "employer updates" right away and every 5 seconds
  useEffect(() => {
    dispatch({ type: 'tick', now: Date.now() });
    const timer = setInterval(() => dispatch({ type: 'tick', now: Date.now() }), 5_000);
    return () => clearInterval(timer);
  }, []);

  // Keep other open tabs in sync
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) dispatch({ type: 'tick', now: Date.now() });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleSave = useCallback((jobId) => dispatch({ type: 'toggleSave', jobId }), []);
  const apply = useCallback((job, form, resume) => {
    const application = createApplication({ job, form, resume });
    dispatch({ type: 'apply', application });
    return application;
  }, []);
  const withdraw = useCallback((id) => dispatch({ type: 'withdraw', id, now: Date.now() }), []);
  const remove = useCallback((id) => dispatch({ type: 'remove', id }), []);

  const value = useMemo(() => {
    const applicationByJob = Object.fromEntries(
      state.applications.filter((app) => app.status !== 'withdrawn').map((app) => [app.jobId, app]),
    );
    return {
      saved: state.saved,
      isSaved: (jobId) => state.saved.includes(jobId),
      toggleSave,
      applications: state.applications,
      applicationFor: (jobId) => applicationByJob[jobId] ?? null,
      apply,
      withdraw,
      remove,
      profile: state.profile,
    };
  }, [state, toggleSave, apply, withdraw, remove]);

  return <JobBoardContext.Provider value={value}>{children}</JobBoardContext.Provider>;
}

export function useJobBoard() {
  const context = useContext(JobBoardContext);
  if (!context) throw new Error('useJobBoard must be used inside <JobBoardProvider>');
  return context;
}
