
const chat = document.getElementById("chat");
const inputArea = document.getElementById("inputArea");

let answers = [];
let step = 0;
let questionSet = [];
let userTags = [];
let mustHaveTags = [];
let videoData = [];

const firstQuestion = {
  q: "① インナーガレージは必要？",
  options: ["必要", "不要"],
  responses: {
    "必要": "いいね！車が好きなんですね！自分も車大好きだからわかるわ♪",
    "不要": "なるほど、コンパクト重視派ってことね！それも素敵な選択♪"
  }
};

// 質問セット（省略せず全て入れる：ガレージあり10問、なし11問）
const withGarageQuestions = [
  { q: "建坪（大きさ）は？", options: ["10坪以下", "10～15坪", "15～20坪", "20坪以上"] },
  { q: "ロフトの有無は？", options: ["あったほうが良い", "なくても良い"] },
  { q: "ロフトの申請タイプは？", options: ["平屋申請", "2階建て申請"] },
  { q: "何人暮らし？", options: ["ひとり暮らし", "ふたり暮らし", "3人暮らし"] },
  { q: "カバードポーチ希望？", options: ["希望する", "希望しない"] },
  { q: "予算は？", options: ["1000万円以下", "1500万円以下", "2000万円以下", "特に決まっていない"] },
  { q: "性別は？", options: ["女性", "男性"] },
  { q: "居住用？セカンドハウス？", options: ["居住用", "セカンドハウス"] },
  { q: "ガレージはシャッター付？オープン派？", options: ["シャッター付", "オープン派"] },
  { q: "愛車を眺めたい？車庫として使いたい？", options: ["眺めたい", "車庫として使いたい"] }
];

const withoutGarageQuestions = [
  { q: "建坪（大きさ）は？", options: ["10坪以下", "10～15坪", "15～20坪", "20坪以上"] },
  { q: "ひとり暮らし？ふたり暮らし？", options: ["ひとり暮らし", "ふたり暮らし"] },
  { q: "老後を意識している？", options: ["はい", "いいえ"] },
  { q: "予算は？", options: ["1000万円以下", "1500万円以下", "2000万円以下", "特に決まっていない"] },
  { q: "ロフト希望？", options: ["あったほうが良い", "なくても良い"] },
  { q: "平屋申請 or 2階建て？", options: ["平屋申請", "2階建て申請"] },
  { q: "外観デザインは？", options: ["切妻屋根", "片流れ屋根", "寄棟屋根", "特にこだわりなし"] },
  { q: "カバードポーチ希望？", options: ["希望する", "希望しない"] },
  { q: "性別は？", options: ["女性", "男性"] },
  { q: "ペットはいますか？", options: ["いる", "いない"] },
  { q: "優先する生活動線は？", options: ["家事動線", "玄関からの動線", "水回りの位置"] }
];

function showBotMessage(text) {
  const wrapper = document.createElement("div");
  wrapper.className = "bot-wrapper";
  const avatar = document.createElement("img");
  avatar.src = "https://via.placeholder.com/70";
  avatar.className = "bot-avatar";
  const bubble = document.createElement("div");
  bubble.className = "bot";
  bubble.innerText = text;
  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}

function showUserMessage(text) {
  const div = document.createElement("div");
  div.className = "user";
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function showOptions(options, responses = null) {
  inputArea.innerHTML = "";
  options.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "option-button";
    btn.innerText = option;
    btn.onclick = () => handleAnswer(option, responses);
    inputArea.appendChild(btn);
  });
}

function handleAnswer(answer, responses = null) {
  showUserMessage(answer);
  if (responses && responses[answer]) {
    setTimeout(() => showBotMessage(responses[answer]), 400);
  }

  answers.push(answer);
  step++;

  if (step < questionSet.length) {
    setTimeout(() => {
      showBotMessage(questionSet[step].q);
      showOptions(questionSet[step].options);
    }, 700);
  } else {
    setTimeout(() => {
      showBotMessage("じゃあ、アナタにぴったりな間取りを見つけてくるね！");
      recommendVideos();
    }, 800);
  }
}

function convertAnswersToTags() {
  const map = {
    // 共通
    "10坪以下": "#10坪以下", "10～15坪": "#10～15坪", "15～20坪": "#15～20坪", "20坪以上": "#20坪以上",
    "ひとり暮らし": "#ひとり暮らし", "ふたり暮らし": "#ふたり暮らし", "3人暮らし": "#3人暮らし",
    "あったほうが良い": "#ロフト", "なくても良い": "#ロフトなし",
    "平屋申請": "#ロフト平屋申請", "2階建て申請": "#ロフト2階建て申請",
    "希望する": "#カバードポーチ", "希望しない": "#カバードポーチなし",
    "女性": "#女性向け", "男性": "#男性向け",
    "1000万円以下": "#1000万円以下", "1500万円以下": "#1500万円以下", "2000万円以下": "#2000万円以下",
    "居住用": "#居住用", "セカンドハウス": "#セカンドハウス",
    "シャッター付": "#ガレージシャッター", "オープン派": "#ガレージオープン",
    "眺めたい": "#ガレージから眺める", "車庫として使いたい": "#ガレージ実用派",
    "はい": "#老後重視", "いいえ": "#若年層重視",
    "切妻屋根": "#切妻屋根", "片流れ屋根": "#片流れ屋根", "寄棟屋根": "#寄棟屋根",
    "いる": "#ペットあり", "いない": "#ペットなし",
    "家事動線": "#家事動線", "玄関からの動線": "#玄関動線", "水回りの位置": "#水回り重視"
  };
  return answers.map(ans => map[ans]).filter(Boolean);
}

function recommendVideos() {
  inputArea.innerHTML = "";
  userTags = convertAnswersToTags();
  const filtered = videoData
    .map(video => {
      const match = video.tags.filter(tag => userTags.includes(tag)).length;
      const mustHave = mustHaveTags.every(tag => video.tags.includes(tag));
      return { ...video, score: mustHave ? match : -1 };
    })
    .filter(v => v.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  filtered.forEach(video => {
    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = `
      <iframe src="https://www.youtube.com/embed/${video.url.split("v=")[1]}" frameborder="0" allowfullscreen></iframe>
      <p><a href="${video.url}" target="_blank">${video.title}</a></p>
    `;
    chat.appendChild(card);
    chat.scrollTop = chat.scrollHeight;
  });
}

fetch("video_tag_data.json")
  .then(res => res.json())
  .then(data => {
    videoData = data;
    showBotMessage("はい！S-CRAFTのAIニイハラです！今日はアナタにぴったりな間取りを探していくよ！");
    setTimeout(() => {
      showBotMessage(firstQuestion.q);
      showOptions(firstQuestion.options, firstQuestion.responses);
    }, 800);
  });

function handleFirstAnswer(answer) {
  showUserMessage(answer);
  showBotMessage(firstQuestion.responses[answer]);
  answers.push(answer);
  mustHaveTags = answer === "必要" ? ["#インナーガレージ"] : [];
  questionSet = answer === "必要" ? withGarageQuestions : withoutGarageQuestions;
  step = 0;
  setTimeout(() => {
    showBotMessage(questionSet[0].q);
    showOptions(questionSet[0].options);
  }, 800);
}
