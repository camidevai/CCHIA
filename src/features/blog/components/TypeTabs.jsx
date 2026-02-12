/* eslint-disable react/prop-types */
import { useRef } from 'react';
import { motion } from 'framer-motion';

const TABS = [
  { value: null, label: 'Todos' },
  { value: 'article', label: 'Articulos' },
  { value: 'news', label: 'Noticias' },
  { value: 'resource', label: 'Recursos' },
];

const TypeTabs = ({ activeType, onTypeChange }) => {
  const tabRefs = useRef([]);

  const handleKeyDown = (e, index) => {
    let nextIndex;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + TABS.length) % TABS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = TABS.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    tabRefs.current[nextIndex]?.focus();
    onTypeChange(TABS[nextIndex].value);
  };

  return (
    <div role="tablist" aria-label="Filtrar por tipo" className="flex gap-2 flex-wrap">
      {TABS.map((tab, index) => {
        const isActive = activeType === tab.value;
        return (
          <button
            key={tab.label}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTypeChange(tab.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`relative px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 focus:outline-2 focus:outline-offset-2 focus:outline-accent ${
              isActive
                ? 'text-white'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-accent'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="activeTab"
                className="absolute inset-0 bg-accent rounded-xl"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TypeTabs;
