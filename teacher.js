window.TeacherApp = {
  el: null,
  st: null,

  init(el) {
    this.el = el;
    window.STORE.listen(s => { this.st = s; this.render(); });
    this.st = window.STORE.get();
    this.render();
  },

  render() {
    const s = this.st;
    if (!s) { this.el.innerHTML = '<div class="setup-container"><h1>연결 중...</h1></div>'; return; }

    // 순위 화면 (교사/학생 공통)
    if (s.gameState === 'ranking') {
      this._renderRanking(s);
      return;
    }

    const { gameState: gs, currentStage: cs, teams } = s;
    const tList = Object.values(teams);
    const online = tList.filter(t => t.online);
    const allDone = online.length > 0 && online.every(t => t.status === 'finished');

    /* ── 팀 카드 ── */
    const teamCards = tList.map(t => {
      let statusHtml, rankHtml = '';
      if (!t.online) {
        statusHtml = '<span style="color:#94a3b8">미접속</span>';
      } else if (t.status === 'waiting') {
        statusHtml = '<span style="color:#10b981;font-weight:700">대기 중 ✅</span>';
      } else if (t.status === 'playing') {
        statusHtml = '<span style="color:#2563eb;font-weight:700">진행 중 🎮</span>';
      } else {
        if (t.isTimeOver) {
          statusHtml = '<strong style="color:#dc2626;font-size:1.1em">시간 초과</strong>';
        } else {
          statusHtml = '<strong style="color:#16a34a;font-size:1.1em">완료 ✔</strong>';
          const times = [...new Set(tList.filter(x => x.status==='finished'&&!x.isTimeOver).map(x=>x.currentStageTime))].sort((a,b)=>a-b);
          const rank  = times.indexOf(t.currentStageTime) + 1;
          rankHtml = rank<=3 ? `<span style="color:#f59e0b;font-weight:700"> 🏆${rank}등!</span>`
                              : `<span style="color:#64748b;font-size:.9em"> (${rank}등)</span>`;
        }
      }
      const timeRow = t.status === 'finished'
        ? `<p>기록: ${t.isTimeOver ? `TIME OVER (${t.currentStageTime}초)` : `${t.currentStageTime}초`}</p>` : '';
      return `<div class="team-card status-${t.status}">
        <h2>${t.name}${rankHtml}</h2>
        <p>상태: ${statusHtml}</p>${timeRow}
        <p>누적: ${t.totalTime}초</p>
      </div>`;
    }).join('');

    /* ── 버튼 ── */
    const dis = (b) => b ? 'disabled' : '';
    const rankingBtn = cs === 4
      ? `<button class="start-btn" ${dis(!allDone || gs==='ranking')} onclick="TA.showRanking()">최종 순위 보기</button>`
      : `<button ${dis(!allDone)} onclick="TA.nextStage()">다음 단계로 (${cs+1}단계) →</button>`;

    const endOrBack = gs === 'ranking'
      ? `<button class="start-btn" onclick="TA.backToGame()">게임 화면으로</button>`
      : `<button class="end-btn" ${dis(gs!=='playing')} onclick="TA.endStage()">이 단계 종료</button>`;

    this.el.innerHTML = `
    <div class="teacher-dashboard">
      <header class="teacher-header">
        <h1>교사용 대시보드</h1>
        <div class="status-badge">
          ${cs}단계 | ${gs==='playing'?'진행 중':gs==='waiting'?'대기 중':'순위 확인 중'}
        </div>
      </header>
      <div class="control-panel">
        <button ${dis(cs===1)} onclick="TA.prevStage()">← 이전 단계 (${cs-1}단계)</button>
        <button class="start-btn" ${dis(gs==='playing'||gs==='ranking')} onclick="TA.startStage()">▶ 게임 시작</button>
        ${rankingBtn}
        ${endOrBack}
        <button class="reset-btn" onclick="TA.reset()" style="margin-left:auto">초기화 🔄</button>
      </div>
      <div class="team-status-grid">${teamCards}</div>
    </div>`;
  },

  startStage() {
    window.STORE.update(s => {
      s.gameState = 'playing';
      Object.values(s.teams).forEach(t => {
        if (t.online) { t.status='playing'; t.currentStageTime=null; t.isTimeOver=false; }
      });
    });
  },
  nextStage() {
    window.STORE.update(s => {
      if (s.currentStage < 4) {
        s.currentStage++; s.gameState='waiting';
        Object.values(s.teams).forEach(t => { if(t.online){t.status='waiting';t.currentStageTime=null;} });
      }
    });
  },
  prevStage() {
    window.STORE.update(s => {
      if (s.currentStage > 1) {
        s.currentStage--; s.gameState='waiting';
        Object.values(s.teams).forEach(t => { if(t.online){t.status='waiting';t.currentStageTime=null;} });
      }
    });
  },
  endStage() {
    window.STORE.update(s => {
      let maxT = 0;
      Object.values(s.teams).forEach(t => { if(t.status==='finished'&&!t.isTimeOver&&t.currentStageTime>maxT) maxT=t.currentStageTime; });
      const pen = maxT + 5;
      Object.values(s.teams).forEach(t => {
        if (t.online && t.status !== 'finished') {
          t.status='finished'; t.currentStageTime=pen; t.isTimeOver=true;
          const idx = t.stages.findIndex(x=>x.stage===s.currentStage);
          const e = { stage:s.currentStage, time:pen, isTimeOver:true };
          if (idx>=0) t.stages[idx]=e; else t.stages.push(e);
        }
        t.totalTime = t.stages.reduce((a,x)=>a+x.time,0);
      });
    });
  },
  showRanking() {
    window.STORE.update(s => {
      s.gameState = 'ranking';
      Object.values(s.teams).forEach(t => { t.totalTime=t.stages.reduce((a,x)=>a+x.time,0); });
    });
  },
  backToGame() { window.STORE.update(s => { s.gameState='waiting'; }); },
  reset() {
    if (!confirm('게임을 전체 초기화합니까?')) return;
    window.STORE.update(s => {
      s.gameState='waiting'; s.currentStage=1;
      s.teams = window.GAME_DATA.makeDefaultTeams();
    });
  },
  _renderRanking(s) {


    const sorted = Object.values(s.teams)
      .filter(t => t.online)
      .sort((a, b) => a.totalTime - b.totalTime);

    const medal = ['🥇','🥈','🥉'];
    const rows = sorted.map((t, i) => {
      const isTop = i < 3;
      return `
        <div class="ranking-item" style="${isTop ? 'border:2px solid #f59e0b;' : ''}">
          <span class="rank" style="font-size:${isTop?'2rem':'1.4rem'}">${medal[i] || (i+1)+'위'}</span>
          <span class="name" style="font-size:1.3rem;font-weight:700">${t.name}</span>
          <span class="time" style="color:#3b82f6;font-weight:700">${t.totalTime >= 999 ? 'TIME OVER' : t.totalTime+'초'}</span>
        </div>`;
    }).join('');

    this.el.innerHTML = `
      <div class="setup-container ranking-container" style="background:linear-gradient(135deg,#f0f4ff,#e8edf5);min-height:100vh;padding:2rem;">
        <h1 style="font-size:2.5rem;margin-bottom:0.5rem">🏆 최종 순위 🏆</h1>
        <p style="color:#64748b;margin-bottom:2rem">학생들 화면에도 동일한 순위가 표시됩니다.</p>
        <div class="ranking-list">${rows}</div>
        <button class="start-btn" style="margin-top:2.5rem;font-size:1.1rem;padding:0.8rem 2.5rem" onclick="TA.backToGame()">← 대시보드로 돌아가기</button>
      </div>`;
  }
};

// 짧은 별칭
window.TA = window.TeacherApp;
