//const btnSettingsDashboard: HTMLElement = document.querySelector('.btn_settings--dashboard');
// const settingsDashboard: HTMLElement = document.querySelector('.settings__block');

const countries: HTMLElement = document.querySelector('.countries');
const map: HTMLElement = document.querySelector('.map');
const dashboard: HTMLElement = document.querySelector('.dashboard');
const chart: HTMLElement = document.querySelector('.chart');
const piechart: HTMLElement = document.querySelector('.piechart');
const btnsFullScreen: NodeListOf<Element> = document.querySelectorAll('.fa-expand');
const btnsSettings: NodeListOf<Element> = document.querySelectorAll('.fa-sliders-h');
const okBtns: NodeListOf<Element> = document.querySelectorAll('.btn__settings');
const settingsBlocks: NodeListOf<Element> = document.querySelectorAll('.settings__block');

const contentBlocks: Array<string> = ['countries', 'map', 'dashboard', 'chart', 'piechart'];
let openFullScreen: boolean = false;

(function(): void {

okBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    settingsBlocks.forEach((block) => {
      block.classList.add('hide');
      // ПЕРЕРИСОВКА ВСЕГО
    })
  });
});

btnsSettings.forEach((btn) => {
  btn.addEventListener('click', () => {
    let temp: string = btn.classList[0].replace('btn_settings--','');
        document.querySelector(`.settings__${temp}`).classList.remove('hide');
  });
});

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
}());

function countriesFullScreen(): void {
  countries.classList.remove('hide');
  countries.classList.add('fullscreen');
}

function mapFullScreen(): void {
  map.classList.remove('hide');
  map.classList.add('fullscreen');
}

function dashboardFullScreen(): void {
  dashboard.classList.remove('hide');
  dashboard.classList.add('fullscreen');
  document.querySelectorAll('.heading__section').forEach((el) => {
    el.classList.add('heading__section--full');
  });
  document.querySelectorAll('.dashboard__number').forEach((el) => {
    el.classList.add('dashboard__number--full');
  });
}

function chartFullScreen(): void {
  chart.classList.remove('hide');
  chart.classList.add('fullscreen');
}

function piechartFullScreen(): void {
  piechart.classList.remove('hide');
  piechart.classList.add('fullscreen');
}

function hideContentBlocks(): void {
  contentBlocks.forEach((it) => {
    document.querySelector(`.${it}`).classList.add('hide');
  });
}

function showContentBlocks(): void {
  contentBlocks.forEach((it) => {
    document.querySelector(`.${it}`).classList.remove('hide');
  });

  document.querySelector('.fullscreen').classList.remove('fullscreen');
}

// (function (): void {
//   btnSettingsDashboard.addEventListener('click', () => {
//     settingsDashboard.classList.remove('hide');
//   });

//   okBtnDashboard.addEventListener('click', () => {
//     // ПЕРЕРИСОВКА ВСЕГО
//     settingsDashboard.classList.add('hide');
//   });

//   btnsFullScreen.forEach((btn) => {
//     btn.addEventListener('click', () => {
//       if (!openFullScreen) {
//         openFullScreen = true;
//         hideContentBlocks();
//         if (btn.classList.contains('btn_fullscreen--countries')) {
//           countriesFullScreen();
//         }
//         if (btn.classList.contains('btn_fullscreen--dashboard')) {
//           dashboardFullScreen();
//         }
//         if (btn.classList.contains('btn_fullscreen--map')) {
//           mapFullScreen();
//         }
//         if (btn.classList.contains('btn_fullscreen--chart')) {
//           chartFullScreen();
//         }
//         if (btn.classList.contains('btn_fullscreen--piechart')) {
//           piechartFullScreen();
//         }
//       } else {
//         openFullScreen = false;
//         showContentBlocks();
//       }
//     });
//   });
// }());
