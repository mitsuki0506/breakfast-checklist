import {
  db,
  doc,
  setDoc,
  onSnapshot
} from "./firebase.js";

const defaultItems = [
  { id: "greeting", text: "挨拶をする", category: "準備" },
{ id: "haccp_phone", text: "携帯でHACCPをする", category: "準備" },
{ id: "haccp_paper", text: "HACCPの紙を書く", category: "準備" },

  {
  id: "order",
  text: "パン、プリンの発注（ホワイトボード確認）",
  category: "発注"
},
{
  id: "graham_banana",
  text: "明日分のグラハム、バナナケーキ",
  category: "発注"
},
{
  id: "butter",
  text: "明日分のバター",
  category: "発注"
},
{
  id: "cart1",
  text: "1台目カート揃っているか",
  category: "準備"
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
let itemOrder = [];

let currentCategory = "準備";

function getItems() {
  const items = [
    ...defaultItems.filter(item => !deletedDefaultIds.includes(item.id)),
    ...customItems
  ];

  if (itemOrder.length !== 0) {
    items.sort((a, b) => {
      const aIndex = itemOrder.indexOf(a.id);
      const bIndex = itemOrder.indexOf(b.id);

      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });
  }

  return items.filter(item => item.category === currentCategory);
}
const checklist = document.getElementById("checklist");
const progress = document.getElementById("progress");
const tabButtons = document.querySelectorAll(".tab-button");

tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentCategory = button.dataset.category;

    tabButtons.forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    renderChecklist();
  });
});
let state = {};
let draggedItem = null;
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


    const div =
      document.createElement("div");

    div.className = "item";
div.dataset.id = item.id;
div.draggable = false;
    const dragHandle = document.createElement("span");
dragHandle.className = "drag-handle";
dragHandle.textContent = "☰";
div.appendChild(dragHandle);
    let longPressTimer;
let pressStartX = 0;
let pressStartY = 0;
let longPressActivated = false;
dragHandle.addEventListener("pointerdown", event => {
  pressStartX = event.clientX;
  pressStartY = event.clientY;
  longPressActivated = false;

  // 指を置いた瞬間から追跡する
  dragHandle.setPointerCapture(event.pointerId);

  longPressTimer = setTimeout(() => {
    longPressActivated = true;
    draggedItem = div;
    div.classList.add("dragging");

  }, 500);
});
    dragHandle.addEventListener("pointerup", () => {
  clearTimeout(longPressTimer);
});

dragHandle.addEventListener("pointercancel", () => {
  clearTimeout(longPressTimer);
});

dragHandle.addEventListener("pointerleave", () => {
  if (!draggedItem) {
    clearTimeout(longPressTimer);
  }
});
dragHandle.addEventListener("pointermove", event => {
  if (event.timeStamp - (draggedItem?.lastMoveTime || 0) < 50) {
  return;
}

if (draggedItem) {
  draggedItem.lastMoveTime = event.timeStamp;
}
  if (!longPressActivated) {
    const moveX = Math.abs(event.clientX - pressStartX);
    const moveY = Math.abs(event.clientY - pressStartY);

    if (moveX > 20 || moveY > 20) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    return;
  }

  event.preventDefault();

  if (!draggedItem) return;

  const target = document
  .elementFromPoint(event.clientX, event.clientY)
  ?.closest(".item");

if (target && target !== draggedItem) {
  const rect = target.getBoundingClientRect();

  if (event.clientY < rect.top + rect.height / 2) {
    checklist.insertBefore(draggedItem, target);
  } else {
    checklist.insertBefore(draggedItem, target.nextSibling);
  }
}

  if (closestItem) {
    checklist.insertBefore(draggedItem, closestItem);
  } else {
    checklist.appendChild(draggedItem);
  }
});
   dragHandle.addEventListener("pointerup", async () => {
  clearTimeout(longPressTimer);

  // 長押しが成立していなければ何もしない
  if (!draggedItem) return;

  itemOrder = [...checklist.querySelectorAll(".item")]
    .map(el => el.dataset.id);

  try {
    await setDoc(
      settingsRef,
      {
        items: customItems,
        itemOrder: itemOrder
      },
      {
        merge: true
      }
    );
  } catch (error) {
    console.error("並び順の保存エラー:", error);
  }

   div.style.transform = "";
div.classList.remove("dragging");
  draggedItem = null;
});
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
div.addEventListener("dragover", event => {
  event.preventDefault();

  if (!draggedItem || draggedItem === div) return;

  const rect = div.getBoundingClientRect();
  const after = event.clientY > rect.top + rect.height / 2;

  if (after) {
    div.after(draggedItem);
  } else {
    div.before(draggedItem);
  }
});
    div.addEventListener("dragend", async () => {
itemOrder = [...checklist.querySelectorAll(".item")]
  .map(el => el.dataset.id);

  try {
    await setDoc(
      settingsRef,
     {
  items: customItems,
  itemOrder: itemOrder
},
      {
        merge: true
      }
    );
  } catch (error) {
    console.error("並び順の保存エラー:", error);
  }

  draggedItem = null;
});
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
    custom: true,
    category: currentCategory
  };

  customItems.push(newItem);

 try {
  await setDoc(
    settingsRef,
    {
      items: customItems
    },
    {
      merge: true
    }
  );
} catch (error) {
  console.error(error);
  alert("項目を追加できませんでした。");
}
});

   
onSnapshot(
  settingsRef,

  snapshot => {

    if (snapshot.exists()) {
  const data = snapshot.data();

  customItems = data.items || [];
  itemOrder = data.itemOrder || [];
  deletedDefaultIds = data.deletedDefaultIds || [];
} else {
  customItems = [];
  itemOrder = [];
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
