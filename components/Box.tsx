import { BoxPropsTypes } from '../types/types';
import boxStyles from '../styles/components/Box.module.css';

function Box({
  title,
  boxColor,
  headerText,
  mainTitle,
  boxItems,
}: BoxPropsTypes) {
  return (
    <div className={boxStyles.boxItem}>
      <div className={boxStyles.boxItemInside}>
        <h3
          className={`${boxStyles.boxItemHeaderTitle} ${boxStyles[boxColor]}`}
        >
          {title}
        </h3>
        <p className={boxStyles.boxItemHeaderText}>{headerText}</p>
        <p
          className={`${boxStyles.boxItemMainTitle} ${boxStyles[boxColor]}`}
        >
          {mainTitle}
        </p>
        <div className={boxStyles.boxItemMainItems}>
          {boxItems.map((item, index) => (
            <div key={index} className={boxStyles.boxItemMainItem}>
              {item.icon}
              <span className={boxStyles.boxItemMainItemText}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        className={`${boxStyles.blur} ${
          boxStyles[`blur-${boxColor}`]
        }`}
      ></div>
    </div>
  );
}

export default Box;
