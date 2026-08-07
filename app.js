import {
  db,
  doc,
  setDoc,
  onSnapshot
} from "./firebase.js";

const defaultItems = [
  { id: "greeting", text: "挨拶をする" },
  { id: "haccp_phone", text: "携帯でHACCPをする" },
  { id: "haccp_paper", text: "HACCPの紙を書く" },

  {
    id: "order",
    text: "パン、プリンの発注（ホワイトボード確認）"
  },

  {
    id: "graham_banana",
    text: "明日分のグラハム、バナナケーキ"
  },

  {
    id: "butter",
    text: "明日分のバター"
  },

  {
    id: "cart1",
    text: "1台目カート揃っているか"
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
    text: "和食引き継ぎ"
  },

  {
    id: "cake_down",
    text: "ケーキB1"
  },

  {
    id: "japa_washi",
    text: "JPお盆に和紙"
  },

  {
    id: "cereal",
    text: "シリアルの補充"
  },

  {
    id: "jam",
    text: "ジャムの補充"
  },

  {
    id: "yogurt",
    text: "ヨーグルトの補充"
  },

  {
    id: "ham_salmon",
    text: "皿盛り【サーモンなど】"
  },

  {
    id: "room_change",
    text: "ルームの入れ替え"
  },

  {
    id: "misoshiru_bowl",
    text: "味噌汁椀 個数確認"
  },

  {
    id: "washoku_count",
    text: "和食小鉢 個数確認"
  },

  {
    id: "leaf",
    text: "ミックスリーフ、ロメイン補充"
  },

  {
    id: "blueberry_apple",
    text: "ブルーベリー、リンゴを補充"
  },

  {
    id: "wrap_check",
    text: "フルーツ、和食などのラップ確認"
  },

  {
    id: "juice_amount",
    text: "ジュースの量を確認"
  },

  {
    id: "salad",
    text: "サラダ（きゅうり、赤玉など）の補充"
  },

  {
    id: "frozen_plate",
    text: "皿盛り使用分補充"
  },

  {
    id: "v_mine",
    text: "冷凍BOX補充(ヴィーガン類、チキンライス)",
    warning: true
  },


  {
    id: "dishes_cart",
    text: "洗浄後の食器片づけ"
  },

  {
    id: "final_check",
    text: "不足はないか最終確認",
    final: true
  }
];
let customItems = [];
let deletedDefaultIds = [];
function getItems() {
return [
  ...defaultItems,
  ...customItems
];
}
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
const settingsRef = doc(
  db,
  "breakfastSettings",
  "customItems"
);
// 進捗表示
function updateProgress() {

  const items = getItems();

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

  const items = getItems();

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

  const deleteButton = document.createElement("button");

  deleteButton.className = "delete-button";
  deleteButton.textContent = "削除";

  deleteButton.addEventListener("click", async event => {

    event.preventDefault();
    event.stopPropagation();

    const answer = confirm(
      `「${item.text}」を削除しますか？`
    );

    if (!answer) return;

    if (item.custom) {
  customItems = customItems.filter(
    custom => custom.id !== item.id
  );
} else {
  deletedDefaultIds.push(item.id);
}

    await setDoc(
      settingsRef,
      {
        items: customItems,
deletedDefaultIds: deletedDefaultIds
      },
      {
        merge: true
      }
    );

  });

  div.appendChild(deleteButton);

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
);const resetButton = document.getElementById("resetButton");

resetButton.addEventListener("click", async () => {

  const answer = confirm(
    "今日のチェックをすべて解除しますか？\n\n職場のみんなの画面も解除されます。"
  );

  if (!answer) {
    return;
  }
const items = getItems();
  const emptyState = {};

  items.forEach(item => {
    emptyState[item.id] = false;
  });

  try {

    await setDoc(
      checklistRef,
      {
        date: today,
        checked: emptyState
      },
      {
        merge: true
      }
    );
state = emptyState;
renderChecklist();
updateProgress();
  } catch (error) {

    console.error(error);

    alert("全解除できませんでした。");
  }

});
const addItemButton =
  document.getElementById("addItemButton");

addItemButton.addEventListener("click", async () => {

  const text = prompt(
    "追加するチェック項目を入力してください"
  );

  if (!text) return;

  const cleanText = text.trim();

  if (!cleanText) return;

  const newItem = {
    id: "custom_" + Date.now(),
    text: cleanText,
    custom: true
  };

  customItems.push(newItem);

  try {

    await setDoc(
      settingsRef,
      {
        items: customItems
      },

});
onSnapshot(
  settingsRef,

  snapshot => {

    if (snapshot.exists()) {
      const data = snapshot.data();

      customItems = data.items || [];
      deletedDefaultIds = data.deletedDefaultIds || [];
    } else {
      customItems = [];
      deletedDefaultIds = [];
    }

    renderChecklist();
  },

  error => {

    console.error(
      "追加項目の読み込みエラー:",
      error
    );

  }
);
if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => {
        console.log("アプリ機能を有効化しました");
      })
      .catch(error => {
        console.error("Service Workerエラー:", error);
      });

  });

}
