import { useCallback } from 'react';

const useScrollToSection = (id: string) => {
  return useCallback(() => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [id]);
};

export default useScrollToSection; 