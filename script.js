// Format a number: max 2 decimals, thousands separators, no "-0"
function fmt(n) {
  const rounded = Math.round(n * 100) / 100 + 0;
  return rounded.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// The three calculation modes
const modes = {
  find: {
    labelA: 'Number',
    labelB: 'Out of (total)',
    hintA: 'e.g. 45',
    hintB: 'e.g. 60',
    compute(a, b) {
      if (b === 0) return { error: "The total can't be zero." };
      const p = (a / b) * 100;
      return {
        big: fmt(p) + '%',
        text: `${fmt(a)} is ${fmt(p)}% of ${fmt(b)}`,
        bar: p,
      };
    },
  },
  of: {
    labelA: 'Percentage (%)',
    labelB: 'Of this number',
    hintA: 'e.g. 15',
    hintB: 'e.g. 200',
    compute(a, b) {
      const v = (a / 100) * b;
      return {
        big: fmt(v),
        text: `${fmt(a)}% of ${fmt(b)} is ${fmt(v)}`,
      };
    },
  },
  change: {
    labelA: 'From (old value)',
    labelB: 'To (new value)',
    hintA: 'e.g. 80',
    hintB: 'e.g. 100',
    compute(a, b) {
      if (a === 0) return { error: "The old value can't be zero." };
      const p = ((b - a) / Math.abs(a)) * 100;
      const sign = p > 0 ? '+' : '';
      let word = 'No change';
      if (p > 0) word = 'Increase';
      if (p < 0) word = 'Decrease';
      return {
        big: sign + fmt(p) + '%',
        text: `${word} from ${fmt(a)} to ${fmt(b)}`,
      };
    },
  },
};

const tabs = document.querySelectorAll('.tab');
const inputA = document.getElementById('inputA');
const inputB = document.getElementById('inputB');
const labelA = document.getElementById('labelA');
const labelB = document.getElementById('labelB');
const resultEl = document.querySelector('.result');
const bigEl = document.getElementById('big');
const textEl = document.getElementById('text');
const barWrap = document.getElementById('barWrap');
const barFill = document.getElementById('barFill');
const clearBtn = document.getElementById('clear');

let current = 'find';

function update() {
  const a = inputA.valueAsNumber;
  const b = inputB.valueAsNumber;

  resultEl.classList.remove('error');
  barWrap.hidden = true;

  if (Number.isNaN(a) || Number.isNaN(b)) {
    bigEl.textContent = '—';
    textEl.textContent = 'Enter both numbers to see the result.';
    return;
  }

  const r = modes[current].compute(a, b);

  if (r.error) {
    resultEl.classList.add('error');
    bigEl.textContent = '—';
    textEl.textContent = r.error;
    return;
  }

  bigEl.textContent = r.big;
  textEl.textContent = r.text;

  if (typeof r.bar === 'number') {
    barWrap.hidden = false;
    barFill.style.width = Math.max(0, Math.min(100, r.bar)) + '%';
  }
}

function setMode(mode) {
  current = mode;
  const m = modes[mode];

  tabs.forEach((t) => {
    const active = t.dataset.mode === mode;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', active);
  });

  labelA.textContent = m.labelA;
  labelB.textContent = m.labelB;
  inputA.placeholder = m.hintA;
  inputB.placeholder = m.hintB;

  inputA.value = '';
  inputB.value = '';
  update();
  inputA.focus();
}

tabs.forEach((t) => t.addEventListener('click', () => setMode(t.dataset.mode)));
inputA.addEventListener('input', update);
inputB.addEventListener('input', update);
clearBtn.addEventListener('click', () => {
  inputA.value = '';
  inputB.value = '';
  update();
  inputA.focus();
});

update();
