const ROOM_ID     = "ysu7120_eye_match_2026";
const T_STATE     = `eye-match/${ROOM_ID}/state`;
const T_JOIN      = `eye-match/${ROOM_ID}/join`;
const T_FINISH    = `eye-match/${ROOM_ID}/finish`;

function makeDefaultState() {
  return { gameState: 'waiting', currentStage: 1, teams: window.GAME_DATA.makeDefaultTeams() };
}

const Store = {
  client: null,
  state: null,
  listeners: [],
  isTeacher: false,

  init(isTeacher) {
    this.isTeacher = isTeacher;
    this.state = makeDefaultState();

    this.client = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
      clientId: 'eye_' + Math.random().toString(16).substr(2, 8),
      clean: true
    });

    this.client.on('connect', () => {
      console.log('[MQTT] Connected');
      this.client.subscribe(T_STATE);
      if (isTeacher) {
        this.client.subscribe(T_JOIN);
        this.client.subscribe(T_FINISH);
        this.publish(); // 현재 상태를 retain으로 내보냄
      }
    });

    this.client.on('message', (topic, msg) => {
      const raw = msg.toString();
      if (topic === T_STATE) {
        try {
          this.state = JSON.parse(raw);
          this._notify();
        } catch(e) {}

      } else if (topic === T_JOIN && isTeacher) {
        const id = parseInt(raw);
        if (this.state.teams[id]) {
          this.state.teams[id].online = true;
          this.publish();
          this._notify();
        }

      } else if (topic === T_FINISH && isTeacher) {
        try {
          const { teamId, time } = JSON.parse(raw);
          const team = this.state.teams[teamId];
          if (!team || this.state.gameState !== 'playing') return;
          team.status            = 'finished';
          team.currentStageTime  = time;
          team.isTimeOver        = false;
          const s = this.state.currentStage;
          const idx = team.stages.findIndex(x => x.stage === s);
          const entry = { stage: s, time, isTimeOver: false };
          if (idx >= 0) team.stages[idx] = entry; else team.stages.push(entry);
          team.totalTime = team.stages.reduce((a, x) => a + x.time, 0);
          this.publish();
          this._notify();
        } catch(e) {}
      }
    });
  },

  get()   { return this.state; },

  publish() {
    if (this.client && this.client.connected) {
      this.client.publish(T_STATE, JSON.stringify(this.state), { retain: true });
    }
  },

  update(fn) { fn(this.state); this.publish(); this._notify(); },

  joinTeam(id) {
    if (this.client && this.client.connected)
      this.client.publish(T_JOIN, String(id));
  },

  finishStage(teamId, time) {
    if (this.client && this.client.connected)
      this.client.publish(T_FINISH, JSON.stringify({ teamId, time }));
  },

  listen(cb) { this.listeners.push(cb); },
  _notify()  { this.listeners.forEach(cb => cb(this.state)); }
};

window.STORE = Store;
