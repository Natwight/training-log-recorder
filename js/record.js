//日付入力の<input>の要素をId名で取得
const trainingDateInput = document.getElementById("training-date");

//体重入力の<input>の要素をId名で取得
const bodyWeightInput = document.getElementById("body-weight");

//タイプ入力の<select>の要素をId名で取得
const exerciseTypeInput = document.getElementById("exerciseType");

//JSON書き出しボタンの<button>の要素をId名で取得
const createJsonButton = document.getElementById("create-json-button");

//JSONファイル保存ボタンの<button>の要素をId名で取得
const downloadJsonButton = document.getElementById("download-json-button");

//JSON表示エリアの<pre>の要素をId名で取得
const jsonOutput = document.getElementById("json-output");

//直近3回分の記録を表示するエリアの要素をId名で取得
const pastRecordsGrid = document.getElementById("past-records-grid");

//トレーニングログを記録していく配列
const trainingRecords = [];


//初期設定
init_Date();


//日付に初期値(今日の日付データ 例 : 2026-05-04)を入力
function init_Date() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const date = String(today.getDate()).padStart(2, "0");

    trainingDateInput.value = year + "-" + month + "-" + date;
}


//日付からIDを作成する関数
//2026-05-04 の1つ目 → rec_20260504_001
//2026-05-04 の2つ目 → rec_20260504_002
function createRecordId(dateValue, recordNumber) {
    const dateText = dateValue.replaceAll("-", "");
    const numberText = String(recordNumber).padStart(3, "0");

    const recordId = "rec_" + dateText + "_" + numberText;

    return recordId;
}

//同じ日付の件数から連番を作る関数
function getRecordNumberByDate(dateValue) {
    let count = 0;

    trainingRecords.forEach((record) => {
        //配列の中から日付(date)が同じものを探す
        if (record.date === dateValue) {
            //日付が一致するものがあるほどに1足していく
            count++;
        }
    });

    //countに+1した番号が次に記載される番号になる
    return count + 1;
}


//1セット分のデータを作る関数
//回数が未設定のとき、weightとrepsにnullを入れて返す
//Number - 文字列から数値に変換する
function createSetData(setNumber, weightSelect, repsSelect) {

    //回数が未実施の場合
    if (repsSelect.value === "") {
        return {
            set: setNumber,
            weight: null,
            reps: null
        };
    }

    //回数が選択されている場合
    return {
        set: setNumber,
        weight: Number(weightSelect.value),
        reps: Number(repsSelect.value)
    };
}


//JSONファイルの初回読み込み
function loadDefaultJsonFile() {
    fetch("training-records.json")
        .then((response) => {
            return response.json();
        })
        .then((loadedRecords) => {
            trainingRecords.length = 0;

            loadedRecords.forEach((record) => {
                trainingRecords.push(record);
            });

            updateJsonOutput();
            getRecordsBySelectedExercise();
        });
}


//JSON表示エリアを更新する関数
function updateJsonOutput() {
    //画面表示用にだけ新しい順にする
    const displayRecords = [...trainingRecords].reverse();

    jsonOutput.textContent = JSON.stringify(displayRecords, null, 2);
}


//選択中の種目IDと同じ記録だけを取り出す関数
function getRecordsBySelectedExercise() {
    //現在選択されている種目IDを取得
    const selectedExerciseId = exerciseSelect.value;

    //trainingRecordsの中から、exerciseIdが同じものだけを取り出す
    //filter - 配列の中から条件に合うものだけを残す
    const selectedExerciseRecords = trainingRecords.filter((record) => {
        return record.exerciseId === selectedExerciseId;
    });

    //日付の新しい順に並べる
    selectedExerciseRecords.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    //直近3件だけ取り出す
    //slice(0, 3) - 配列の0番目～3番目の手前まで取り出す, つまり先頭から3件分(0番目, 1番目, 2番目)
    const recentThreeRecords = selectedExerciseRecords.slice(0, 3);

    //直近3件を画面に表示する
    showPastRecords(recentThreeRecords);
}


//直近3件の記録をpast-records-gridに表示する関数
function showPastRecords(records) {
    //表示用にコピーして、古い順 → 新しい順にする
    const displayRecords = [...records].reverse();

    //3件未満の場合は、左側に空データを追加して3列にそろえる
    while (displayRecords.length < 3) {
        displayRecords.unshift(null);
    }

    //一度、中身を空にする
    pastRecordsGrid.innerHTML = "";

    //1行目：日付行
    pastRecordsGrid.innerHTML += "<div></div>";

    displayRecords.forEach((record) => {
        if (record === null) {
            pastRecordsGrid.innerHTML += "<div>-</div>";
        } else {
            const dateText = record.date.slice(5).replace("-", "/");
            pastRecordsGrid.innerHTML += `<div>${dateText}</div>`;
        }
    });

    //1set〜3setの行を作る
    for (let setNumber = 1; setNumber <= 3; setNumber++) {
        pastRecordsGrid.innerHTML += `<div>${setNumber}set</div>`;

        displayRecords.forEach((record) => {
            if (record === null) {
                pastRecordsGrid.innerHTML += "<div>-</div>";
                return;
            }

            const setData = record.sets[setNumber - 1];

            if (setData.weight === null || setData.reps === null) {
                pastRecordsGrid.innerHTML += "<div>-</div>";
            } else {
                const setText = setData.weight + "×" + setData.reps;
                pastRecordsGrid.innerHTML += `<div>${setText}</div>`;
            }
        });
    }
}


//種目が変更されたときに、直近3回表示を更新する
exerciseSelect.addEventListener("change", getRecordsBySelectedExercise);

//部位が変更されたときに、直近3回表示を更新する
bodyPartSelect.addEventListener("change", () => {
    getRecordsBySelectedExercise();
});


//JSON書き出しボタンが押されたときの処理
createJsonButton.addEventListener("click", () => {
    
    //選択した日付(例 : 2026-05-20)を取得
    const dateValue = trainingDateInput.value;
    //体重値を取得, 空欄ならばnullを取得
    const bodyWeightValue = bodyWeightInput.value === "" ? null : Number(bodyWeightInput.value);
    //選択した部位(例 : chest)を取得
    const partValue = bodyPartSelect.value;
    //選択した種目(例 : ex_bench_press)を取得
    const exerciseIdValue = exerciseSelect.value;
    //選択したタイプ(ウェイト, アシスト, 自重)を取得
    const exerciseTypeValue = exerciseTypeInput.value;
    //選択した種目名(例 : ベンチプレス)を取得
    //種目<select>の中の選ばれている<option>のIndex番号のtextContentを取得
    const exerciseName = exerciseSelect.options[exerciseSelect.selectedIndex].textContent;

    //連番を作成する
    const recordNumber = getRecordNumberByDate(dateValue);

    //日付から作成したID
    const recordId = createRecordId(dateValue, recordNumber);

    //3セット分の重量と回数をsets配列にまとめる
    const sets = [
        createSetData(1, set1_weight, set1_reps),
        createSetData(2, set2_weight, set2_reps),
        createSetData(3, set3_weight, set3_reps)
    ];

    //すべてのデータを1件分の記録オブジェクトとする
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

    //配列にトレーニングログを追加
    trainingRecords.push(trainingRecord);

    //JSON表示エリアを更新する
    updateJsonOutput();

    //記録追加後に直近3回表示も更新
    getRecordsBySelectedExercise();
});


//JSONファイル保存ボタンが押されたときの処理
//JSONファイルを生成して保存する
downloadJsonButton.addEventListener("click", () => {

    //trainingRecordsをJSON文字列にする
    const jsonText = JSON.stringify(trainingRecords, null, 2);

    //JSON文字列をファイルのように扱えるデータにする
    const blob = new Blob([jsonText], { type: "application/json" });

    //そのファイルデータに一時的なURLを作成する
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    //保存されるファイル名を指定する
    link.download = "training-records.json";

    link.click();

    URL.revokeObjectURL(url);
});


//JSONファイルの読み込み
loadDefaultJsonFile();