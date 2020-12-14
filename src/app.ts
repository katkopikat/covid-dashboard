import Dispatch from './dispatch';
import './assets/styles/styles.scss';

window.onload = () => {
  const covid = new Dispatch();
  covid.start();
};
