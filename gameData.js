const EYE_DATA = [
  { pairId: 1,  name: '공막',     desc: '눈의 가장 바깥을 싸고 있는 막으로, 흰자위에 해당한다.' },
  { pairId: 2,  name: '맥락막',   desc: '검은색 색소가 있어 눈 속을 어둡게 한다.' },
  { pairId: 3,  name: '유리체',   desc: '눈 속을 채우고 있는 투명한 물질로 눈의 형태를 유지한다.' },
  { pairId: 4,  name: '시각 신경', desc: '시각 세포의 자극을 뇌로 전달한다.' },
  { pairId: 5,  name: '망막',     desc: '상이 맺히는 곳으로, 시각 세포가 있다.' },
  { pairId: 6,  name: '맹점',     desc: '시각 신경이 모여 나가는 부분으로, 시각 세포가 없어 상이 맺히더라도 볼 수 없다.' },
  { pairId: 7,  name: '섬모체',   desc: '수정체의 두께를 조절한다.' },
  { pairId: 8,  name: '수정체',   desc: '볼록 렌즈와 같이 빛을 굴절시켜 망막에 상이 맺히게 한다.' },
  { pairId: 9,  name: '동공',     desc: '눈 안쪽으로 빛이 들어가는 구멍이다.' },
  { pairId: 10, name: '홍채',     desc: '눈으로 들어오는 빛의 양을 조절한다.' },
  { pairId: 11, name: '각막',     desc: '홍채의 바깥을 싸는 투명한 막이다.' }
];

function generateCards(stage) {
  const count = stage === 1 ? 2 : stage === 2 ? 3 : stage === 3 ? 4 : 11;
  const shuffled = [...EYE_DATA].sort(() => Math.random() - 0.5).slice(0, count);
  const cards = [];
  shuffled.forEach(item => {
    cards.push({ id: `name-${item.pairId}`, pairId: item.pairId, type: 'name',        text: item.name });
    cards.push({ id: `desc-${item.pairId}`, pairId: item.pairId, type: 'description', text: item.desc });
  });
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function makeDefaultTeams() {
  const t = {};
  for (let i = 1; i <= 8; i++) {
    t[i] = { id: i, name: `${i}모둠`, online: false, status: 'waiting',
              currentStageTime: null, isTimeOver: false, totalTime: 0, stages: [] };
  }
  return t;
}

window.GAME_DATA = { EYE_DATA, generateCards, makeDefaultTeams };
