//部位選択の<select>の要素をId名で取得
const bodyPartSelect = document.getElementById("body-part");
//種目選択の<select>の要素をId名で取得
const exerciseSelect = document.getElementById("exercise");

//重量選択の<select>の要素をそれぞれId名で取得
const set1_weight = document.getElementById("set1-weight");
const set2_weight = document.getElementById("set2-weight");
const set3_weight = document.getElementById("set3-weight");

//回数選択の<select>の要素をそれぞれId名で取得
const set1_reps = document.getElementById("set1-reps");
const set2_reps = document.getElementById("set2-reps");
const set3_reps = document.getElementById("set3-reps");


//種目の<select>の中身を更新する関数
function updateExerciseSelect() {
    //種目選択の中身を空にする
    exerciseSelect.innerHTML = "";
    
    //選択された部位のvalueを取得
    const selectedPart = bodyPartSelect.value;
    
    //選択された部位に対する種目リストを取得
    const exerciseList = exercisesByPart[selectedPart];
    
    //種目リストを1つずつ<option>にして種目セレクタへ追加する
    exerciseList.forEach((exercise) => {
        
        //<option></option>の要素を作る
        const option = document.createElement("option");
        option.value = exercise.id;
        option.textContent = exercise.name;

        exerciseSelect.appendChild(option);
    });
}

//重量の<select>の中身を設定する関数
function weightNumberSetting(setNumberWeight){

    for (let weight = 0; weight <= 100; weight = weight + 0.5) {
        const option = document.createElement("option");
        option.value = weight.toFixed(1);
        option.textContent = weight.toFixed(1) + "kg";

        setNumberWeight.appendChild(option);
    }
}

//回数の<select>の中身を設定する関数
function repsNumberSetting(setNumberReps){

    const firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = "未実施";
    setNumberReps.appendChild(firstOption);

    for (let reps = 1; reps <= 50; reps = reps + 1) {
        const option = document.createElement("option");
        option.value = reps;
        option.textContent = reps + "回";

        setNumberReps.appendChild(option);
    }
}

//部位が変更されたときに種目リストを更新する
bodyPartSelect.addEventListener("change", updateExerciseSelect);

//種目の<select>初期表示
updateExerciseSelect();

//重量の<select>表示
weightNumberSetting(set1_weight);
weightNumberSetting(set2_weight);
weightNumberSetting(set3_weight);

//回数の<select>表示
repsNumberSetting(set1_reps);
repsNumberSetting(set2_reps);
repsNumberSetting(set3_reps);


//1セット目の重量が変更されたときに2セット目と3セット目の重量を同内容にする
set1_weight.addEventListener("change", () => {
    set2_weight.value = set1_weight.value;
    set3_weight.value = set1_weight.value;
});