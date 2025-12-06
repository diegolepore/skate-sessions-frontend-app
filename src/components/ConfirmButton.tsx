'use client'

import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  message?: string;
};

export default function ConfirmButton({ message, onClick, ...props }: Props) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const ok = window.confirm(message ?? 'Are you sure you want to proceed?');
    
    if (!ok) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    onClick?.(e);
  };

  return <button {...props} onClick={handleClick} />;
}
