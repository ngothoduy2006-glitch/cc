import React from 'react';

export function PostCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 border space-y-4"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Tags skeleton */}
      <div className="flex gap-2">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-12 rounded-full" />
      </div>
      {/* Title */}
      <div className="space-y-2">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
      </div>
      {/* Content */}
      <div className="space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="skeleton w-7 h-7 rounded-lg" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
        <div className="flex gap-3">
          <div className="skeleton h-3 w-8 rounded" />
          <div className="skeleton h-3 w-8 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div
      className="rounded-2xl p-4 border"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex gap-3">
        <div className="skeleton w-8 h-8 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-32 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-4/5 rounded" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-6 border space-y-3"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="skeleton h-10 w-10 rounded-xl" />
      <div className="skeleton h-8 w-20 rounded" />
      <div className="skeleton h-3 w-24 rounded" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex gap-4 py-3 px-4">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="skeleton h-4 flex-1 rounded" />
      ))}
    </div>
  );
}
