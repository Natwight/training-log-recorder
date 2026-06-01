// 部位ごとの種目データ
const exercisesByPart = {
    chest: [
        {
            id: "ex_bench_press",
            name: "ベンチプレス",
            tempo: "2-1-2",
            memo: "胸を張り、肩甲骨を寄せたまま押す。肩がすくまないように注意。"
        },
        {
            id: "ex_smith_bench_press",
            name: "スミスベンチプレス",
            tempo: "2-1-2",
            memo: "バーの軌道が固定されているため、胸で押す感覚を意識する。肩に入りすぎないよう注意。"
        },
        {
            id: "ex_chest_press",
            name: "チェストプレス",
            tempo: "2-1-2",
            memo: "背中をパッドにつけ、胸を張って押す。戻す時も力を抜ききらない。"
        },
        {
            id: "ex_upper_chest_press",
            name: "アッパーチェストプレス",
            tempo: "2-1-2",
            memo: "上胸を狙う。肩が前に出すぎないようにし、胸を張って押す。"
        },
        {
            id: "ex_pec_fly",
            name: "ペックフライ",
            tempo: "2-1-2",
            memo: "肘を軽く曲げたまま、胸を開いて閉じる。腕ではなく胸で寄せる意識。"
        },
        {
            id: "ex_assisted_dips",
            name: "アシストディップス",
            tempo: "2-1-2",
            memo: "体をやや前傾し、胸と腕で押し上げる。肩がすくまないようにし、下ろす時もゆっくり制御する。"
        },
        {
            id: "ex_push_up",
            name: "プッシュアップ",
            tempo: "2-1-2",
            memo: "体を一直線に保つ。胸を床に近づけ、肩がすくまないようにする。"
        }
    ],

    back: [
        {
            id: "ex_lat_pulldown",
            name: "ラットプルダウン",
            tempo: "2-1-2",
            memo: "胸を軽く張り、肩をすくめずにバーを引く。腕だけで引かない。"
        },
        {
            id: "ex_seated_cable_rowing",
            name: "シーテッドケーブルローイング",
            tempo: "2-1-2",
            memo: "背中を丸めず、肘を後ろへ引く。肩甲骨を寄せる意識。"
        },
        {
            id: "ex_machine_rowing",
            name: "マシンローイング",
            tempo: "2-1-2",
            memo: "胸をパッドにつけ、肘を後ろへ引く。肩が上がらないように注意。"
        },
        {
            id: "ex_assisted_pull_up",
            name: "アシストプルアップ（順手）",
            tempo: "2-1-2",
            memo: "順手で握り、背中で体を引き上げる。肩をすくめず、肘を下げる意識。"
        },
        {
            id: "ex_assisted_chin_up",
            name: "アシストチンアップ（逆手）",
            tempo: "2-1-2",
            memo: "逆手で握り、肘を下げながら引く。腕だけで引きすぎないようにする。"
        }
    ],

    shoulders: [
        {
            id: "ex_shoulder_press",
            name: "ショルダープレス",
            tempo: "2-1-2",
            memo: "背中を反らせすぎず、肩で押し上げる。下ろす時もゆっくり制御する。"
        },
        {
            id: "ex_lateral_raise",
            name: "ラテラルレイズ",
            tempo: "2-1-2",
            memo: "肘を軽く曲げ、肩の横で持ち上げる。反動を使いすぎない。"
        }
    ],

    arms: [
        {
            id: "ex_arm_curl",
            name: "アームカール",
            tempo: "2-1-2",
            memo: "肘の位置を大きく動かさず、上腕二頭筋で持ち上げる。反動を使わない。"
        },
        {
            id: "ex_barbell_curl",
            name: "バーベルカール",
            tempo: "2-1-2",
            memo: "体を反らさず、肘を固定して上げる。下ろす時もゆっくり制御する。"
        },
        {
            id: "ex_cable_curl",
            name: "ケーブルカール",
            tempo: "2-1-2",
            memo: "肘の位置を固定し、ケーブルの張力を保ったまま持ち上げる。戻す時も力を抜ききらず、ゆっくり制御する。"
        }
    ],

    abs: [
        {
            id: "ex_abdominal_crunch",
            name: "アブドミナルクランチ",
            tempo: "2-1-2",
            memo: "腹筋を丸めるように動作する。腕や首で引かず、腹筋で上体を丸める意識。戻す時もゆっくり制御する。"
        },
        {
            id: "ex_crunch",
            name: "クランチ",
            tempo: "2-1-2",
            memo: "腹筋を丸めるように上体を起こす。首だけで起きず、腹筋で体を丸める意識。"
        }
    ],

    legs: [
        {
            id: "ex_squat",
            name: "スクワット",
            tempo: "2-1-2",
            memo: "膝とつま先の向きをそろえる。背中を丸めず、股関節から下ろす。"
        },
        {
            id: "ex_hack_squat",
            name: "ハックスクワット",
            tempo: "2-1-2",
            baseWeight: 38.5,
            memo: "記録重量は追加したプレート重量のみ。マシン自体の初期重量は38.5kg。背中をパッドにつけ、膝が内側に入らないようにする。太ももで押す意識。"
        },
        {
            id: "ex_45deg_leg_press",
            name: "45°レッグプレス",
            tempo: "2-1-2",
            memo: "腰が浮かない範囲で下ろす。膝を伸ばし切りすぎない。"
        },
        {
            id: "ex_seated_leg_press",
            name: "シーテッドレッグプレス",
            tempo: "2-1-2",
            memo: "足裏全体で押す。膝が内側に入らないように注意。"
        },
        {
            id: "ex_leg_curl",
            name: "レッグカール",
            tempo: "2-1-2",
            memo: "太もも裏を意識して曲げる。戻す時も力を抜ききらない。"
        },
        {
            id: "ex_leg_extension",
            name: "レッグエクステンション",
            tempo: "2-1-2",
            memo: "太もも前を意識して伸ばす。上で少し保持し、ゆっくり制御する。"
        },
        {
            id: "ex_hip_abduction",
            name: "ヒップアブダクション（開く）",
            tempo: "2-1-2",
            memo: "脚を外へ開く。お尻の横を意識し、反動を使わない。"
        },
        {
            id: "ex_hip_adduction",
            name: "ヒップアダクション（閉じる）",
            tempo: "2-1-2",
            memo: "脚を内側へ閉じる。内ももを意識し、ゆっくり制御する。"
        }
    ]
};