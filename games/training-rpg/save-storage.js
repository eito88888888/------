(() => {
  "use strict";

  const GAME_ID = "tabitabi-monsters";
  const FORMAT_VERSION = 1;
  const LEGACY_KEY = "tabitabi-monsters-save-v1";
  const SLOT_PREFIX = "tabitabi-monsters-slot-v1:";
  const DEFAULT_SLOT_ID = "slot-1";
  const SLOT_ID_PATTERN = /^[a-z0-9_-]{1,40}$/i;

  function getStorage() {
    return window.localStorage;
  }

  function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function slotKey(slotId) {
    if (typeof slotId !== "string" || !SLOT_ID_PATTERN.test(slotId)) {
      throw new TypeError("セーブスロットIDが正しくありません。");
    }
    return `${SLOT_PREFIX}${slotId}`;
  }

  function decode(raw, expectedSlotId) {
    const envelope = JSON.parse(raw);
    if (
      !isRecord(envelope)
      || envelope.gameId !== GAME_ID
      || envelope.formatVersion !== FORMAT_VERSION
      || envelope.slotId !== expectedSlotId
      || !isRecord(envelope.data)
      || typeof envelope.savedAt !== "string"
    ) {
      throw new Error("セーブデータの形式またはバージョンが正しくありません。");
    }
    return envelope;
  }

  function createEnvelope(slotId, data) {
    if (!isRecord(data)) {
      throw new TypeError("セーブデータはオブジェクトである必要があります。");
    }
    return {
      gameId: GAME_ID,
      formatVersion: FORMAT_VERSION,
      slotId,
      savedAt: new Date().toISOString(),
      data
    };
  }

  function loadSlot(slotId) {
    const key = slotKey(slotId);
    const storage = getStorage();
    const raw = storage.getItem(key);
    if (raw !== null) return decode(raw, slotId).data;

    if (slotId !== DEFAULT_SLOT_ID) return null;

    const legacyRaw = storage.getItem(LEGACY_KEY);
    if (legacyRaw === null) return null;

    const legacyData = JSON.parse(legacyRaw);
    if (!isRecord(legacyData)) {
      throw new Error("旧セーブデータの形式が正しくありません。");
    }

    try {
      saveSlot(slotId, legacyData);
    } catch (error) {
      console.warn("旧セーブデータを新しい保存形式へ移行できませんでした。", error);
    }
    return legacyData;
  }

  function saveSlot(slotId, data) {
    const key = slotKey(slotId);
    const envelope = createEnvelope(slotId, data);
    getStorage().setItem(key, JSON.stringify(envelope));
  }

  function listSlots() {
    const storage = getStorage();
    const slots = [];
    const defaultKey = slotKey(DEFAULT_SLOT_ID);
    const legacyRaw = storage.getItem(LEGACY_KEY);
    const hasDefaultSlot = storage.getItem(defaultKey) !== null;
    let legacyCorrupt = false;

    if (!hasDefaultSlot && legacyRaw !== null) {
      try {
        loadSlot(DEFAULT_SLOT_ID);
      } catch {
        legacyCorrupt = true;
      }
    }

    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      if (!key || !key.startsWith(SLOT_PREFIX)) continue;

      const id = key.slice(SLOT_PREFIX.length);
      if (!SLOT_ID_PATTERN.test(id)) continue;

      try {
        const envelope = decode(storage.getItem(key), id);
        slots.push({ id, savedAt: envelope.savedAt, corrupt: false });
      } catch {
        slots.push({ id, savedAt: null, corrupt: true });
      }
    }
    if (legacyRaw !== null && !slots.some((slot) => slot.id === DEFAULT_SLOT_ID)) {
      slots.push({ id: DEFAULT_SLOT_ID, savedAt: null, corrupt: legacyCorrupt });
    }
    return slots.sort((left, right) => left.id.localeCompare(right.id));
  }

  function deleteSlot(slotId) {
    const storage = getStorage();
    storage.removeItem(slotKey(slotId));
    if (slotId === DEFAULT_SLOT_ID) storage.removeItem(LEGACY_KEY);
  }

  function exportSlot(slotId) {
    const key = slotKey(slotId);
    const storage = getStorage();
    let raw = storage.getItem(key);
    if (raw === null) {
      const data = loadSlot(slotId);
      raw = storage.getItem(key);
      if (raw === null && data) return JSON.stringify(createEnvelope(slotId, data), null, 2);
    }
    if (raw === null) return null;
    return JSON.stringify(decode(raw, slotId), null, 2);
  }

  function importSlot(slotId, text) {
    if (typeof text !== "string") {
      throw new TypeError("インポートするセーブデータはテキストで指定してください。");
    }
    const envelope = JSON.parse(text);
    if (!isRecord(envelope) || typeof envelope.slotId !== "string") {
      throw new Error("セーブデータの形式が正しくありません。");
    }
    const imported = decode(text, envelope.slotId);
    saveSlot(slotId, imported.data);
  }

  window.TrainingRpgSaveStorage = Object.freeze({
    loadSlot,
    saveSlot,
    listSlots,
    deleteSlot,
    exportSlot,
    importSlot
  });
})();
