import React from 'react';

/* The segmented control: a small set of mutually exclusive options, all
   visible at once. The selected segment is a raised white pill that slides
   between positions rather than appearing in place, which is what makes the
   control feel like one object instead of a row of buttons. */

export interface Segment {
  value: string;
  label: React.ReactNode;
}

export interface SegmentedControlProps {
  segments: Segment[];
  value: string;
  onChange: (value: string) => void;
  block?: boolean;
  style?: React.CSSProperties;
}

export function SegmentedControl({ segments, value, onChange, block = true, style }: SegmentedControlProps) {
  const index = Math.max(0, segments.findIndex(s => s.value === value));
  const width = 100 / segments.length;

  return (
    <div
      role="tablist"
      style={{
        position: 'relative', display: block ? 'flex' : 'inline-flex',
        width: block ? '100%' : undefined,
        background: 'var(--fill-tertiary)', borderRadius: 'var(--radius-small)',
        padding: 2, ...style,
      }}
    >
      {/* The travelling pill sits under the labels and is driven by index. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 2, bottom: 2,
          left: `calc(${index * width}% + 2px)`,
          width: `calc(${width}% - 4px)`,
          background: 'var(--bg-tertiary)',
          borderRadius: 'calc(var(--radius-small) - 2px)',
          boxShadow: '0 3px 8px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.04)',
          transition: 'left var(--duration-base) var(--ease-spring)',
        }}
      />
      {segments.map(segment => {
        const active = segment.value === value;
        return (
          <button
            key={segment.value} type="button" role="tab" aria-selected={active}
            onClick={() => onChange(segment.value)}
            style={{
              position: 'relative', flex: 1, minWidth: 0,
              padding: '7px 10px', border: 'none', background: 'none',
              cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis',
              font: 'var(--text-subheadline)',
              fontWeight: active ? 600 : 500,
              letterSpacing: 'var(--tracking-subheadline)',
              color: 'var(--label)',
              transition: 'font-weight var(--duration-instant) var(--ease-standard)',
            }}
          >{segment.label}</button>
        );
      })}
    </div>
  );
}
