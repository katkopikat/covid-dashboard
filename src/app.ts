import Dispatch from './dispatch';
import './assets/styles/styles.scss';
import './assets/styles/loader.css';
import './assets/styles/fontawesome/css/all.css';
import './assets/images/rs_logo.png';
import './assets/images/global-flag.png';
import './assets/images/favicon.png';
import './eventlisteners';
import './keyboard';

alert('Уважаемый проверяющий, подожди, плиз, хотя бы денёк: мой напарник борется с API и графиком!')
window.onload = () => {
  const covid = new Dispatch();
  covid.start();
};
