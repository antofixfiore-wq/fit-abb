import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "fitabb_nav_state";

export function useNavigationState() {
  const location = useLocation();
  const [navState, setNavState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const currentPath = location.pathname;
    setNavState(prev => {
      const newState = {
        ...prev,
        [currentPath]: {
          scrollPosition: window.scrollY,
          timestamp: Date.now()
        }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, [location]);

  const restoreState = (path) => {
    const state = navState[path];
    if (state && state.scrollPosition) {
      setTimeout(() => {
        window.scrollTo({ top: state.scrollPosition, behavior: "smooth" });
      }, 100);
    }
  };

  return { navState, restoreState };
}