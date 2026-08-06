import {
  db,
  doc,
  setDoc,
  onSnapshot
} from "./firebase.js";

const items = [
  { id: "greeting", text: "挨拶をする" },
  { id: "haccp_phone", text: "携帯でHACCPをする" },
  { id: "haccp_paper", text: "HACCPの紙を書く" },

  {
    id: "order",
    text: "パン、プリンの発注をする（ホワイトボードを確認！）"
  },

  {
    id: "graham_banana",
    text: "明日の分のグラハム、バナナケーキを出す"
  },

  {
    id: "butter",
    text: "明日の分のバターを出す"
  },

  {
    id: "cart1",
    text: "1台目カートを抜けがないように組む"
  },

  // 忘れやすいもの
  {
    id: "orange",
    text: "オレンジジュース",
    warning: true
  },
  {
    id: "pink_grapefruit",
    text: "ピングレジュース",
    warning: true
  },
  {
    id: "chantilly",
    text: "シャンティー",
    warning: true
  },
  {
    id: "berry_sauce",
    text: "ベリーソース",
    warning: true
  },
  {
    id: "ham_plate",
    text: "ハム盛り",
    warning: true
  },

  {
    id: "washoku_handover",
    text: "和食の引き継ぎをする"
  },

  {
    id: "cake_down",
    text: "下ろす時にケーキもおろす"
  },

  {
    id: "japa_washi",
    text: "ジャパのお盆に和紙をしく"
  },

  {
    id: "cereal",
    text: "シリアルの補充をする"
  },

  {
    id: "jam",
    text: "ジャムの補充をする"
  },

  {
    id: "yogurt",
    text: "ヨーグルトの補充をする"
  },

  {
    id: "ham_salmon",
    text: "ハム、サーモンを盛る"
  },

  {
    id: "room_change",
    text: "日によってルームの入れ替えをする"
  },

  {
    id: "misoshiru_bowl",
    text: "味噌汁椀を数を見て組む"
  },

  {
    id: "washoku_count",
    text: "和食を数を見て組む"
  },

  {
    id: "leaf",
    text: "明日のミックスリーフ、ロメインを補充する"
  },

  {
    id: "blueberry_apple",
    text: "ブルーベリー、リンゴを補充する"
  },

  {
    id: "wrap_check",
    text: "フルーツ、和食などのラップが綺麗にされているか確認"
  },

  {
    id: "juice_amount",
    text: "ジュースの量を確認する"
  },

  {
    id: "salad",
    text: "サラダ（きゅうり、赤玉など）を補充する"
  },

  {
    id: "frozen_plate",
    text: "皿盛りで使った分を冷凍から出して補充する"
  },

  {
    id: "v_mine",
    text: "Vミネを忘れずに補充する",
    warning: true
  },

  {
    id: "plant_egg",
    text: "プラントエッグを忘れずに補充する",
    warning: true
  },

  {
    id: "dishes_cart",
    text: "洗われた食器をカートになおす"
  },

  {
    id: "final_check",
    text: "足りないものはないか最終確認",
    final: true
  }
];

const checklist = document.getElementById("checklist");
const progress = document.getElementById("progress");

let state = {};

// 今日の日付を取得
function getToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const today = getToday();

// 日付ごとに別データとして保存
const checklistRef = doc(
  db,
  "breakfastChecklists",
  today
);

// 進捗表示
function updateProgress() {

  const completed = items.filter(
    item => state[item.id] === true
  ).length;

  if (completed === items.length) {

    progress.textContent =
      `✅ ${completed} / ${items.length} すべて完了`;

  } else {

    progress.textContent =
      `${completed} / ${items.length} 完了`;

  }
}

// チェック状態をFirebaseに保存
async function saveCheck(id, checked) {

  try {

    await setDoc(
      checklistRef,
      {
        date: today,

        checked: {
          [id]: checked
        }
      },
      {
        merge: true
      }
    );

  } catch (error) {

    console.error(error);

    alert(
      "チェック状態を保存できませんでした。"
    );
  }
}

// 画面を作る
function renderChecklist() {

  checklist.innerHTML = "";

  items.forEach(item => {

    // 忘れやすい項目の見出し
    if (item.id === "orange") {

      const warningTitle =
        document.createElement("div");

      warningTitle.textContent =
        "⚠️ 忘れやすいもの";

      warningTitle.style.marginTop = "18px";
      warningTitle.style.padding = "10px 6px";
      warningTitle.style.fontWeight = "bold";
      warningTitle.style.color = "#d60000";

      checklist.appendChild(warningTitle);
    }

    const div =
      document.createElement("div");

    div.className = "item";

    if (item.warning) {
      div.classList.add("warning");
    }

    const label =
      document.createElement("label");

    const checkbox =
      document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.checked =
      state[item.id] === true;

    const text =
      document.createElement("span");

    text.textContent = item.text;

    label.appendChild(checkbox);
    label.appendChild(text);

    div.appendChild(label);

    if (checkbox.checked) {
      div.classList.add("done");
    }

    checkbox.addEventListener(
      "change",
      async () => {

        // 最終確認
        if (
          item.final &&
          checkbox.checked
        ) {

          const unfinished =
            items.filter(other =>
              !other.final &&
              state[other.id] !== true
            );

          if (unfinished.length > 0) {

            checkbox.checked = false;

            const names =
              unfinished
                .map(
                  item => `・${item.text}`
                )
                .join("\n");

            alert(
              "⚠️ まだ終わっていない項目があります。\n\n" +
              names
            );

            return;
          }
        }

        // 画面はすぐ反映
        state[item.id] =
          checkbox.checked;

        div.classList.toggle(
          "done",
          checkbox.checked
        );

        updateProgress();

        // Firebaseへ保存
        await saveCheck(
          item.id,
          checkbox.checked
        );
      }
    );

    checklist.appendChild(div);
  });

  updateProgress();
}

// 最初に表示
renderChecklist();

// Firebaseをリアルタイム監視
onSnapshot(
  checklistRef,

  snapshot => {

    if (snapshot.exists()) {

      const data = snapshot.data();

      state = data.checked || {};

    } else {

      state = {};

    }

    renderChecklist();
  },

  error => {

    console.error(error);

    alert(
      "Firebaseとの接続でエラーが発生しました。"
    );
  }
);