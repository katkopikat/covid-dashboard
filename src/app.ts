import Dispatch from './dispatch';
import './assets/styles/style.css';
import './assets/styles/fontawesome/css/all.css';
import './eventlisteners'

window.onload = () => {
  const covid = new Dispatch();
  covid.start();
};

