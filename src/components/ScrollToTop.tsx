import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10, x: "-50%" }}
          animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, scale: 0.8, y: 10, x: "-50%" }}
          whileHover={{ scale: 1.1, x: "-50%" }}
          whileTap={{ scale: 0.9, x: "-50%" }}
          onClick={scrollToTop}
          className="fixed bottom-6 left-1/2 z-50 p-3.5 bg-gradient-to-tr from-blue-900 to-blue-800 text-white hover:from-orange-600 hover:to-orange-500 rounded-full shadow-xl shadow-blue-900/20 border border-white/10 flex items-center justify-center cursor-pointer transition-all duration-300 group"
          aria-label="Cuộn lên đầu trang"
          title="Cuộn lên đầu trang"
          id="scroll-to-top-button"
        >
          <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
