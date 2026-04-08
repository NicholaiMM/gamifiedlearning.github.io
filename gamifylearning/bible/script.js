/**
 * Bible Journey – Progress-bar Quiz Engine
 * Books: Genesis · Exodus · Gospels (Matthew/John)
 */
'use strict';

(function () {

  // ── Quiz data ──────────────────────────────────────────
  const BOOKS = [
    {
      id: 'genesis',
      label: 'Genesis',
      icon: '🌱',
      intro: 'In the beginning…',
      questions: [
        {
          q: 'How many days did God take to create the world?',
          opts: ['5', '6', '7', '8'],
          answer: 1,
          verse: '"By the seventh day God had finished the work He had been doing; so on the seventh day He rested." — Genesis 2:2'
        },
        {
          q: 'What was the name of the garden where Adam and Eve lived?',
          opts: ['Garden of Gethsemane', 'Garden of Eden', 'Garden of Nod', 'Garden of Sinai'],
          answer: 1,
          verse: '"The LORD God planted a garden in the east, in Eden…" — Genesis 2:8'
        },
        {
          q: 'How many sons did Jacob have?',
          opts: ['10', '11', '12', '13'],
          answer: 2,
          verse: '"Jacob had twelve sons…" — Genesis 35:22'
        },
        {
          q: 'What did Joseph\'s brothers sell him for?',
          opts: ['20 pieces of silver', '30 pieces of silver', '50 pieces of gold', '10 talents'],
          answer: 0,
          verse: '"So when the Midianite merchants came by, his brothers pulled Joseph up out of the cistern and sold him to the Ishmaelites for twenty shekels of silver." — Genesis 37:28'
        },
        {
          q: 'Who built the ark at God\'s command?',
          opts: ['Abraham', 'Moses', 'Noah', 'Enoch'],
          answer: 2,
          verse: '"So make yourself an ark of cypress wood…" — Genesis 6:14'
        },
      ]
    },
    {
      id: 'exodus',
      label: 'Exodus',
      icon: '🔥',
      intro: 'Let my people go…',
      questions: [
        {
          q: 'How many plagues did God send upon Egypt?',
          opts: ['7', '8', '10', '12'],
          answer: 2,
          verse: '"So Moses and Aaron did all these wonders before Pharaoh…" — Exodus 11:10 (ten plagues total)'
        },
        {
          q: 'What appeared to Moses in the burning bush?',
          opts: ['An angel of the Lord', 'God Himself', 'A prophet', 'A pillar of fire'],
          answer: 0,
          verse: '"There the angel of the LORD appeared to him in flames of fire from within a bush." — Exodus 3:2'
        },
        {
          q: 'How long did the Israelites wander in the desert?',
          opts: ['20 years', '30 years', '40 years', '50 years'],
          answer: 2,
          verse: '"Your children will be shepherds here for forty years…" — Numbers 14:33'
        },
        {
          q: 'On what mountain did God give Moses the Ten Commandments?',
          opts: ['Mount Zion', 'Mount Carmel', 'Mount Sinai', 'Mount Horeb'],
          answer: 2,
          verse: '"The LORD said to Moses, \'Come up to me on the mountain and stay here, and I will give you the tablets of stone with the law and commandments.\'" — Exodus 24:12'
        },
        {
          q: 'What food did God provide in the wilderness?',
          opts: ['Bread and Fish', 'Manna and Quail', 'Milk and Honey', 'Figs and Dates'],
          answer: 1,
          verse: '"That evening quail came and covered the camp, and in the morning there was a layer of dew around the camp." — Exodus 16:13'
        },
      ]
    },
    {
      id: 'gospels',
      label: 'Gospels',
      icon: '✝️',
      intro: 'The Good News of Jesus Christ…',
      questions: [
        {
          q: 'In which city was Jesus born?',
          opts: ['Jerusalem', 'Nazareth', 'Bethlehem', 'Capernaum'],
          answer: 2,
          verse: '"But you, Bethlehem Ephrathah… out of you will come for me one who will be ruler over Israel…" — Micah 5:2 (fulfilled in Matthew 2:1)'
        },
        {
          q: 'Who baptised Jesus in the Jordan River?',
          opts: ['Peter', 'John the Baptist', 'Andrew', 'Elijah'],
          answer: 1,
          verse: '"Then Jesus came from Galilee to the Jordan to be baptised by John." — Matthew 3:13'
        },
        {
          q: 'How many disciples did Jesus call?',
          opts: ['10', '11', '12', '70'],
          answer: 2,
          verse: '"He called his twelve disciples to him and gave them authority…" — Matthew 10:1'
        },
        {
          q: 'What did Jesus turn water into at the wedding at Cana?',
          opts: ['Olive oil', 'Milk', 'Wine', 'Honey'],
          answer: 2,
          verse: '"What Jesus did here in Cana of Galilee was the first of the signs through which he revealed his glory…" — John 2:11'
        },
        {
          q: 'On which day did Jesus rise from the dead?',
          opts: ['The first day', 'The third day', 'The seventh day', 'The fortieth day'],
          answer: 1,
          verse: '"He is not here; he has risen, just as he said." — Matthew 28:6'
        },
      ]
    },
  ];

  // ── State ─────────────────────────────────────────────
  let bookIdx   = 0;
  let qIdx      = 0;
  let answered  = false;
  let correct   = 0;
  let totalQ    = 0;

  // ── DOM refs ──────────────────────────────────────────
  const quizWrap      = document.getElementById('quiz-wrap');
  const glassEl       = document.getElementById('glass-card');
  const qBook         = document.getElementById('q-book');
  const qNumber       = document.getElementById('q-number');
  const qText         = document.getElementById('q-text');
  const optionsEl     = document.getElementById('options');
  const feedbackEl    = document.getElementById('feedback');
  const verseEl       = document.getElementById('verse-hint');
  const btnNext       = document.getElementById('btn-next');
  const bookComplete  = document.getElementById('book-complete');
  const bcTitle       = document.getElementById('bc-title');
  const bcScore       = document.getElementById('bc-score');
  const btnNextBook   = document.getElementById('btn-next-book');
  const allDone       = document.getElementById('all-done');
  const btnRestart    = document.getElementById('btn-restart');
  const barFill       = document.getElementById('bar-fill');
  const barLabel      = document.getElementById('bar-label');

  // ── Journey nav ───────────────────────────────────────
  function updateJourneyNav() {
    BOOKS.forEach((book, i) => {
      const stepEl = document.getElementById('step-' + book.id);
      if (!stepEl) return;
      stepEl.className = 'journey-step';
      const statusEl = stepEl.querySelector('.js-status');
      if (i < bookIdx) {
        stepEl.classList.add('done');
        if (statusEl) statusEl.textContent = '✓ Complete';
      } else if (i === bookIdx) {
        stepEl.classList.add('active');
        if (statusEl) statusEl.textContent = 'In Progress';
      } else {
        if (statusEl) statusEl.textContent = 'Locked';
      }
    });
  }

  // ── Progress bar ─────────────────────────────────────
  function updateBar() {
    const total   = BOOKS.reduce((s, b) => s + b.questions.length, 0);
    const done    = totalQ;
    const pct     = Math.round((done / total) * 100);
    barFill.style.width = pct + '%';
    barLabel.textContent = `${done} / ${total} questions`;
  }

  // ── Render question ───────────────────────────────────
  function renderQuestion() {
    const book = BOOKS[bookIdx];
    const q    = book.questions[qIdx];

    answered = false;
    qBook.textContent   = `📖 ${book.label}`;
    qNumber.textContent = `Question ${qIdx + 1} of ${book.questions.length}`;
    qText.textContent   = q.q;

    optionsEl.innerHTML = '';
    q.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className   = 'opt-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => onAnswer(i));
      optionsEl.appendChild(btn);
    });

    feedbackEl.className = 'feedback';
    feedbackEl.textContent = '';
    verseEl.className    = 'verse-hint';
    verseEl.innerHTML    = '';
    btnNext.classList.remove('show');

    // Swap card in
    glassEl.style.animation = 'none';
    void glassEl.offsetWidth; // reflow
    glassEl.style.animation = '';
  }

  // ── Answer handler ────────────────────────────────────
  function onAnswer(idx) {
    if (answered) return;
    answered = true;
    totalQ++;
    updateBar();

    const book = BOOKS[bookIdx];
    const q    = book.questions[qIdx];
    const btns = optionsEl.querySelectorAll('.opt-btn');

    btns.forEach(btn => (btn.disabled = true));

    if (idx === q.answer) {
      correct++;
      btns[idx].classList.add('correct');
      feedbackEl.textContent = '✓ Correct!';
      feedbackEl.className   = 'feedback correct show';
    } else {
      btns[idx].classList.add('wrong');
      btns[q.answer].classList.add('correct');
      feedbackEl.textContent = '✗ Not quite — see the verse below.';
      feedbackEl.className   = 'feedback wrong show';
    }

    // Show verse
    verseEl.innerHTML = `"${q.verse}"`;
    verseEl.className = 'verse-hint show';

    btnNext.classList.add('show');
  }

  // ── Next question ─────────────────────────────────────
  btnNext.addEventListener('click', () => {
    qIdx++;
    const book = BOOKS[bookIdx];
    if (qIdx < book.questions.length) {
      renderQuestion();
    } else {
      showBookComplete();
    }
  });

  // ── Book complete ─────────────────────────────────────
  function showBookComplete() {
    glassEl.style.display   = 'none';
    bookComplete.classList.add('show');

    const book  = BOOKS[bookIdx];

    bcTitle.textContent = `📖 ${book.label} Complete!`;
    bcScore.textContent = `${correct} / ${totalQ} correct overall`;

    const isLast = bookIdx >= BOOKS.length - 1;
    btnNextBook.textContent = isLast ? '🏁 Finish Journey' : `Next: ${BOOKS[bookIdx + 1].label} →`;
    updateJourneyNav();
  }

  // ── Next book ─────────────────────────────────────────
  btnNextBook.addEventListener('click', () => {
    bookIdx++;
    qIdx = 0;
    bookComplete.classList.remove('show');

    if (bookIdx >= BOOKS.length) {
      glassEl.style.display = 'none';
      allDone.classList.add('show');
      document.getElementById('ad-score').textContent = `${correct} / ${totalQ}`;
      updateJourneyNav();
    } else {
      glassEl.style.display = '';
      updateJourneyNav();
      renderQuestion();
    }
  });

  // ── Restart ───────────────────────────────────────────
  btnRestart.addEventListener('click', () => {
    bookIdx  = 0;
    qIdx     = 0;
    answered = false;
    correct  = 0;
    totalQ   = 0;
    allDone.classList.remove('show');
    bookComplete.classList.remove('show');
    glassEl.style.display = '';
    updateJourneyNav();
    updateBar();
    renderQuestion();
  });

  // ── Boot ──────────────────────────────────────────────
  updateJourneyNav();
  updateBar();
  renderQuestion();

}());
