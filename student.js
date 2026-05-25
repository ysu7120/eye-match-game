window.StudentApp = {
  el: null, st: null,
  teamId: null,
  /* 게임판 */
  cards: [], selectedCards: [], matchedPairs: [],
  isLocked: false, time: 0, timerId: null,
  wrongMatch: [], rightMatch: [],
  hasFinished: false, lastStage: null,
  _rendering: false,

  init(el) {
    this.el = el;
    window.STORE.listen(s => { this.st = s; this._safeRender(); });
    this.st = window.STORE.get();
    this._safeRender();
  },

  _safeRender() {
    if (this._rendering) return;
    this._rendering = true;
    try { this.render(); } finally { this._rendering = false; }
  },

  render() {
    if (!this.teamId) { this._renderTeamSel(); return; }
    const s = this.st;
    if (!s) { this.el.innerHTML = '<div class="setup-container"><h1>연결 중...</h1></div>'; return; }

    const { gameState: gs, currentStage: cs, teams } = s;
    const myTeam = teams[this.teamId];

    if (gs === 'waiting') {
      this._stopTimer();
      this.hasFinished = false;
      this.el.innerHTML = `
        <div class="setup-container">
          <h1>접속 완료! ${this.teamId}모둠 대기 중...</h1>
          <p>선생님이 시작 버튼을 누를 때까지 잠시만 기다려주세요.</p>
          <p style="color:#6c5ce7;font-weight:700">다음 단계: ${cs}단계</p>
          <div style="font-size:3rem;margin-top:1rem">⏳</div>
        </div>`;
      return;
    }

    if (gs === 'ranking') {
      this._stopTimer();
      this._renderRanking(s);
      return;
    }

    /* playing */
    if (this.lastStage !== cs) {
      this.lastStage = cs;
      this._initBoard(cs);
    }
    if (this.hasFinished || myTeam?.status === 'finished') {
      this._stopTimer();
      this._renderFinished(myTeam, s);
      return;
    }
    this._renderBoard(cs);
  },

  /* ── 팀 선택 ── */
  _renderTeamSel() {
    let html = '<div class="setup-container"><h1>자신의 모둠을 선택하세요</h1><div class="team-grid">';
    for (let i = 1; i <= 8; i++)
      html += `<button class="team-button" onclick="SA.selectTeam(${i})">${i}모둠</button>`;
    html += '</div></div>';
    this.el.innerHTML = html;
  },
  selectTeam(id) { this.teamId = id; window.STORE.joinTeam(id); this._safeRender(); },

  /* ── 게임판 초기화 ── */
  _initBoard(stage) {
    this._stopTimer();
    this.cards = window.GAME_DATA.generateCards(stage);
    this.selectedCards = []; this.matchedPairs = [];
    this.isLocked = false; this.time = 0;
    this.wrongMatch = []; this.rightMatch = [];
    this.hasFinished = false;
    this._startTimer();
  },
  _startTimer() {
    this.timerId = setInterval(() => {
      this.time++;
      const el = document.getElementById('gtimer');
      if (el) el.textContent = this._fmt(this.time);
    }, 1000);
  },
  _stopTimer() { if (this.timerId) { clearInterval(this.timerId); this.timerId = null; } },
  _fmt(s) {
    return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');
  },

  /* ── 게임판 렌더 ── */
  _renderBoard(stage) {
    const total = stage===1?2:stage===2?3:stage===3?4:11;
    const cardsHtml = this.cards.map(c => {
      const sel  = this.selectedCards.some(x=>x.id===c.id);
      const mat  = this.matchedPairs.includes(c.pairId);
      const bad  = this.wrongMatch.includes(c.id);
      const good = this.rightMatch.includes(c.id);
      let cls = `card ${c.type}${sel?' active':''}${good?' success-anim':''}${mat?' matched':''}${bad?' wrong':''}`;
      const ov = (good||mat) ? '<div class="overlay overlay-o">O</div>'
               : bad         ? '<div class="overlay overlay-x">X</div>' : '';
      return `<div class="${cls}" onclick="SA.click('${c.id}')"><div class="card-content">${c.text}</div>${ov}</div>`;
    }).join('');

    this.el.innerHTML = `
      <div class="app-container landscape-mode">
        <header class="header">
          <h1>${stage}단계 진행 중</h1>
          <div class="stats">
            <div class="stat-item progress">찾은 짝: <span>${this.matchedPairs.length}/${total}</span></div>
            <div class="stat-item timer">⏱ <span id="gtimer">${this._fmt(this.time)}</span></div>
          </div>
        </header>
        <main class="board-container">
          <div class="grid stage-${stage}">${cardsHtml}</div>
        </main>
      </div>`;
  },

  /* ── 카드 클릭 ── */
  click(cardId) {
    if (this.isLocked) return;
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return;
    if (this.selectedCards.some(c => c.id === cardId)) return;
    if (this.matchedPairs.includes(card.pairId)) return;

    this.selectedCards = [...this.selectedCards, card];

    if (this.selectedCards.length === 2) {
      this.isLocked = true;
      const [c1, c2] = this.selectedCards;
      if (c1.pairId === c2.pairId && c1.type !== c2.type) {
        this.rightMatch = [c1.id, c2.id];
        this._renderBoard(this.st.currentStage);
        setTimeout(() => {
          this.matchedPairs = [...this.matchedPairs, c1.pairId];
          this.selectedCards = []; this.rightMatch = []; this.isLocked = false;
          const stage = this.st.currentStage;
          const total = stage===1?2:stage===2?3:stage===3?4:11;
          if (this.matchedPairs.length === total) {
            this.hasFinished = true;
            this._stopTimer();
            window.STORE.finishStage(this.teamId, this.time);
          }
          this._renderBoard(stage);
        }, 800);
      } else {
        this.wrongMatch = [c1.id, c2.id];
        this._renderBoard(this.st.currentStage);
        setTimeout(() => {
          this.selectedCards = []; this.wrongMatch = []; this.isLocked = false;
          this._renderBoard(this.st.currentStage);
        }, 1000);
      }
    } else {
      this._renderBoard(this.st.currentStage);
    }
  },

  /* ── 완료 화면 ── */
  _renderFinished(myTeam, s) {
    if (!myTeam) return;
    const { teams, currentStage: cs } = s;
    const tList = Object.values(teams);
    let rankHtml = '';
    if (!myTeam.isTimeOver) {
      const times = [...new Set(tList.filter(t=>t.status==='finished'&&!t.isTimeOver).map(t=>t.currentStageTime))].sort((a,b)=>a-b);
      const rank = times.indexOf(myTeam.currentStageTime) + 1;
      rankHtml = rank<=3
        ? `<h2 style="color:#f59e0b;font-size:3rem;margin:1rem 0">🏆 ${rank}등! 🏆</h2>`
        : `<h2 style="font-size:2rem;margin:1rem 0">${rank}등</h2>`;
    }
    this.el.innerHTML = `
      <div class="setup-container">
        <h1>${cs}단계 완료!</h1>
        ${rankHtml}
        <p>기록: ${myTeam.isTimeOver ? 'TIME OVER' : myTeam.currentStageTime+'초'}</p>
        <p style="color:#64748b;margin-top:1rem">다른 모둠이 완료할 때까지 대기해주세요.</p>
      </div>`;
  },

  /* ── 순위 화면 ── */
  _renderRanking(s) {
    const sorted = Object.values(s.teams)
      .filter(t => t.online)
      .sort((a, b) => a.totalTime - b.totalTime);
    const rows = sorted.map((t, i) => `
      <div class="ranking-item ${t.id === this.teamId ? 'my-team' : ''}">
        <span class="rank">${i+1}위</span>
        <span class="name">${t.name}</span>
        <span class="time">${t.totalTime >= 999 ? 'TIME OVER' : t.totalTime+'초'}</span>
      </div>`).join('');
    this.el.innerHTML = `
      <div class="setup-container ranking-container">
        <h1>🏆 순위 결과 🏆</h1>
        <div class="ranking-list">${rows}</div>
      </div>`;
  }
};

window.SA = window.StudentApp;
