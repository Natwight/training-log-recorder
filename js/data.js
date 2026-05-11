//部位ごとの種目データ
const exercisesByPart = {
    chest: [
        { id: "ex_bench_press", name: "ベンチプレス" },
        { id: "ex_smith_bench_press", name: "スミスベンチプレス" },
        { id: "ex_chest_press", name: "チェストプレス" },
        { id: "ex_upper_chest_press", name: "アッパーチェストプレス" },
        { id: "ex_pec_fly", name: "ペックフライ" },
        { id: "ex_push_up", name: "プッシュアップ" }
    ],

    back: [
        { id: "ex_lat_pulldown", name: "ラットプルダウン" },
        { id: "ex_machine_rowing", name: "マシンローイング"},
        { id: "ex_seated_cable_rowing", name: "シーテッドケーブルローイング" },
        { id: "ex_assisted_chinning", name: "アシストチンニング" }
    ],

    shoulders: [
        { id: "ex_shoulder_press", name: "ショルダープレス" },
        { id: "ex_lateral_raise", name: "ラテラルレイズ" }
    ],

    arms: [
        { id: "ex_arm_curl", name: "アームカール" },
        { id: "ex_barbell_curl", name: "バーベルカール" }
    ],

    legs: [
        { id: "ex_squat", name: "スクワット" },
        { id: "ex_hack_squat", name: "ハックスクワット" },
        { id: "ex_45deg_leg_press", name: "45°レッグプレス" },
        { id: "ex_seated_leg_press", name: "シーテッドレッグプレス" },
        { id: "ex_leg_curl", name: "レッグカール" },
        { id: "ex_leg_extension", name: "レッグエクステンション" },
        { id: "ex_hip_abduction", name: "ヒップアブダクション（開く）" },
        { id: "ex_hip_adduction", name: "ヒップアダクション（閉じる）" }
    ],

    core: [
        { id: "ex_crunch", name: "クランチ" },
        { id: "ex_plank", name: "プランク" }
    ]
};