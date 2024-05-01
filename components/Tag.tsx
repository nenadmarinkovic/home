import { TagType } from '../types/types';

function Tag({ color, text }: TagType) {
  return <span className={color}>{text}</span>;
}

export default Tag;
