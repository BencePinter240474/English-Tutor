import React from 'react';
import { Icon } from '../design/components';

/* One multiple-choice option, shared by Grammar and Reading so the two are
   marked identically.

   Before an answer is given it is a neutral fill that presses like a button.
   After, the correct option goes green whatever was picked, and a wrong
   choice goes red, so the right form is always visible next to the mistake.
   Colour is carried with a symbol as well, never on its own. */

interface Props {
  option: string;
  /** Null until the question has been answered. */
  chosen: string | null;
  answer: string;
  onChoose: (option: string) => void;
}

export function AnswerOption({ option, chosen, answer, onChoose }: Props) {
  const [pressed, setPressed] = React.useState(false);
  const release = () => setPressed(false);

  const marked = chosen != null;
  const isAnswer = option.toLowerCase() === answer.toLowerCase();
  const isChosen = chosen === option;
  const wrong = marked && isChosen && !isAnswer;

  const tint = isAnswer ? 'var(--green)' : 'var(--red)';
  const background = marked && (isAnswer || wrong)
    ? `color-mix(in srgb, ${tint} 14%, transparent)`
    : 'var(--fill-tertiary)';
  const border = marked && (isAnswer || wrong) ? tint : 'transparent';

  return (
    <button
      type="button"
      onClick={() => onChoose(option)}
      aria-disabled={marked}
      onPointerDown={() => !marked && setPressed(true)}
      onPointerUp={release} onPointerLeave={release} onPointerCancel={release}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        width: '100%', minHeight: 52, padding: 'var(--space-3) var(--space-4)',
        textAlign: 'left', background, border: '1.5px solid ' + border,
        borderRadius: 'var(--radius-control)',
        font: 'var(--text-body)', letterSpacing: 'var(--tracking-body)',
        fontWeight: marked && isAnswer ? 600 : 400,
        color: 'var(--label)',
        cursor: marked ? 'default' : 'pointer',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'var(--transition-control), border-color var(--duration-fast) var(--ease-standard)',
      }}
    >
      <span style={{ flex: 1 }}>{option}</span>
      {marked && isAnswer && (
        <Icon name="checkmark" size={18} weight={2.6} style={{ color: 'var(--green)' }} />
      )}
      {wrong && (
        <Icon name="xmark" size={18} weight={2.6} style={{ color: 'var(--red)' }} />
      )}
    </button>
  );
}
