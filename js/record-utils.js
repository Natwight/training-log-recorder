/* ==============================
   Training Log App v1.1.0
   record-utils.js
   記録データ操作用の関数
============================== */


/* ==============================
   IDから末尾番号を取り出す関数

   例：
   rec_20260610_003 → 3
============================== */

function getRecordNumberFromId(recordId) {
    if (!recordId) {
        return 0;
    }

    const parts = recordId.split("_");
    const numberText = parts[2];

    const number = Number(numberText);

    if (Number.isNaN(number)) {
        return 0;
    }

    return number;
}


/* ==============================
   同じ日付の最大ID番号 + 1 で
   次の記録IDを作る関数
============================== */

function getNextRecordIdByDate(dateValue) {
    const dateText = dateValue.replaceAll("-", "");
    const prefix = "rec_" + dateText + "_";

    let maxNumber = 0;

    appRecords.forEach((record) => {
        if (!record.id) {
            return;
        }

        if (!record.id.startsWith(prefix)) {
            return;
        }

        const recordNumber = getRecordNumberFromId(record.id);

        if (recordNumber > maxNumber) {
            maxNumber = recordNumber;
        }
    });

    const nextNumber = maxNumber + 1;
    const nextNumberText = String(nextNumber).padStart(3, "0");

    return prefix + nextNumberText;
}


/* ==============================
   appRecords を最新順に並べる関数

   保存データ用：
   ・日付は新しい順
   ・同じ日付ならID番号が大きい順
============================== */

function sortAppRecordsLatestFirst() {
    appRecords.sort((a, b) => {
        if (a.date > b.date) {
            return -1;
        }

        if (a.date < b.date) {
            return 1;
        }

        const aNumber = getRecordNumberFromId(a.id);
        const bNumber = getRecordNumberFromId(b.id);

        return bNumber - aNumber;
    });
}


/* ==============================
   選択日の記録を取得する関数

   表示用：
   ・選択された日付のみ
   ・同じ日付内では実施順に表示
   ・ID番号が小さい順
============================== */

function getSelectedDateRecords(dateValue) {
    const selectedDateRecords = appRecords.filter((record) => {
        return record.date === dateValue;
    });

    selectedDateRecords.sort((a, b) => {
        const aNumber = getRecordNumberFromId(a.id);
        const bNumber = getRecordNumberFromId(b.id);

        return aNumber - bNumber;
    });

    return selectedDateRecords;
}


/* ==============================
   過去3回表示用の記録を取得する関数

   条件：
   ・同じ exerciseId
   ・選択中の日付より前
   ・最新順に最大3件
============================== */

function getPastThreeRecordsByExercise(exerciseId, selectedDate) {
    const pastRecords = appRecords.filter((record) => {
        return (
            record.exerciseId === exerciseId &&
            record.date < selectedDate
        );
    });

    pastRecords.sort((a, b) => {
        if (a.date > b.date) {
            return -1;
        }

        if (a.date < b.date) {
            return 1;
        }

        const aNumber = getRecordNumberFromId(a.id);
        const bNumber = getRecordNumberFromId(b.id);

        return bNumber - aNumber;
    });

    return pastRecords.slice(0, 3);
}


/* ==============================
   IDから記録を探す関数
============================== */

function findRecordById(recordId) {
    return appRecords.find((record) => {
        return record.id === recordId;
    });
}


/* ==============================
   IDから記録の配列番号を探す関数
============================== */

function findRecordIndexById(recordId) {
    return appRecords.findIndex((record) => {
        return record.id === recordId;
    });
}


/* ==============================
   IDを指定して記録を削除する関数
============================== */

function deleteRecordById(recordId) {
    const recordIndex = findRecordIndexById(recordId);

    if (recordIndex === -1) {
        return false;
    }

    appRecords.splice(recordIndex, 1);

    sortAppRecordsLatestFirst();

    saveAppDataWithUpdateTime();

    return true;
}