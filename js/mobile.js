// ==============================
// スマホ用 mobile.js
// 目的：
// ・過去JSONを参照用として読み込む
// ・選択種目の直近3回を表示する
// ・実施した内容をlocalStorageへ一時保存する
// ・一時保存中の記録を表示・削除する
// ==============================


// ==============================
// 要素の取得
// ==============================

//日付入力の<input>を取得
const trainingDateInput = document.getElementById("training-date");

//体重入力の<input>を取得
const bodyWeightInput = document.getElementById("body-weight");


//参照エリア：部位選択の<select>を取得
const referenceBodyPartSelect = document.getElementById("reference-body-part");

//参照エリア：種目選択の<select>を取得
const referenceExerciseSelect = document.getElementById("reference-exercise");

//参照エリア：タイプ選択の<select>を取得
const referenceExerciseTypeSelect = document.getElementById("reference-exercise-type");

//参照エリア：直近3回分の記録を表示するエリアを取得
const referencePastRecordsGrid = document.getElementById("reference-past-records-grid");


//参照エリア：重量選択の<select>を取得
const referenceSet1Weight = document.getElementById("reference-set1-weight");
const referenceSet2Weight = document.getElementById("reference-set2-weight");
const referenceSet3Weight = document.getElementById("reference-set3-weight");

//参照エリア：回数選択の<select>を取得
const referenceSet1Reps = document.getElementById("reference-set1-reps");
const referenceSet2Reps = document.getElementById("reference-set2-reps");
const referenceSet3Reps = document.getElementById("reference-set3-reps");


//参照エリア：入力確定ボタンを取得
const referenceAddButton = document.getElementById("reference-add-button");

//参照エリア：一時保存中の記録を表示するエリアを取得
const trainingDateRecordsList = document.getElementById("training-date-records-list");

//一時記録削除ボタンを取得
const clearLocalRecordsButton = document.getElementById("clear-local-records-button");



// ==============================
// 日付・ID・セット作成系
// ==============================

//日付に初期値を入れる関数
function initDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const date = String(today.getDate()).padStart(2, "0");

    trainingDateInput.value = year + "-" + month + "-" + date;
}


//日付からIDを作成する関数
//例：2026-05-04 の1つ目 → rec_20260504_001
function createRecordId(dateValue, recordNumber) {
    const dateText = dateValue.replaceAll("-", "");
    const numberText = String(recordNumber).padStart(3, "0");

    const recordId = "rec_" + dateText + "_" + numberText;

    return recordId;
}


//同じ日付の件数から連番を作る関数
function getRecordNumberByDate(dateValue) {
    let count = 0;

    localTrainingRecords.forEach((record) => {
        if (record.date === dateValue) {
            count++;
        }
    });

    return count + 1;
}


//1セット分のデータを作る関数
//回数が未実施の場合は weight と reps に null を入れる
function createSetData(setNumber, weightSelect, repsSelect) {

    if (repsSelect.value === "") {
        return {
            set: setNumber,
            weight: null,
            reps: null
        };
    }

    return {
        set: setNumber,
        weight: Number(weightSelect.value),
        reps: Number(repsSelect.value)
    };
}



// ==============================
// 参照用JSON読み込み
// ==============================

//スマホ用：参照用JSONファイルを読み込む関数
function loadMobileReferenceJsonFile() {
    fetch("training-records.json")
        .then((response) => {
            return response.json();
        })
        .then((loadedRecords) => {
            //読み込んだ過去記録を参照用配列へ入れる
            setReferenceRecords(loadedRecords);

            //参照エリアの直近3回表示を更新する
            getReferenceRecordsBySelectedExercise();
        })
        .catch((error) => {
            console.log("参照用JSONの読み込みに失敗しました。");
            console.log(error);
        });
}



// ==============================
// 参照エリア：部位・種目・タイプ
// ==============================

//参照エリア：種目<select>の中身を更新する関数
function updateReferenceExerciseSelect() {
    referenceExerciseSelect.innerHTML = "";

    const selectedPart = referenceBodyPartSelect.value;
    const exerciseList = exercisesByPart[selectedPart];

    exerciseList.forEach((exercise) => {
        const option = document.createElement("option");

        option.value = exercise.id;
        option.textContent = exercise.name;

        referenceExerciseSelect.appendChild(option);
    });
}


//参照エリア：種目IDからタイプを判定する関数
function getReferenceExerciseType(exerciseId) {

    //アシスト系
    if (exerciseId === "ex_assisted_chinning") {
        return "assisted_bodyweight";
    }

    //自重系
    if (
        exerciseId === "ex_push_up" ||
        exerciseId === "ex_squat" ||
        exerciseId === "ex_crunch" ||
        exerciseId === "ex_plank"
    ) {
        return "bodyweight";
    }

    //それ以外はウェイト系
    return "weight";
}


//参照エリア：選択中の種目に合わせてタイプを更新する関数
function updateReferenceExerciseType() {
    const selectedExerciseId = referenceExerciseSelect.value;

    const exerciseType = getReferenceExerciseType(selectedExerciseId);

    referenceExerciseTypeSelect.value = exerciseType;
}



// ==============================
// 参照エリア：直近3回表示
// ==============================

//参照エリア：選択中の種目IDと同じ記録だけを取り出す関数
function getReferenceRecordsBySelectedExercise() {
    const selectedExerciseId = referenceExerciseSelect.value;

    const selectedExerciseRecords = referenceRecords.filter((record) => {
        return record.exerciseId === selectedExerciseId;
    });

    selectedExerciseRecords.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    const recentThreeRecords = selectedExerciseRecords.slice(0, 3);

    showReferencePastRecords(recentThreeRecords);
}


//参照エリア：直近3件の記録を表示する関数
function showReferencePastRecords(records) {
    const displayRecords = [...records].reverse();

    //3件未満の場合は、左側に空データを追加して3列にそろえる
    while (displayRecords.length < 3) {
        displayRecords.unshift(null);
    }

    referencePastRecordsGrid.innerHTML = "";

    //1行目：日付行
    referencePastRecordsGrid.innerHTML += "<div></div>";

    displayRecords.forEach((record) => {
        if (record === null) {
            referencePastRecordsGrid.innerHTML += "<div>-</div>";
        } else {
            const dateText = record.date.slice(5).replace("-", "/");
            referencePastRecordsGrid.innerHTML += `<div>${dateText}</div>`;
        }
    });

    //1set〜3setの行を作る
    for (let setNumber = 1; setNumber <= 3; setNumber++) {
        referencePastRecordsGrid.innerHTML += `<div>${setNumber}set</div>`;

        displayRecords.forEach((record) => {
            if (record === null) {
                referencePastRecordsGrid.innerHTML += "<div>-</div>";
                return;
            }

            const setData = record.sets[setNumber - 1];

            if (setData.weight === null || setData.reps === null) {
                referencePastRecordsGrid.innerHTML += "<div>-</div>";
            } else {
                const setText = setData.weight + "×" + setData.reps;
                referencePastRecordsGrid.innerHTML += `<div>${setText}</div>`;
            }
        });
    }
}



// ==============================
// localStorage：一時保存中の記録表示
// ==============================

//localStorageに残っている一時記録をすべて表示する関数
function showLocalTrainingRecords() {

    trainingDateRecordsList.innerHTML = "";

    if (localTrainingRecords.length === 0) {
        trainingDateRecordsList.innerHTML = "<p>未移行の記録はありません</p>";
        return;
    }

    localTrainingRecords.forEach((record) => {
        const recordBox = document.createElement("div");
        recordBox.classList.add("training-date-record-item");

        const setTexts = record.sets.map((setData) => {
            if (setData.weight === null || setData.reps === null) {
                return "-";
            }

            return setData.weight + "kg × " + setData.reps + "回";
        });

        recordBox.innerHTML = `
            <div class="local-record-header">
                <p><strong>${record.date} ${record.exercise}</strong></p>

                <button
                    type="button"
                    class="delete-local-record-button"
                    data-record-id="${record.id}"
                >
                    削除
                </button>
            </div>

            <p>1set：${setTexts[0]}</p>
            <p>2set：${setTexts[1]}</p>
            <p>3set：${setTexts[2]}</p>
        `;

        trainingDateRecordsList.appendChild(recordBox);
    });
}



// ==============================
// localStorage：一時記録の1件削除
// ==============================

//一時保存中の記録を1件削除する関数
function deleteLocalTrainingRecord(recordId) {
    const result = confirm("この記録を削除しますか？");

    if (!result) {
        return;
    }

    localTrainingRecords = localTrainingRecords.filter((record) => {
        return record.id !== recordId;
    });

    saveLocalTrainingRecords();

    showLocalTrainingRecords();
}


//一時保存中の記録エリア内でクリックされたときの処理
trainingDateRecordsList.addEventListener("click", (event) => {

    if (!event.target.classList.contains("delete-local-record-button")) {
        return;
    }

    const recordId = event.target.dataset.recordId;

    deleteLocalTrainingRecord(recordId);
});



// ==============================
// localStorage：一時記録の全削除
// ==============================

//一時記録削除ボタンが押されたときの処理
clearLocalRecordsButton.addEventListener("click", () => {

    const result = confirm("スマホ内の一時記録をすべて削除しますか？");

    if (!result) {
        return;
    }

    localTrainingRecords = [];

    saveLocalTrainingRecords();

    showLocalTrainingRecords();
});



// ==============================
// 入力確定処理
// ==============================

//参照エリア：入力確定ボタンが押されたときの処理
referenceAddButton.addEventListener("click", () => {
    const dateValue = trainingDateInput.value;
    const bodyWeightValue = bodyWeightInput.value === "" ? null : Number(bodyWeightInput.value);

    const partValue = referenceBodyPartSelect.value;
    const exerciseIdValue = referenceExerciseSelect.value;
    const exerciseTypeValue = referenceExerciseTypeSelect.value;
    const exerciseName = referenceExerciseSelect.options[referenceExerciseSelect.selectedIndex].textContent;

    const sets = [
        createSetData(1, referenceSet1Weight, referenceSet1Reps),
        createSetData(2, referenceSet2Weight, referenceSet2Reps),
        createSetData(3, referenceSet3Weight, referenceSet3Reps)
    ];

    const recordNumber = getRecordNumberByDate(dateValue);
    const recordId = createRecordId(dateValue, recordNumber);

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
        memo: ""
    };

    localTrainingRecords.push(trainingRecord);

    saveLocalTrainingRecords();

    showLocalTrainingRecords();
});



// ==============================
// イベント設定
// ==============================

//参照エリア：部位が変更されたときに種目リスト・タイプ・直近3回表示を更新する
referenceBodyPartSelect.addEventListener("change", () => {
    updateReferenceExerciseSelect();
    updateReferenceExerciseType();
    getReferenceRecordsBySelectedExercise();
});


//参照エリア：種目が変更されたときにタイプ・直近3回表示を更新する
referenceExerciseSelect.addEventListener("change", () => {
    updateReferenceExerciseType();
    getReferenceRecordsBySelectedExercise();
});


//参照エリア：1セット目の重量が変更されたら、2セット目と3セット目にも同じ重量を入れる
referenceSet1Weight.addEventListener("change", () => {
    referenceSet2Weight.value = referenceSet1Weight.value;
    referenceSet3Weight.value = referenceSet1Weight.value;
});



// ==============================
// 初期表示
// ==============================

//日付初期値を入れる
initDate();

//localStorageに残っている一時記録を読み込む
loadLocalTrainingRecords();

//参照エリア：種目<select>初期表示
updateReferenceExerciseSelect();

//参照エリア：タイプ<select>初期表示
updateReferenceExerciseType();

//参照エリア：重量<select>表示
weightNumberSetting(referenceSet1Weight);
weightNumberSetting(referenceSet2Weight);
weightNumberSetting(referenceSet3Weight);

//参照エリア：回数<select>表示
repsNumberSetting(referenceSet1Reps);
repsNumberSetting(referenceSet2Reps);
repsNumberSetting(referenceSet3Reps);

//localStorageに残っている一時記録をすべて表示する
showLocalTrainingRecords();

//スマホ用：参照用JSONファイルを読み込む
loadMobileReferenceJsonFile();