/* eslint-disable */
// 4 - english, 2 - shift, 1 - caps
const kbdLayouts = [
  'ё1234567890-=йцукенгшщзхъ\\фывапролджэячсмитьбю.',
  'Ё1234567890-=ЙЦУКЕНГШЩЗХЪ\\ФЫВАПРОЛДЖЭЯЧСМИТЬБЮ.',
  'Ё!"№;%:?*()_+ЙЦУКЕНГШЩЗХЪ/ФЫВАПРОЛДЖЭЯЧСМИТЬБЮ,',
  'ё!"№;%:?*()_+йцукенгшщзхъ/фывапролджэячсмитьбю,',
  '`1234567890-=qwertyuiop[]\\asdfghjkl;\'zxcvbnm,./',
  '`1234567890-=QWERTYUIOP[]\\ASDFGHJKL;\'ZXCVBNM,./',
  '~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:"ZXCVBNM<>?',
  '~!@#$%^&*()_+qwertyuiop{}|asdfghjkl:"zxcvbnm<>?',
];

class Keyboard {
  constructor() {
    this.capsStatus = false;
    this.shiftStatus = false;
    this.languageEnglish = true;
    this.mute = false;
    this.voiceInput = false;
    this.hidden = true;

    document.querySelectorAll('.kbd-key').forEach((el) => {
      if (el.classList.contains('kbd-special')) {
        el.addEventListener('click', () => this.clickSpecial(event));
      } else {
        el.addEventListener('click', () => this.clickLetter(event));
      }
    });

    document.addEventListener('keydown', () => this.keyDown(event));
    document.addEventListener('keyup', () => this.keyUp(event));
    rec.addEventListener('error', (e) => {
      if (e.error === 'not-allowed') {
        alert('Предоставьте странице доступ к микрофону.');
      }
      if (e.error === 'no-speech') {
        return;
      }

      rec.abort();
      rec.stop();
      rec.removeEventListener('end', rec.start);
      rec.removeEventListener('result', () => this.recognize(event));
      document.querySelector('[data-key="Voice"]')
        .getElementsByTagName('i')[0].textContent = 'mic_off';
      this.voiceInput = false;
    });
    this._drawLayout();
  }

  keyDown(e) {
    if (['Shift', 'Control', 'Alt', 'CapsLock'].includes(e.key) && e.repeat) return;

    switch (e.code) {
      case 'CapsLock':
        document.querySelector('[data-key="CapsLock"]').classList.toggle('pressed');
        this.capsStatus = !this.capsStatus;
        this._drawLayout();
        return;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.shiftStatus = !this.shiftStatus;
        document.querySelector('[data-key="ShiftLeft"]').classList.toggle('pressed');
        document.querySelector('[data-key="ShiftRight"]').classList.toggle('pressed');
        this._drawLayout();
        return;
      case 'Space':
        break;
      case 'Enter':
        break;
      case 'Backspace':
        break;
      case 'Tab':
        e.preventDefault();
        display.inputText('    ');
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ControlLeft':
      case 'ControlRight':
      case 'AltLeft':
      case 'AltRight':
        break;
      default:
        const prevLang = this.languageEnglish;
        if (/[а-яёА-ЯЁ№]/.test(e.key)) this.languageEnglish = false;
        if (/[a-zA-Z@#$&~^|{}\[\]]/.test(e.key)) this.languageEnglish = true;
        if (prevLang != this.languageEnglish) {
          document.querySelector('[data-key="Lang"]').textContent = this.languageEnglish ? 'En' : 'Ру';
          if (this.voiceInput) {
            rec.lang = this.languageEnglish ? 'en-US' : 'ru-Ru';
          }
          this._drawLayout();
        }
    }

    const tElem = document.querySelector(`.kbd-key[data-key="${e.code}"]`);
    if (tElem) {
      tElem.classList.add('pressed');
    }
  }

  keyUp(e) {
    if (['Shift', 'CapsLock'].includes(e.key)) return;

    const tElem = document.querySelector(`.kbd-key[data-key="${e.code}"]`);
    if (tElem) {
      tElem.classList.remove('pressed');
    }
  }

  clickLetter(e) {
    display.inputText(e.target.textContent);
  }

  clickSpecial(e) {
    const key = e.target.dataset.key ? e.target : e.target.parentElement;

    switch (key.dataset.key) {
      case 'CapsLock':
        key.classList.toggle('pressed');
        this.capsStatus = !this.capsStatus;
        this._drawLayout();
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.shiftStatus = !this.shiftStatus;
        document.querySelector('[data-key="ShiftLeft"]').classList.toggle('pressed');
        document.querySelector('[data-key="ShiftRight"]').classList.toggle('pressed');
        this._drawLayout();
        break;
      case 'Lang':
        this.languageEnglish = !this.languageEnglish;
        key.textContent = this.languageEnglish ? 'En' : 'Ру';
        if (this.voiceInput) {
          rec.lang = this.languageEnglish ? 'en-US' : 'ru-Ru';
        }
        this._drawLayout();
        break;
      case 'ArrowLeft':
        if (this.shiftStatus) {
          display.selectLeft();
        } else {
          display.cursorLeft();
        }
        break;
      case 'ArrowRight':
        if (this.shiftStatus) {
          display.selectRight();
        } else {
          display.cursorRight();
        }
        break;
      case 'Space':
        display.inputText(' ');
        break;
      case 'Enter':
        display.inputText('\n');
        break;
      case 'Backspace':
        display.backspace();
        break;
      case 'Mute':
        this.mute = !this.mute;
        if (this.mute) {
          key.getElementsByTagName('i')[0].textContent = 'volume_off';
        } else {
          key.getElementsByTagName('i')[0].textContent = 'volume_up';
        }
        break;
      case 'Hide':
        this.hidden = true;
        document.querySelector('.wrapper').classList.add('wrapper-hidden');
        return;
      case 'Tab':
        display.inputText('    ');
        break;
      case 'Voice':
        this.voiceInput = !this.voiceInput;
        if (this.voiceInput) {
          key.getElementsByTagName('i')[0].textContent = 'mic';

          rec = new SpeechRecognition();
          rec.interimResults = true;
          rec.lang = this.languageEnglish ? 'en-US' : 'ru-Ru';
          rec.start();
          rec.addEventListener('end', rec.start);
          rec.addEventListener('result', () => this.recognize(event));
        } else {
          key.getElementsByTagName('i')[0].textContent = 'mic_off';

          rec.abort();
          rec.removeEventListener('end', rec.start);
          rec.removeEventListener('result', () => this.recognize(event));
        }
        break;
      case 'ControlLeft':
      case 'ControlRight':
      case 'AltLeft':
      case 'AltRight':
        break;
    }

    display.refresh();
  }

  recognize(e) {
    const { transcript } = e.results[0][0];
    if (e.results[0].isFinal) {
      display.inputText(`${transcript} `);
    }
  }

  _drawLayout() {
    let i = 0;
    document.querySelectorAll('.kbd-key').forEach((el) => {
      if (!el.classList.contains('kbd-special')) {
        el.textContent = kbdLayouts[this.languageEnglish * 4 + this.shiftStatus * 2 + this.capsStatus][i++];
      }
    });
  }
}

class Display {
  constructor() {
    this.element = undefined;

    document.querySelectorAll('textarea, input').forEach((el) => {
      el.addEventListener('focus', (e) => {
        this.element = e.target;
        kbd.hidden = false;
        document.querySelector('.wrapper').classList.remove('wrapper-hidden');
      });
    });
  }

  refresh() {
    this.element.focus();
    this.element.dispatchEvent(new KeyboardEvent('input'));
  }

  _deleteSelection() {
    const previousSelectionPosition = this.element.selectionStart;
    this.element.value = this.element.value.slice(0, this.element.selectionStart)
            + this.element.value.slice(this.element.selectionEnd, this.element.value.length);
    this.element.selectionStart = this.element.selectionEnd = previousSelectionPosition;
  }

  cursorRight() {
    if (this.element.selectionStart !== this.element.selectionEnd) {
      this.element.selectionStart = this.element.selectionEnd;
    } else if (this.element.selectionEnd < this.element.value.length) {
      this.element.selectionEnd++;
      this.element.selectionStart++;
    }
    this.refresh();
  }

  cursorLeft() {
    if (this.element.selectionStart !== this.element.selectionEnd) {
      this.element.selectionEnd = this.element.selectionStart;
    } else if (this.element.selectionStart > 0) {
      this.element.selectionStart--;
      this.element.selectionEnd--;
    }
    this.refresh();
  }

  selectRight() {
    if (this.element.selectionDirection === 'forward') {
      if (this.element.selectionEnd < this.element.value.length) {
        this.element.selectionEnd++;
      }
    } else {
      this.element.selectionStart++;
      if (this.element.selectionStart === this.element.selectionEnd) {
        this.element.selectionDirection = 'forward';
      }
    }
    this.refresh();
  }

  selectLeft() {
    if (this.element.selectionDirection === 'forward') {
      if (this.element.selectionStart === this.element.selectionEnd) {
        this.element.selectionDirection = 'backward';
      } else {
        this.element.selectionEnd--;
      }
    }

    if (this.element.selectionDirection === 'backward' && this.element.selectionStart > 0) {
      this.element.selectionStart--;
    }
    this.refresh();
  }

  backspace() {
    if (this.element.selectionStart === this.element.selectionEnd) {
      const previousSelectionPosition = this.element.selectionStart;

      if (this.element.selectionStart > 0) {
        this.element.value = this.element.value.slice(0, this.element.selectionEnd - 1)
                    + this.element.value.slice(this.element.selectionEnd, this.element.value.length);
        this.element.selectionStart = this.element.selectionEnd = previousSelectionPosition - 1;
      }
    } else {
      this._deleteSelection();
    }
    this.refresh();
  }

  inputText(text) {
    this._deleteSelection();

    const previousSelectionPosition = this.element.selectionStart;

    this.element.value = this.element.value.slice(0, this.element.selectionEnd) + text + this.element.value.slice(this.element.selectionEnd, this.element.value.length);
    this.element.selectionStart = previousSelectionPosition + text.length;
    this.element.selectionEnd = this.element.selectionStart;

    this.refresh();
  }
}

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = new SpeechRecognition();

const kbd = new Keyboard();
const display = new Display();
