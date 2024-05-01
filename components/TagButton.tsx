import { TagButtonType } from '../types/types';

function TagButton({ onClick, text, color, active }: TagButtonType) {
  return (
    <button
      onClick={onClick}
      className={[color, active === text && 'active-button'].join(
        ' '
      )}
    >
      {text}
    </button>
  );
}

export default TagButton;
