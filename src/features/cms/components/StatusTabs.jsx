/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';

const TABS = [
  { value: 'draft', label: 'Borradores' },
  { value: 'published', label: 'Publicados' },
  { value: 'archived', label: 'Archivados' },
];

const StatusTabs = ({ activeStatus, onStatusChange }) => {
  return (
    <div role="tablist" aria-label="Filtrar por estado" className="flex gap-2 flex-wrap">
      {TABS.map((tab) => {
        const isActive = activeStatus === tab.value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onStatusChange(tab.value)}
            className={`relative px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 ${
              isActive
                ? 'text-white'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-accent'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="activeStatusTab"
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

export default StatusTabs;
