const btnSettingsDashboard = document.querySelector('.btn_settings--dashboard');
const settingsDashboard = document.querySelector('.settings__block');
const okBtnDashboard = document.querySelector('.btn__settings');
const countries = document.querySelector('.countries');
const map = document.querySelector('.map');
const dashboard = document.querySelector('.dashboard');
const chart = document.querySelector('.chart');
const piechart = document.querySelector('.piechart');
const btnsFullScreen = document.querySelectorAll('.fa-expand');
const contentBlocks = ['countries', 'map', 'dashboard', 'chart', 'piechart'];
let openFullScreen: boolean = false;

btnSettingsDashboard.addEventListener('click', () => {
  settingsDashboard.classList.remove('hide');
});

okBtnDashboard.addEventListener('click', () => {
  // ПЕРЕРИСОВКА ВСЕГО
  settingsDashboard.classList.add('hide');
});

function countriesFullScreen() {
  countries.classList.remove('hide');
  countries.classList.add('fullscreen');
}

function mapFullScreen() {
  map.classList.remove('hide');
  map.classList.add('fullscreen');
}

function dashboardFullScreen() {
  dashboard.classList.remove('hide');
  dashboard.classList.add('fullscreen');
  document.querySelectorAll('.heading__section').forEach((el) => {
    el.classList.add('heading__section--full');
  });
  document.querySelectorAll('.dashboard__number').forEach((el) => {
    el.classList.add('dashboard__number--full');
  });
}

function chartFullScreen() {
  chart.classList.remove('hide');
  chart.classList.add('fullscreen');
}

function piechartFullScreen() {
  piechart.classList.remove('hide');
  piechart.classList.add('fullscreen');
}

function hideContentBlocks() {
  contentBlocks.forEach((it) => {
    document.querySelector(`.${it}`).classList.add('hide');
  });
}

function showContentBlocks() {
  contentBlocks.forEach((it) => {
    console.log(document.querySelector(`.${it}`));
    document.querySelector(`.${it}`).classList.remove('hide');
  });

  document.querySelector('.fullscreen').classList.remove('fullscreen');
}

btnsFullScreen.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (!openFullScreen) {
      openFullScreen = true;
      hideContentBlocks();
      if (btn.classList.contains('btn_fullscreen--countries')) {
        countriesFullScreen();
      }
      if (btn.classList.contains('btn_fullscreen--dashboard')) {
        dashboardFullScreen();
      }
      if (btn.classList.contains('btn_fullscreen--map')) {
        mapFullScreen();
      }
      if (btn.classList.contains('btn_fullscreen--chart')) {
        chartFullScreen();
      }
      if (btn.classList.contains('btn_fullscreen--piechart')) {
        piechartFullScreen();
      }
    } else {
      openFullScreen = false;
      showContentBlocks();
    }
  });
});
