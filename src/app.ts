import Dispatch from './dispatch';
import './assets/styles/styles.scss';
import './assets/styles/fontawesome/css/all.css';
import './eventlisteners'

window.onload = () => {
  const covid = new Dispatch();
  covid.start();
};

