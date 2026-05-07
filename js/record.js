//日付入力の<input>の要素をId名で取得
const trainingDateInput = document.getElementById("training-date");

//体重入力の<input>の要素をId名で取得
const bodyWeightInput = document.getElementById("body-weight");

//タイプ入力の<select>の要素をId名で取得
const exerciseTypeInput = document.getElementById("exerciseType");

//JSON書き出しボタンの<button>の要素をId名で取得
const createJsonButton = document.getElementById("create-json-button");

//JSONファイル読み込みボタンの<button>の要素をId名で取得
const uploadJsonButton = document.getElementById("upload-json-button");

//JSONファイル選択の<input>の要素をId名で取得
const jsonFileInput = document.getElementById("json-file-input");

//JSONファイル保存ボタンの<button>の要素をId名で取得
const downloadJsonButton = document.getElementById("download-json-button");

//JSON表示エリアの<pre>の要素をId名で取得
const jsonOutput = document.getElementById("json-output");

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


//JSON表示エリアを更新する関数
function updateJsonOutput() {
    //画面表示用にだけ新しい順にする
    const displayRecords = [...trainingRecords].reverse();

    jsonOutput.textContent = JSON.stringify(displayRecords, null, 2);
}


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


//JSONを読み込むボタンが押されたときの処理
uploadJsonButton.addEventListener("click", () => {
    jsonFileInput.click();
});


//JSONファイルが選択されたときの処理
jsonFileInput.addEventListener("change", () => {
    
    //ユーザーが指定したファイルの最初の1つ目(files[0])を取得する
    const file = jsonFileInput.files[0];

    //ファイルが存在していなければ処理を終える
    //これがない場合、ユーザーがファイル選択をキャンセルしても処理が続く
    if (!file) {
        return;
    }

    //選ばれたファイル名の拡張子が.jsonであるかを確認する
    if (!file.name.endsWith(".json")) {
        alert("JSONファイルを選択してください。");
        return;
    }

    //選択したファイルを読むための道具を作る
    //FileReader - 選ばれたファイルの中身をJavaScriptで読めるようにする
    const reader = new FileReader();

    //ファイルの読み込み完了時の処理をファイルを読み込む前に先書き
    reader.addEventListener("load", () => {

        //読み込んだJSON文字列をJavaScriptの配列やオブジェクトに変換する
        const loadedRecords = JSON.parse(reader.result);

        //配列の中身を空にする
        trainingRecords.length = 0;

        //空にした配列に読み込んだファイルの配列を並べていく
        loadedRecords.forEach((record) => {
            trainingRecords.push(record);
        });

        //JSON表示エリアを更新する
        updateJsonOutput();
    });

    //選択したファイルを文字列として読み込む
    //readAsText(file) - fileの中身をテキストとして読む
    //このファイルの中身を文字として読んでくださいと命令、その結果がreader.resultに入る
    reader.readAsText(file);

});

