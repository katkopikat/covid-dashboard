const countries: HTMLElement = document.querySelector('.countries');
const map: HTMLElement = document.querySelector('.map');
const dashboard: HTMLElement = document.querySelector('.dashboard');
const chart: HTMLElement = document.querySelector('.chart');
const piechart: HTMLElement = document.querySelector('.piechart');
const btnsFullScreen: NodeListOf<Element> = document.querySelectorAll('.fa-expand');
const btnsSettings: NodeListOf<Element> = document.querySelectorAll('.fa-sliders-h');
const okBtns: NodeListOf<Element> = document.querySelectorAll('.btn__settings');
const settingsBlocks: NodeListOf<Element> = document.querySelectorAll('.settings__block');
const wrapper: HTMLElement = document.querySelector('.wrapper--main');

const contentBlocks: Array<string> = ['countries', 'map', 'dashboard', 'chart', 'piechart'];
let openFullScreen: boolean = false;

(function (): void {
  okBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      settingsBlocks.forEach((block) => {
        block.classList.add('hide');
      // ПЕРЕРИСОВКА ВСЕГО
      });
    });
  });

  btnsSettings.forEach((btn) => {
    btn.addEventListener('click', () => {
      const temp: string = btn.classList[0].replace('btn_settings--', '');
      document.querySelector(`.settings__${temp}`).classList.remove('hide');
    });
  });

  btnsFullScreen.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!openFullScreen) {
        openFullScreen = true;
        hideContentBlocks();
        wrapper.classList.add('wrapper__fullscreen');
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
      } else {
        openFullScreen = false;
        wrapper.classList.remove('wrapper__fullscreen');
        document.querySelector('.set_fs').classList.remove('set_fs');
        showContentBlocks();
        dashboardRemoveFullScreen();
      }
    });
  })

}());

function countriesFullScreen(): void {
  countries.classList.remove('hide');
  countries.classList.add('fullscreen');
  countries.querySelector('.settings__countries').classList.add('set_fs');
}

function mapFullScreen(): void {
  map.classList.remove('hide');
  map.classList.add('fullscreen');
  map.querySelector('.settings__map').classList.add('set_fs');
}

function dashboardFullScreen(): void {
  dashboard.classList.remove('hide');
  dashboard.classList.add('fullscreen');
  dashboard.querySelector('.settings__dashboard').classList.add('set_fs');
  dashboard.querySelectorAll('.heading__section').forEach((el) => {
    el.classList.add('heading__section--full');
  });
  dashboard.querySelectorAll('.dashboard__number').forEach((el) => {
    el.classList.add('dashboard__number--full');
  });
}

function dashboardRemoveFullScreen(): void {
    dashboard.classList.remove('fullscreen');
    dashboard.querySelectorAll('.heading__section').forEach((el) => {
      el.classList.remove('heading__section--full');
    });
    dashboard.querySelectorAll('.dashboard__number').forEach((el) => {
      el.classList.remove('dashboard__number--full');
    });
}

function chartFullScreen(): void {
  chart.classList.remove('hide');
  chart.classList.add('fullscreen');
  chart.querySelector('.settings__chart').classList.add('set_fs');
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
