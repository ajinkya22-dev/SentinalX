import React from 'react';

interface CardProps {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, actions, children, className }) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col ${className || ''}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-base font-semibold text-gray-800">{title}</h3>}
          {actions && <div className="text-xs text-gray-500">{actions}</div>}
        </div>
      )}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
};

export default Card;

