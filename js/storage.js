//参照用JSONから読み込んだ過去トレーニング記録
const referenceRecords = [];

//localStorageに保存する実施記録
let localTrainingRecords = [];


//localStorageから実施記録を読み込む関数
function loadLocalTrainingRecords() {
    const savedRecords = localStorage.getItem("localTrainingRecords");

    if (savedRecords === null) {
        localTrainingRecords = [];
        return;
    }

    localTrainingRecords = JSON.parse(savedRecords);
}


//localStorageに実施記録を保存する関数
function saveLocalTrainingRecords() {
    localStorage.setItem(
        "localTrainingRecords",
        JSON.stringify(localTrainingRecords)
    );
}


//参照用JSONデータをreferenceRecordsに入れる関数
function setReferenceRecords(records) {
    referenceRecords.length = 0;

    records.forEach((record) => {
        referenceRecords.push(record);
    });
}