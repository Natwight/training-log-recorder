/* ==============================
   Training Log App v1.1.0
   storage.js
   localStorage 管理
============================== */

const APP_VERSION = "1.1.0";
const DATA_VERSION = "1.1.0";

const APP_RECORDS_STORAGE_KEY = "trainingLogAppRecords";
const APP_META_STORAGE_KEY = "trainingLogAppMeta";

let appRecords = [];

let appMeta = {
    appVersion: APP_VERSION,
    dataVersion: DATA_VERSION,
    updatedAt: "",
    importedAt: ""
};


/* ==============================
   現在日時を文字列で取得
============================== */

function getCurrentDateTimeText() {
    return new Date().toISOString();
}


/* ==============================
   更新日時を現在時刻にする
============================== */

function updateAppUpdatedAt() {
    appMeta.updatedAt = getCurrentDateTimeText();
}


/* ==============================
   appRecords を保存
============================== */

function saveAppRecords() {
    localStorage.setItem(
        APP_RECORDS_STORAGE_KEY,
        JSON.stringify(appRecords)
    );
}


/* ==============================
   appMeta を保存
============================== */

function saveAppMeta() {
    localStorage.setItem(
        APP_META_STORAGE_KEY,
        JSON.stringify(appMeta)
    );
}


/* ==============================
   appRecords / appMeta を保存
============================== */

function saveAppData() {
    saveAppRecords();
    saveAppMeta();
}


/* ==============================
   更新日時を更新して保存
============================== */

function saveAppDataWithUpdateTime() {
    updateAppUpdatedAt();
    saveAppData();
}


/* ==============================
   appRecords を読み込み
============================== */

function loadAppRecords() {
    const savedRecords = localStorage.getItem(APP_RECORDS_STORAGE_KEY);

    if (!savedRecords) {
        appRecords = [];
        return false;
    }

    try {
        const parsedRecords = JSON.parse(savedRecords);

        if (!Array.isArray(parsedRecords)) {
            appRecords = [];
            return false;
        }

        appRecords = parsedRecords;
        return true;

    } catch (error) {
        console.error("appRecords の読み込みに失敗しました。", error);
        appRecords = [];
        return false;
    }
}


/* ==============================
   appMeta を読み込み
============================== */

function loadAppMeta() {
    const savedMeta = localStorage.getItem(APP_META_STORAGE_KEY);

    if (!savedMeta) {
        return false;
    }

    try {
        const parsedMeta = JSON.parse(savedMeta);

        appMeta = {
            appVersion: parsedMeta.appVersion || APP_VERSION,
            dataVersion: parsedMeta.dataVersion || DATA_VERSION,
            updatedAt: parsedMeta.updatedAt || "",
            importedAt: parsedMeta.importedAt || ""
        };

        return true;

    } catch (error) {
        console.error("appMeta の読み込みに失敗しました。", error);

        appMeta = {
            appVersion: APP_VERSION,
            dataVersion: DATA_VERSION,
            updatedAt: "",
            importedAt: ""
        };

        return false;
    }
}


/* ==============================
   appRecords / appMeta を読み込み
============================== */

function loadAppData() {
    const recordsLoaded = loadAppRecords();
    const metaLoaded = loadAppMeta();

    return recordsLoaded && metaLoaded;
}


/* ==============================
   JSON全体の形式チェック
============================== */

function validateTrainingRecordsJson(jsonData) {
    if (!jsonData || typeof jsonData !== "object") {
        alert("JSONデータの形式が正しくありません。");
        return false;
    }

    if (!jsonData.meta || typeof jsonData.meta !== "object") {
        alert("JSONデータに meta がありません。");
        return false;
    }

    if (jsonData.meta.dataVersion !== DATA_VERSION) {
        alert(
            "JSONデータのバージョンが違います。\n\n" +
            "必要なバージョン：" + DATA_VERSION + "\n" +
            "読み込んだバージョン：" + (jsonData.meta.dataVersion || "不明")
        );
        return false;
    }

    if (!Array.isArray(jsonData.records)) {
        alert("JSONデータの records が配列ではありません。");
        return false;
    }

    const isValidRecords = jsonData.records.every((record) => {
        return validateTrainingRecord(record);
    });

    if (!isValidRecords) {
        alert("JSONデータ内の記録形式に問題があります。");
        return false;
    }

    return true;
}


/* ==============================
   記録1件分の形式チェック
============================== */

function validateTrainingRecord(record) {
    if (!record || typeof record !== "object") {
        return false;
    }

    if (typeof record.id !== "string") {
        return false;
    }

    if (typeof record.date !== "string") {
        return false;
    }

    if (typeof record.part !== "string") {
        return false;
    }

    if (typeof record.exerciseId !== "string") {
        return false;
    }

    if (typeof record.exercise !== "string") {
        return false;
    }

    if (typeof record.type !== "string") {
        return false;
    }

    if (typeof record.unit !== "string") {
        return false;
    }

    if (typeof record.bodyWeight !== "number") {
        return false;
    }

    if (!Array.isArray(record.sets)) {
        return false;
    }

    const isValidSets = record.sets.every((set) => {
        return validateTrainingSet(set);
    });

    if (!isValidSets) {
        return false;
    }

    if (record.note !== undefined && typeof record.note !== "string") {
        return false;
    }

    return true;
}


/* ==============================
   セット情報の形式チェック
============================== */

function validateTrainingSet(set) {
    if (!set || typeof set !== "object") {
        return false;
    }

    if (typeof set.set !== "number") {
        return false;
    }

    if (typeof set.weight !== "number") {
        return false;
    }

    if (typeof set.reps !== "number") {
        return false;
    }

    return true;
}


/* ==============================
   JSONから記録をインポート
============================== */

function importRecordsFromJson(jsonData) {
    const isValidJson = validateTrainingRecordsJson(jsonData);

    if (!isValidJson) {
        return false;
    }

    const records = jsonData.records;
    const meta = jsonData.meta;

    appRecords = records;

    appMeta = {
        appVersion: meta.appVersion || APP_VERSION,
        dataVersion: meta.dataVersion || DATA_VERSION,
        updatedAt: meta.updatedAt || getCurrentDateTimeText(),
        importedAt: getCurrentDateTimeText()
    };

    saveAppData();

    return true;
}


/* ==============================
   localStorage のアプリデータを削除
============================== */

function clearAppData() {
    localStorage.removeItem(APP_RECORDS_STORAGE_KEY);
    localStorage.removeItem(APP_META_STORAGE_KEY);

    appRecords = [];

    appMeta = {
        appVersion: APP_VERSION,
        dataVersion: DATA_VERSION,
        updatedAt: "",
        importedAt: ""
    };
}