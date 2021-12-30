import {windowWidth} from '../Utils/Dimension';

export const fontSizer = () => {
  if (windowWidth() > 400) {
    return 18;
  } else if (windowWidth() > 250) {
    return 16;
  } else {
    return 12;
  }
};
