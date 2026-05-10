//重量の<select>の中身を設定する関数
function weightNumberSetting(setNumberWeight) {

    for (let weight = 0; weight <= 100; weight = weight + 0.5) {
        const option = document.createElement("option");

        option.value = weight.toFixed(1);
        option.textContent = weight.toFixed(1) + "kg";

        setNumberWeight.appendChild(option);
    }
}


//回数の<select>の中身を設定する関数
function repsNumberSetting(setNumberReps) {

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