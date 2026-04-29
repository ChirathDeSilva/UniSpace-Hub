import React from 'react';
import './SkeletonCard.css';

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line skeleton-line-top" />
      <div className="skeleton-line skeleton-line-title" />
      <div className="skeleton-line skeleton-line-subtitle" />
      <div className="skeleton-block" />
      <div className="skeleton-block" />
      <div className="skeleton-footer" />
    </div>
  );
}
