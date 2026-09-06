import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto py-1">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-cyan-500 transition-colors font-medium"
      >
        <Home className="w-3.5 h-3.5 text-cyan-500" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            {isLast || !item.path ? (
              <span className="font-bold text-slate-900 dark:text-white truncate">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-cyan-500 transition-colors font-medium whitespace-nowrap"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
