(() => {
  "use strict";

  const SLOT_COUNT = 3;
  const titleScreen = document.getElementById("titleScreen");
  const gameShell = document.getElementById("gameShell");
  const saveSlots = document.getElementById("saveSlots");
  const saveError = document.getElementById("saveError");
  let gameStarted = false;

  function showError(message) {
    saveError.textContent = message;
    saveError.hidden = false;
  }

  function makeButton(label, className, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  function formatSavedAt(value) {
    const timestamp = Date.parse(value);
    if (!Number.isFinite(timestamp)) return "保存日時は不明";
    return new Intl.DateTimeFormat("ja-JP", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(timestamp);
  }

  function launchGame(slotId, startNew) {
    if (gameStarted) return;
    gameStarted = true;
    window.TrainingRpgActiveSlotId = slotId;
    window.TrainingRpgStartNew = startNew;
    titleScreen.hidden = true;
    gameShell.hidden = false;

    const script = document.createElement("script");
    script.src = "game.js";
    script.onerror = () => {
      gameStarted = false;
      gameShell.hidden = true;
      titleScreen.hidden = false;
      showError("ゲームを起動できませんでした。ページを再読み込みしてください。");
      script.remove();
    };
    document.body.appendChild(script);
  }

  function renderSlots() {
    const slots = new Map();
    saveError.hidden = true;
    try {
      for (const slot of window.TrainingRpgSaveStorage.listSlots()) {
        slots.set(slot.id, slot);
      }
    } catch (error) {
      console.warn("セーブスロットを読み込めませんでした。", error);
      showError("セーブ領域を確認できません。新しい冒険は開始できますが、保存できない場合があります。");
    }

    saveSlots.replaceChildren();
    for (let index = 1; index <= SLOT_COUNT; index++) {
      const slotId = `slot-${index}`;
      const slot = slots.get(slotId) || null;
      let data = null;
      if (slot && !slot.corrupt) {
        try {
          data = window.TrainingRpgSaveStorage.loadSlot(slotId);
        } catch (error) {
          console.warn(`セーブスロット${index}を読み込めませんでした。`, error);
          slot.corrupt = true;
        }
      }

      const card = document.createElement("article");
      card.className = "save-slot";
      const heading = document.createElement("h2");
      heading.textContent = `セーブ ${index}`;
      card.appendChild(heading);

      const summary = document.createElement("p");
      summary.className = "save-slot-summary";
      if (!slot) {
        summary.textContent = "空きスロット";
      } else if (slot.corrupt) {
        summary.textContent = "データを読み込めません";
      } else if (data) {
        const level = Number.isFinite(data.level) ? data.level : "—";
        const gold = Number.isFinite(data.gold) ? data.gold : "—";
        summary.textContent = `冒険者 Lv.${level} · ${gold} G`;
      } else {
        summary.textContent = "セーブデータがありません";
      }
      card.appendChild(summary);

      if (slot && !slot.corrupt) {
        const timestamp = document.createElement("p");
        timestamp.className = "save-slot-date";
        timestamp.textContent = formatSavedAt(slot.savedAt);
        card.appendChild(timestamp);
      }

      const actions = document.createElement("div");
      actions.className = "save-slot-actions";
      if (slot && !slot.corrupt) {
        actions.appendChild(makeButton("つづきから", "primary-button", () => launchGame(slotId, false)));
      } else if (slot?.corrupt) {
        const continueButton = makeButton("つづきから", "primary-button", () => {});
        continueButton.disabled = true;
        actions.appendChild(continueButton);
      }

      const startLabel = slot ? "最初から" : "新しくはじめる";
      actions.appendChild(makeButton(startLabel, "secondary-button", () => {
        if (slot && !window.confirm(`セーブ ${index} のデータを上書きして、最初から始めますか？`)) return;
        launchGame(slotId, true);
      }));
      card.appendChild(actions);
      saveSlots.appendChild(card);
    }
  }

  renderSlots();
})();
