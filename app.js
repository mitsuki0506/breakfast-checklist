const items = [
  "挨拶をする",
  "携帯でHACCPをする",
  "HACCPの紙を書く",
  "パン、プリンの発注をする（ホワイトボード確認）",
  "明日の分のグラハム、バナナケーキを出す",
  "明日の分のバターを出す",
  "1台目カートを抜けがないように組む",
  "オレンジジュース",
  "ピングレジュース",
  "シャンティー",
  "ベリーソース",
  "ハム盛り"
];

const warningItems = [
  "オレンジジュース",
  "ピングレジュース",
  "シャンティー",
  "ベリーソース",
  "ハム盛り"
];

const checklist = document.getElementById("checklist");
const progress = document.getElementById("progress");

function updateProgress() {
  const checked = document.querySelectorAll("input[type='checkbox']:checked").length;
  progress.textContent = `${checked} / ${items.length} 完了`;
}

items.forEach(item => {
  const div = document.createElement("div");
  div.className = "item";

  if (warningItems.includes(item)) {
    div.classList.add("warning");
  }

  div.innerHTML = `
    <label>
      <input type="checkbox">
      ${item}
    </label>
  `;

  div.querySelector("input").addEventListener("change", function () {
    div.classList.toggle("done", this.checked);
    updateProgress();
  });

  checklist.appendChild(div);
});

updateProgress();