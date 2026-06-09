/* ==============================
   Training Log App v1.1.0
   mobile.js
   スマホ画面制御
============================== */


/* ==============================
   DOM取得
============================== */

const referenceDateInput = document.getElementById("training-date");
const referenceBodyWeightInput = document.getElementById("body-weight");

const referenceBodyPartSelect = document.getElementById("reference-body-part");
const referenceExerciseSelect = document.getElementById("reference-exercise");
const referenceExerciseTypeSelect = document.getElementById("reference-exercise-type");

const referenceTempoText = document.getElementById("reference-tempo-text");
const referenceMemoText = document.getElementById("reference-memo-text");

const referenceSet1Weight = document.getElementById("reference-set1-weight");
const referenceSet1Reps = document.getElementById("reference-set1-reps");

const referenceSet2Weight = document.getElementById("reference-set2-weight");
const referenceSet2Reps = document.getElementById("reference-set2-reps");

const referenceSet3Weight = document.getElementById("reference-set3-weight");
const referenceSet3Reps = document.getElementById("reference-set3-reps");

const referencePastRecordsBox = document.getElementById("reference-past-records-grid");

const referenceAddButton = document.getElementById("reference-add-button");

// v1.1.0では「選択日の記録」欄として使う
const selectedDateRecordsBox = document.getElementById("training-date-records-list");

const selectedDateRecordsTitle = document.getElementById("training-date-records-title");

// 既存HTMLのボタンIDを使用
const backupJsonButton = document.getElementById("download-all-records-button");

// v1.1.0で追加した再インポートボタン
const reimportJsonButton = document.getElementById("reimport-json-button");


/* ==============================
   編集中フラグ
============================== */

// true のときは、選択日の記録を編集中
let isEditingRecord = false;


/* ==============================
   初期表示
============================== */

document.addEventListener("DOMContentLoaded", () => {
    setTodayDate();

    initializeWeightSelects();
    initializeRepsSelects();

    updateReferenceExerciseSelect();
    updateReferenceExerciseType();
    updateReferenceMemo();

    initializeAppData();

    setEventListeners();
});


/* ==============================
   イベント登録
============================== */

function setEventListeners() {

    referenceDateInput.addEventListener("change", () => {
        // 編集中に日付変更した場合は、編集をキャンセル扱いにする
        isEditingRecord = false;
        updateAddButtonState();

        showSelectedDateRecords();
        getReferenceRecordsBySelectedExercise();
        resetRepsInputs();
    });

    referenceBodyPartSelect.addEventListener("change", () => {
        updateReferenceExerciseSelect();
        updateReferenceExerciseType();
        updateReferenceMemo();
        getReferenceRecordsBySelectedExercise();
        resetRepsInputs();
    });

    referenceExerciseSelect.addEventListener("change", () => {
        updateReferenceExerciseType();
        updateReferenceMemo();
        getReferenceRecordsBySelectedExercise();
        resetRepsInputs();
    });

    referenceSet1Weight.addEventListener("change", () => {
        referenceSet2Weight.value = referenceSet1Weight.value;
        referenceSet3Weight.value = referenceSet1Weight.value;
    });

    referenceAddButton.addEventListener("click", () => {
        addTrainingRecord();
    });

    if (backupJsonButton) {
        backupJsonButton.addEventListener("click", () => {
            downloadBackupJson();
        });
    }

    if (reimportJsonButton) {
        reimportJsonButton.addEventListener("click", () => {
            reimportFromJson();
        });
    }
}


/* ==============================
   今日の日付をセット
============================== */

function setTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const date = String(today.getDate()).padStart(2, "0");

    referenceDateInput.value = `${year}-${month}-${date}`;
}


/* ==============================
   重量セレクト初期化
============================== */

function initializeWeightSelects() {
    const weightSelects = [
        referenceSet1Weight,
        referenceSet2Weight,
        referenceSet3Weight
    ];

    weightSelects.forEach((select) => {
        select.innerHTML = "";

        for (let weight = 0; weight <= 100; weight += 0.5) {
            const option = document.createElement("option");

            option.value = weight.toFixed(1);
            option.textContent = weight.toFixed(1) + "kg";

            select.appendChild(option);
        }
    });
}


/* ==============================
   回数セレクト初期化
============================== */

function initializeRepsSelects() {
    const repsSelects = [
        referenceSet1Reps,
        referenceSet2Reps,
        referenceSet3Reps
    ];

    repsSelects.forEach((select) => {
        select.innerHTML = "";

        const emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.textContent = "未実施";
        select.appendChild(emptyOption);

        for (let reps = 1; reps <= 50; reps++) {
            const option = document.createElement("option");

            option.value = reps;
            option.textContent = reps + "回";

            select.appendChild(option);
        }
    });
}


/* ==============================
   アプリデータ初期化
============================== */

async function initializeAppData() {

    // まず localStorage から appRecords を読み込む
    const hasLocalRecords = loadAppRecords();

    // meta は無くても致命的ではないため、別で読み込む
    loadAppMeta();

    // localStorage に記録がある場合は、それを本体データとして使う
    if (hasLocalRecords) {
        sortAppRecordsLatestFirst();
        saveAppData();

        showSelectedDateRecords();
        getReferenceRecordsBySelectedExercise();

        return;
    }

    // localStorage に記録がない場合だけ、JSONを初回インポート
    await importInitialRecordsFromJson();
}


/* ==============================
   初回のみ training-records.json を読み込む
============================== */

async function importInitialRecordsFromJson() {
    try {
        const response = await fetch("training-records-v1.1.0.json");

        if (!response.ok) {
            alert("training-records.json の読み込みに失敗しました。");
            return;
        }

        const jsonData = await response.json();

        const imported = importRecordsFromJson(jsonData);

        if (!imported) {
            return;
        }

        sortAppRecordsLatestFirst();
        saveAppData();

        showSelectedDateRecords();
        getReferenceRecordsBySelectedExercise();

    } catch (error) {
        console.error("初回インポートに失敗しました。", error);
        alert("初回データの読み込みに失敗しました。");
    }
}


/* ==============================
   data.js から部位別の種目一覧を取得
============================== */

function getExerciseListByPart(partValue) {
    if (!exercisesByPart || !exercisesByPart[partValue]) {
        return [];
    }

    return exercisesByPart[partValue];
}


/* ==============================
   種目セレクト更新
============================== */

function updateReferenceExerciseSelect() {
    const selectedPart = referenceBodyPartSelect.value;
    const exerciseList = getExerciseListByPart(selectedPart);

    referenceExerciseSelect.innerHTML = "";

    exerciseList.forEach((exercise) => {
        const option = document.createElement("option");

        option.value = exercise.id;
        option.textContent = exercise.name;

        referenceExerciseSelect.appendChild(option);
    });
}


/* ==============================
   選択中の種目データを取得
============================== */

function getSelectedExerciseData() {
    const selectedPart = referenceBodyPartSelect.value;
    const selectedExerciseId = referenceExerciseSelect.value;

    const exerciseList = getExerciseListByPart(selectedPart);

    return exerciseList.find((exercise) => {
        return exercise.id === selectedExerciseId;
    });
}


/* ==============================
   種目タイプ判定
============================== */

function getReferenceExerciseType(exerciseId) {

    if (
        exerciseId === "ex_assisted_pull_up" ||
        exerciseId === "ex_assisted_chin_up" ||
        exerciseId === "ex_assisted_dips"
    ) {
        return "assisted_bodyweight";
    }

    if (
        exerciseId === "ex_push_up" ||
        exerciseId === "ex_squat" ||
        exerciseId === "ex_crunch"
    ) {
        return "bodyweight";
    }

    return "weight";
}


/* ==============================
   タイプ表示更新
============================== */

function updateReferenceExerciseType() {
    const selectedExerciseId = referenceExerciseSelect.value;
    const exerciseType = getReferenceExerciseType(selectedExerciseId);

    referenceExerciseTypeSelect.value = exerciseType;
}


/* ==============================
   種目メモ更新
============================== */

function updateReferenceMemo() {
    const selectedExercise = getSelectedExerciseData();

    if (!selectedExercise) {
        referenceTempoText.textContent = "テンポ：-";
        referenceMemoText.textContent = "-";
        return;
    }

    referenceTempoText.textContent = "テンポ：" + (selectedExercise.tempo || "-");
    referenceMemoText.textContent = selectedExercise.memo || "-";
}


/* ==============================
   選択中の種目の過去3回を表示
============================== */

function getReferenceRecordsBySelectedExercise() {
    const selectedExerciseId = referenceExerciseSelect.value;
    const selectedDate = referenceDateInput.value;

    if (!selectedExerciseId || !selectedDate) {
        showReferencePastRecords([]);
        return;
    }

    const pastThreeRecords = getPastThreeRecordsByExercise(
        selectedExerciseId,
        selectedDate
    );

    showReferencePastRecords(pastThreeRecords);

    setLatestWeightFromRecentRecords(pastThreeRecords);
}


/* ==============================
   直近3回表示
   右側が最新になるように表示
============================== */

function showReferencePastRecords(records) {
    referencePastRecordsBox.innerHTML = "";

    // getPastThreeRecordsByExercise() は最新順で返す
    // 表示は左から「3回前・2回前・最新」にする
    const displayRecords = [
        records[2],
        records[1],
        records[0]
    ];

    // 1行目：日付行
    appendPastRecordCell("");
    appendPastRecordCell(getPastRecordDateText(displayRecords[0]));
    appendPastRecordCell(getPastRecordDateText(displayRecords[1]));
    appendPastRecordCell(getPastRecordDateText(displayRecords[2]));

    // 2行目：1set
    appendPastRecordCell("1set");
    appendPastRecordCell(getPastRecordSetText(displayRecords[0], 1));
    appendPastRecordCell(getPastRecordSetText(displayRecords[1], 1));
    appendPastRecordCell(getPastRecordSetText(displayRecords[2], 1));

    // 3行目：2set
    appendPastRecordCell("2set");
    appendPastRecordCell(getPastRecordSetText(displayRecords[0], 2));
    appendPastRecordCell(getPastRecordSetText(displayRecords[1], 2));
    appendPastRecordCell(getPastRecordSetText(displayRecords[2], 2));

    // 4行目：3set
    appendPastRecordCell("3set");
    appendPastRecordCell(getPastRecordSetText(displayRecords[0], 3));
    appendPastRecordCell(getPastRecordSetText(displayRecords[1], 3));
    appendPastRecordCell(getPastRecordSetText(displayRecords[2], 3));
}


/* ==============================
   直近3回グリッドのセルを追加する関数
============================== */

function appendPastRecordCell(text) {
    const cell = document.createElement("div");
    cell.textContent = text;
    referencePastRecordsBox.appendChild(cell);
}


/* ==============================
   直近記録の日付表示を作る関数
============================== */

function getPastRecordDateText(record) {
    if (!record) {
        return "-";
    }

    return record.date;
}


/* ==============================
   指定セットの重量・回数表示を作る関数
============================== */

function getPastRecordSetText(record, setNumber) {
    if (!record || !record.sets) {
        return "-";
    }

    const targetSet = record.sets.find((set) => {
        return set.set === setNumber;
    });

    if (!targetSet) {
        return "-";
    }

    return `${targetSet.weight}kg/${targetSet.reps}回`;
}


/* ==============================
   セット表示文字列を作る
============================== */

function createSetsDisplayText(sets) {
    if (!sets || sets.length === 0) {
        return "-";
    }

    return sets.map((set) => {
        return `${set.set}set ${set.weight}kg × ${set.reps}回`;
    }).join(" / ");
}


/* ==============================
   過去記録の最新重量を入力欄へ反映
============================== */

function setLatestWeightFromRecentRecords(recentRecords) {

    if (recentRecords.length === 0) {
        return;
    }

    const latestRecord = recentRecords[0];

    if (!latestRecord.sets || latestRecord.sets.length === 0) {
        return;
    }

    const firstSet = latestRecord.sets[0];

    if (firstSet.weight === null || firstSet.weight === undefined) {
        return;
    }

    setWeightInputs(firstSet.weight);
}


/* ==============================
   1〜3セット目の重量をまとめて設定
============================== */

function setWeightInputs(weightValue) {
    const weightText = Number(weightValue).toFixed(1);

    referenceSet1Weight.value = weightText;
    referenceSet2Weight.value = weightText;
    referenceSet3Weight.value = weightText;
}


/* ==============================
   回数入力を未実施へ戻す
============================== */

function resetRepsInputs() {
    referenceSet1Reps.value = "";
    referenceSet2Reps.value = "";
    referenceSet3Reps.value = "";
}


/* ==============================
   入力チェック
============================== */

function validateTrainingInput() {
    if (referenceSet1Reps.value === "") {
        alert("1セット目の回数を入力してください。");
        return false;
    }

    return true;
}


/* ==============================
   編集中の入力確定ボタン制御
============================== */

function updateAddButtonState() {
    if (isEditingRecord) {
        referenceAddButton.disabled = true;
        referenceAddButton.textContent = "編集中は追加できません";
        return;
    }

    referenceAddButton.disabled = false;
    referenceAddButton.textContent = "入力を確定する";
}


/* ==============================
   入力確定
============================== */

function addTrainingRecord() {
    if (isEditingRecord) {
        alert("編集中の記録があります。編集完了またはキャンセルしてから入力してください。");
        return;
    }

    if (!validateTrainingInput()) {
        return;
    }

    const dateValue = referenceDateInput.value;
    const bodyWeightValue = Number(referenceBodyWeightInput.value);

    const partValue = referenceBodyPartSelect.value;
    const exerciseIdValue = referenceExerciseSelect.value;

    const selectedExercise = getSelectedExerciseData();

    if (!selectedExercise) {
        alert("種目が選択されていません。");
        return;
    }

    const exerciseName = selectedExercise.name;
    const exerciseTypeValue = referenceExerciseTypeSelect.value;

    const recordId = getNextRecordIdByDate(dateValue);

    const sets = createInputSets();

    const trainingRecord = {
        id: recordId,
        date: dateValue,
        part: partValue,
        exerciseId: exerciseIdValue,
        exercise: exerciseName,
        type: exerciseTypeValue,
        unit: "kg",
        bodyWeight: bodyWeightValue,
        sets: sets,
        note: ""
    };

    appRecords.push(trainingRecord);

    sortAppRecordsLatestFirst();

    saveAppDataWithUpdateTime();

    showSelectedDateRecords();
    getReferenceRecordsBySelectedExercise();

    resetRepsInputs();

    showAddButtonFeedback();
}


/* ==============================
   入力欄からセット配列を作る
============================== */

function createInputSets() {
    const sets = [];

    if (referenceSet1Reps.value !== "") {
        sets.push({
            set: 1,
            weight: Number(referenceSet1Weight.value),
            reps: Number(referenceSet1Reps.value)
        });
    }

    if (referenceSet2Reps.value !== "") {
        sets.push({
            set: 2,
            weight: Number(referenceSet2Weight.value),
            reps: Number(referenceSet2Reps.value)
        });
    }

    if (referenceSet3Reps.value !== "") {
        sets.push({
            set: 3,
            weight: Number(referenceSet3Weight.value),
            reps: Number(referenceSet3Reps.value)
        });
    }

    return sets;
}


/* ==============================
   保存ボタンのフィードバック
============================== */

function showAddButtonFeedback() {
    referenceAddButton.textContent = "保存しました";
    referenceAddButton.classList.add("is-saved");
    referenceAddButton.disabled = true;

    if (navigator.vibrate) {
        navigator.vibrate(80);
    }

    setTimeout(() => {
        referenceAddButton.textContent = "入力を確定する";
        referenceAddButton.classList.remove("is-saved");
        referenceAddButton.disabled = false;
    }, 800);
}


/* ==============================
   選択日の記録を表示
============================== */

function showSelectedDateRecords() {
    updateSelectedDateRecordsTitle();

    const selectedDate = referenceDateInput.value;
    const selectedDateRecords = getSelectedDateRecords(selectedDate);

    selectedDateRecordsBox.innerHTML = "";

    if (selectedDateRecords.length === 0) {
        const emptyText = document.createElement("p");
        emptyText.textContent = "この日付の記録はありません。";
        selectedDateRecordsBox.appendChild(emptyText);
        return;
    }

    selectedDateRecords.forEach((record) => {
        const recordCard = createSelectedDateRecordCard(record);
        selectedDateRecordsBox.appendChild(recordCard);
    });
}


/* ==============================
   選択日の記録タイトルを更新
============================== */

function updateSelectedDateRecordsTitle() {
    const selectedDate = referenceDateInput.value;

    if (!selectedDate) {
        selectedDateRecordsTitle.textContent = "選択日の記録";
        return;
    }

    selectedDateRecordsTitle.textContent = `${selectedDate} の記録`;
}


/* ==============================
   選択日の記録カードを作る
============================== */

function createSelectedDateRecordCard(record) {
    const card = document.createElement("div");
    card.classList.add("selected-date-record-card");

    const title = document.createElement("p");
    title.classList.add("selected-date-record-title");
    title.textContent = record.exercise;

    const setsBox = document.createElement("div");
    setsBox.classList.add("selected-date-record-sets-box");

    record.sets.forEach((set) => {
        const setLine = createSelectedDateSetLine(set);
        setsBox.appendChild(setLine);
    });

    const buttonBox = document.createElement("div");
    buttonBox.classList.add("selected-date-record-buttons");

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "編集";
    editButton.addEventListener("click", () => {
        showEditRecordForm(record.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "削除";
    deleteButton.classList.add("danger-button");
    deleteButton.addEventListener("click", () => {
        deleteSelectedDateRecord(record.id);
    });

    buttonBox.appendChild(editButton);
    buttonBox.appendChild(deleteButton);

    card.appendChild(title);
    card.appendChild(setsBox);
    card.appendChild(buttonBox);

    return card;
}


/* ==============================
   選択日の記録カード内の
   セット表示を作る関数
============================== */

function createSelectedDateSetLine(set) {
    const setLine = document.createElement("p");
    setLine.classList.add("selected-date-record-set-line");

    setLine.textContent = `${set.set}set：${set.weight}kg × ${set.reps}回`;

    return setLine;
}


/* ==============================
   編集フォームを表示
   編集対象：重量・回数のみ
============================== */

function showEditRecordForm(recordId) {
    const record = findRecordById(recordId);

    if (!record) {
        alert("編集対象の記録が見つかりません。");
        return;
    }

    // 編集中にする
    isEditingRecord = true;
    updateAddButtonState();

    selectedDateRecordsBox.innerHTML = "";

    const formBox = document.createElement("div");
    formBox.classList.add("edit-record-box");

    const title = document.createElement("h3");
    title.textContent = record.exercise + " の編集";

    formBox.appendChild(title);

    record.sets.forEach((set) => {
        const setBox = document.createElement("div");
        setBox.classList.add("edit-set-box");

        const setTitle = document.createElement("p");
        setTitle.textContent = set.set + "セット目";

        const weightLabel = document.createElement("label");
        weightLabel.textContent = "重量";

        const weightSelect = createEditWeightSelect(set);

        const repsLabel = document.createElement("label");
        repsLabel.textContent = "回数";

        const repsSelect = createEditRepsSelect(set);

        setBox.appendChild(setTitle);
        setBox.appendChild(weightLabel);
        setBox.appendChild(weightSelect);
        setBox.appendChild(repsLabel);
        setBox.appendChild(repsSelect);

        formBox.appendChild(setBox);
    });

    const buttonBox = document.createElement("div");
    buttonBox.classList.add("edit-record-buttons");

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = "編集完了";
    saveButton.addEventListener("click", () => {
        saveEditedRecord(recordId);
    });

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "キャンセル";
    cancelButton.addEventListener("click", () => {
        isEditingRecord = false;
        updateAddButtonState();

        showSelectedDateRecords();
    });

    buttonBox.appendChild(saveButton);
    buttonBox.appendChild(cancelButton);

    formBox.appendChild(buttonBox);

    selectedDateRecordsBox.appendChild(formBox);
}


/* ==============================
   編集用の重量セレクトを作る関数
   0.5kg刻みのみ選択可能
============================== */

function createEditWeightSelect(set) {
    const select = document.createElement("select");

    select.dataset.setNumber = set.set;
    select.dataset.inputType = "weight";

    for (let weight = 0; weight <= 100; weight += 0.5) {
        const option = document.createElement("option");

        option.value = weight.toFixed(1);
        option.textContent = weight.toFixed(1) + "kg";

        if (Number(set.weight) === Number(weight.toFixed(1))) {
            option.selected = true;
        }

        select.appendChild(option);
    }

    return select;
}


/* ==============================
   編集用の回数セレクトを作る関数
============================== */

function createEditRepsSelect(set) {
    const select = document.createElement("select");

    select.dataset.setNumber = set.set;
    select.dataset.inputType = "reps";

    for (let reps = 1; reps <= 50; reps++) {
        const option = document.createElement("option");

        option.value = reps;
        option.textContent = reps + "回";

        if (Number(set.reps) === reps) {
            option.selected = true;
        }

        select.appendChild(option);
    }

    return select;
}


/* ==============================
   編集内容を保存
   保存対象：重量・回数のみ
============================== */

function saveEditedRecord(recordId) {
    const record = findRecordById(recordId);

    if (!record) {
        alert("編集対象の記録が見つかりません。");
        return;
    }

    const editInputs = selectedDateRecordsBox.querySelectorAll("select");

    editInputs.forEach((input) => {
        const setNumber = Number(input.dataset.setNumber);
        const inputType = input.dataset.inputType;

        const targetSet = record.sets.find((set) => {
            return set.set === setNumber;
        });

        if (!targetSet) {
            return;
        }

        if (inputType === "weight") {
            targetSet.weight = Number(input.value);
        }

        if (inputType === "reps") {
            targetSet.reps = Number(input.value);
        }
    });

    sortAppRecordsLatestFirst();

    saveAppDataWithUpdateTime();

    // 編集中を解除
    isEditingRecord = false;
    updateAddButtonState();

    showSelectedDateRecords();
    getReferenceRecordsBySelectedExercise();
}


/* ==============================
   選択日の記録を削除
============================== */

function deleteSelectedDateRecord(recordId) {
    const confirmed = confirm(
        "この記録を削除します。\n削除後はスマホ内データから消えます。\nよろしいですか？"
    );

    if (!confirmed) {
        return;
    }

    const deleted = deleteRecordById(recordId);

    if (!deleted) {
        alert("削除対象の記録が見つかりません。");
        return;
    }

    showSelectedDateRecords();
    getReferenceRecordsBySelectedExercise();
}


/* ==============================
   バックアップJSON保存
============================== */

function downloadBackupJson() {
    sortAppRecordsLatestFirst();

    const exportedAt = getCurrentDateTimeText();

    const backupData = {
        meta: {
            appVersion: appMeta.appVersion || "1.1.0",
            dataVersion: appMeta.dataVersion || "1.1.0",
            updatedAt: appMeta.updatedAt || "",
            exportedAt: exportedAt
        },
        records: appRecords
    };

    const jsonText = JSON.stringify(backupData, null, 2);

    const bom = "\uFEFF";

    const blob = new Blob([bom + jsonText], {
        type: "application/json;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);

    const fileName = createBackupFileName();

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
}


/* ==============================
   バックアップファイル名を作る
============================== */

function createBackupFileName() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");

    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");

    const dataVersion = appMeta.dataVersion || "1.1.0";

    return `training-records-backup-v${dataVersion}-${year}-${month}-${date}-${hour}${minute}.json`;
}


/* ==============================
   JSONから再インポート
============================== */

async function reimportFromJson() {
    const confirmed = confirm(
        "現在のスマホ内データを削除し、training-records-v1.1.0.json の内容で再インポートします。\n\n実行前にバックアップJSONを保存していることを確認してください。\n\n再インポートしますか？"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch("training-records-v1.1.0.json");

        if (!response.ok) {
            alert("training-records.json の読み込みに失敗しました。");
            return;
        }

        const jsonData = await response.json();

        clearAppData();

        const imported = importRecordsFromJson(jsonData);

        if (!imported) {
            return;
        }

        sortAppRecordsLatestFirst();
        saveAppData();

        // 再インポート後は編集状態を解除
        isEditingRecord = false;
        updateAddButtonState();

        showSelectedDateRecords();
        getReferenceRecordsBySelectedExercise();

        alert("再インポートしました。");

    } catch (error) {
        console.error("再インポートに失敗しました。", error);
        alert("再インポートに失敗しました。");
    }
}