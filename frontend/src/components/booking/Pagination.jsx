import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Pagination.css';

function buildPageNumbers(current, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('...');
  for (let p = Math.max(2, current - 1); p <= Math.min(totalPages - 1, current + 1); p += 1) {
    pages.push(p);
  }
  if (current < totalPages - 2) pages.push('...');
  pages.push(totalPages);
  return pages;
}

export default function Pagination({ total, pageSize, current, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const safePage = Math.min(current, totalPages);
  const startItem = (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, total);
  const pageNumbers = buildPageNumbers(safePage, totalPages);

  const goTo = (page) => {
    if (page < 1 || page > totalPages) return;
    onChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pagination-bar">
      <p className="pagination-summary">
        Showing <strong>{startItem}–{endItem}</strong> of <strong>{total}</strong> reservations
      </p>

      <div className="pagination-controls">
        <button type="button" onClick={() => goTo(safePage - 1)} disabled={safePage === 1} aria-label="Previous page">
          <FaChevronLeft />
        </button>

        {pageNumbers.map((p, i) => (
          p === '...'
            ? <span key={`ellipsis-${i}`} className="pagination-ellipsis">...</span>
            : (
              <button
                type="button"
                key={p}
                onClick={() => goTo(p)}
                aria-label={`Page ${p}`}
                aria-current={p === safePage ? 'page' : undefined}
                className={p === safePage ? 'active' : ''}
              >
                {p}
              </button>
            )
        ))}

        <button type="button" onClick={() => goTo(safePage + 1)} disabled={safePage === totalPages} aria-label="Next page">
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
}
