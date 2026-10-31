import React, { createContext, useContext, useReducer } from 'react';

const Ctx = createContext();

const initial = {
  meetings: [],
  analysis: null,
  analysisStage: 'idle',
  analysisError: null,
  selectedMeetingId: null,
  highlightedLines: null,
  acknowledgedConflicts: new Set(),
  toasts: [],
  kanban: null,
  timeline: null,
  syncing: false,
  syncResults: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MEETINGS':
      return { ...state, meetings: action.payload };
    case 'SET_ANALYSIS':
      return {
        ...state,
        analysis: action.payload,
        analysisStage: 'done',
        analysisError: null,
        acknowledgedConflicts: new Set(),
        syncResults: null,
      };
    case 'SET_STAGE':
      return { ...state, analysisStage: action.payload };
    case 'SET_ERROR':
      return { ...state, analysisStage: 'error', analysisError: action.payload };
    case 'HIGHLIGHT_LINES':
      return { ...state, highlightedLines: action.payload };
    case 'CLEAR_HIGHLIGHT':
      return { ...state, highlightedLines: null };
    case 'ACKNOWLEDGE_CONFLICT': {
      const s = new Set(state.acknowledgedConflicts);
      s.add(action.payload);
      return { ...state, acknowledgedConflicts: s };
    }
    case 'UPDATE_ACTION_ITEM': {
      if (!state.analysis) return state;
      const items = state.analysis.action_items.map((a) =>
        a.id === action.payload.id ? { ...a, ...action.payload.updates } : a
      );
      return { ...state, analysis: { ...state.analysis, action_items: items } };
    }
    case 'ADD_TOAST': {
      const toast = { id: Date.now(), ...action.payload };
      return { ...state, toasts: [...state.toasts, toast] };
    }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    case 'SET_KANBAN':
      return { ...state, kanban: action.payload };
    case 'SET_TIMELINE':
      return { ...state, timeline: action.payload };
    case 'SET_SYNCING':
      return { ...state, syncing: action.payload };
    case 'SET_SYNC_RESULTS':
      return { ...state, syncResults: action.payload, syncing: false };
    case 'RESET':
      return { ...initial, toasts: state.toasts };
    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return React.createElement(Ctx.Provider, { value: { state, dispatch } }, children);
}

export function useStore() {
  return useContext(Ctx);
}
