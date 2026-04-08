/**
 * DNS Universe – Networking Quiz Engine
 * Three zones: DNS Basics → Configuration → Troubleshooting
 * 5 questions per zone (15 total), multiple-choice, with fact hints.
 */
'use strict';

(function () {

  // ── Quiz data ──────────────────────────────────────────────────────────────
  const ZONES = [
    {
      id:    'basics',
      label: '📡 DNS Basics',
      step:  'step-basics',
      questions: [
        {
          text: 'What DNS record type maps a domain name to an IPv4 address?',
          options: ['A', 'AAAA', 'CNAME', 'MX'],
          answer: 0,
          fact: 'An A record (Address record) holds a 32-bit IPv4 address, e.g. 93.184.216.34.'
        },
        {
          text: 'Which DNS record type is used for IPv6 addresses?',
          options: ['A', 'AAAA', 'PTR', 'TXT'],
          answer: 1,
          fact: 'AAAA records store 128-bit IPv6 addresses, e.g. 2606:2800:220:1:248:1893:25c8:1946.'
        },
        {
          text: 'A CNAME record creates…',
          options: [
            'A mapping from a domain to an IPv4 address',
            'An alias pointing to another domain name',
            'Email routing information for a domain',
            'The list of authoritative nameservers'
          ],
          answer: 1,
          fact: 'CNAME (Canonical Name) lets you alias one hostname to another, e.g. www → example.com.'
        },
        {
          text: 'What does DNS stand for?',
          options: [
            'Digital Name Server',
            'Dynamic Name System',
            'Domain Name System',
            'Distributed Network Service'
          ],
          answer: 2,
          fact: 'DNS (Domain Name System) translates human-readable hostnames into IP addresses.'
        },
        {
          text: 'What is the standard port number used by DNS?',
          options: ['80', '443', '53', '8080'],
          answer: 2,
          fact: 'DNS operates on port 53 for both UDP (fast lookups) and TCP (zone transfers / large responses).'
        }
      ]
    },
    {
      id:    'config',
      label: '⚙️ Configuration',
      step:  'step-config',
      questions: [
        {
          text: 'What does TTL stand for in the context of DNS records?',
          options: ['Time To Live', 'Transfer To Link', 'Total Traffic Load', 'Type To Lookup'],
          answer: 0,
          fact: 'TTL (Time To Live) tells resolvers how long (in seconds) to cache a record before re-querying.'
        },
        {
          text: 'Which DNS record type stores mail server routing information?',
          options: ['A', 'TXT', 'MX', 'NS'],
          answer: 2,
          fact: 'MX (Mail Exchanger) records specify which servers accept email for a domain, along with a priority value.'
        },
        {
          text: 'Which record type identifies the authoritative nameservers for a domain?',
          options: ['SOA', 'NS', 'PTR', 'CAA'],
          answer: 1,
          fact: 'NS (Name Server) records list the servers that hold the authoritative DNS zone for a domain.'
        },
        {
          text: 'What does a PTR record provide?',
          options: [
            'Reverse DNS – maps an IP address back to a hostname',
            'Forward DNS – maps a hostname to an IP address',
            'A free-text field for domain verification',
            'Email server priority information'
          ],
          answer: 0,
          fact: 'PTR records enable reverse DNS lookups: given 93.184.216.34, find example.com.'
        },
        {
          text: 'What does SOA stand for in a DNS zone file?',
          options: ['Start of Authority', 'Server of Access', 'Source of Address', 'Secondary Origin Alias'],
          answer: 0,
          fact: 'The SOA (Start of Authority) record carries the primary nameserver, admin email, and serial/refresh timers for a zone.'
        }
      ]
    },
    {
      id:    'troubleshoot',
      label: '🔧 Troubleshooting',
      step:  'step-troubleshoot',
      questions: [
        {
          text: 'Which command-line tool is most commonly used to query DNS records?',
          options: ['ping', 'traceroute', 'dig', 'curl'],
          answer: 2,
          fact: 'dig (Domain Information Groper) sends DNS queries and displays detailed responses, ideal for troubleshooting.'
        },
        {
          text: 'DNS cache poisoning attacks work by…',
          options: [
            'Overloading DNS servers with traffic',
            'Inserting forged DNS records into a resolver\'s cache',
            'Blocking outbound DNS queries at the firewall',
            'Deleting all records in a DNS zone file'
          ],
          answer: 1,
          fact: 'Cache poisoning tricks a resolver into storing a bogus record, redirecting users to attacker-controlled servers.'
        },
        {
          text: 'What is DNSSEC?',
          options: [
            'A protocol that encrypts all DNS traffic',
            'Extensions that add cryptographic signatures to DNS records',
            'A new DNS record type for secure hostnames',
            'A firewall rule-set for blocking DNS floods'
          ],
          answer: 1,
          fact: 'DNSSEC (DNS Security Extensions) uses digital signatures to verify that DNS responses have not been tampered with.'
        },
        {
          text: 'If a website is unreachable, which DNS record would you check first to verify the correct IP is published?',
          options: ['MX', 'NS', 'A', 'TXT'],
          answer: 2,
          fact: 'The A record (or AAAA for IPv6) maps the hostname to an IP; an incorrect value is the most common DNS misconfiguration.'
        },
        {
          text: 'What is a recursive DNS resolver?',
          options: [
            'A nameserver that only answers queries for its own zone',
            'A server that queries other DNS servers on behalf of a client',
            'A nameserver that never caches responses',
            'A DNS server dedicated solely to IPv6 lookups'
          ],
          answer: 1,
          fact: 'Recursive resolvers (e.g. 8.8.8.8) do the legwork of following referrals from root → TLD → authoritative servers and returning the final answer to the client.'
        }
      ]
    }
  ];

  const TOTAL_QUESTIONS = ZONES.reduce((n, z) => n + z.questions.length, 0);

  // ── State ─────────────────────────────────────────────────────────────────
  let zoneIndex    = 0;   // 0–2
  let qIndex       = 0;   // 0–4 within current zone
  let answered     = false;
  let totalCorrect = 0;
  let zoneCorrect  = 0;
  let totalAnswered = 0;

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const barFill      = document.getElementById('bar-fill');
  const barLabel     = document.getElementById('bar-label');
  const glassCard    = document.getElementById('glass-card');
  const zoneComplete = document.getElementById('zone-complete');
  const allDone      = document.getElementById('all-done');

  const qZone        = document.getElementById('q-zone');
  const qNumber      = document.getElementById('q-number');
  const qText        = document.getElementById('q-text');
  const optionsEl    = document.getElementById('options');
  const feedbackEl   = document.getElementById('feedback');
  const factHintEl   = document.getElementById('fact-hint');
  const btnNext      = document.getElementById('btn-next');

  const zcTitle      = document.getElementById('zc-title');
  const zcScore      = document.getElementById('zc-score');
  const btnNextZone  = document.getElementById('btn-next-zone');

  const adScore      = document.getElementById('ad-score');
  const btnRestart   = document.getElementById('btn-restart');

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    zoneIndex     = 0;
    qIndex        = 0;
    answered      = false;
    totalCorrect  = 0;
    zoneCorrect   = 0;
    totalAnswered = 0;
    updateZoneNav();
    loadQuestion();
  }

  // ── Zone nav ──────────────────────────────────────────────────────────────
  function updateZoneNav() {
    ZONES.forEach((zone, i) => {
      const el = document.getElementById(zone.step);
      el.classList.remove('active', 'done');
      const statusEl = el.querySelector('.zs-status');
      if (i < zoneIndex) {
        el.classList.add('done');
        statusEl.textContent = 'Complete ✓';
      } else if (i === zoneIndex) {
        el.classList.add('active');
        statusEl.textContent = 'In Progress';
      } else {
        statusEl.textContent = 'Locked';
      }
    });
  }

  // ── Load a question ───────────────────────────────────────────────────────
  function loadQuestion() {
    answered = false;
    const zone = ZONES[zoneIndex];
    const q    = zone.questions[qIndex];

    // Update header meta
    qZone.textContent   = zone.label;
    qNumber.textContent = `Question ${qIndex + 1} of ${zone.questions.length}`;
    qText.textContent   = q.text;

    // Clear feedback / hint
    feedbackEl.textContent = '';
    feedbackEl.className   = 'feedback';
    factHintEl.textContent = '';

    // Hide next button
    btnNext.classList.remove('show');

    // Render options
    optionsEl.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className   = 'opt-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleAnswer(i));
      optionsEl.appendChild(btn);
    });

    // Progress bar
    updateProgress();

    // Ensure question card is visible
    glassCard.style.display    = '';
    zoneComplete.classList.remove('show');
    allDone.classList.remove('show');
  }

  // ── Handle answer ─────────────────────────────────────────────────────────
  function handleAnswer(chosen) {
    if (answered) return;
    answered = true;
    totalAnswered++;

    const q    = ZONES[zoneIndex].questions[qIndex];
    const btns = optionsEl.querySelectorAll('.opt-btn');

    btns.forEach(b => (b.disabled = true));
    btns[q.answer].classList.add('correct');

    if (chosen === q.answer) {
      totalCorrect++;
      zoneCorrect++;
      feedbackEl.textContent = '✓ Correct!';
      feedbackEl.className   = 'feedback correct-msg';
    } else {
      btns[chosen].classList.add('wrong');
      feedbackEl.textContent = `✗ Not quite — the answer is: ${q.options[q.answer]}`;
      feedbackEl.className   = 'feedback wrong-msg';
    }

    factHintEl.textContent = q.fact;
    btnNext.classList.add('show');
    updateProgress();
  }

  // ── Next button ───────────────────────────────────────────────────────────
  btnNext.addEventListener('click', () => {
    if (!answered) return;
    qIndex++;
    if (qIndex < ZONES[zoneIndex].questions.length) {
      loadQuestion();
    } else {
      showZoneComplete();
    }
  });

  // ── Zone complete ─────────────────────────────────────────────────────────
  function showZoneComplete() {
    glassCard.style.display = 'none';
    const zone = ZONES[zoneIndex];
    zcTitle.textContent = `${zone.label} Complete!`;
    zcScore.textContent = `${zoneCorrect} / ${zone.questions.length}`;

    if (zoneIndex < ZONES.length - 1) {
      zoneComplete.classList.add('show');
      allDone.classList.remove('show');
    } else {
      zoneComplete.classList.remove('show');
      adScore.textContent = `${totalCorrect} / ${TOTAL_QUESTIONS}`;
      allDone.classList.add('show');
      updateZoneNav();
    }
  }

  // ── Next zone button ──────────────────────────────────────────────────────
  btnNextZone.addEventListener('click', () => {
    zoneIndex++;
    qIndex      = 0;
    zoneCorrect = 0;
    updateZoneNav();
    loadQuestion();
  });

  // ── Restart ───────────────────────────────────────────────────────────────
  btnRestart.addEventListener('click', init);

  // ── Progress bar & label ──────────────────────────────────────────────────
  function updateProgress() {
    const completedInPriorZones = ZONES.slice(0, zoneIndex).reduce((n, z) => n + z.questions.length, 0);
    const answeredCount = completedInPriorZones + qIndex + (answered ? 1 : 0);
    const pct = Math.round((answeredCount / TOTAL_QUESTIONS) * 100);
    barFill.style.width    = pct + '%';
    barLabel.textContent   = `${answeredCount} / ${TOTAL_QUESTIONS} questions`;
  }

  // ── Start ─────────────────────────────────────────────────────────────────
  init();

}());
