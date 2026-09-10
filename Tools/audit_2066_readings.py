from pathlib import Path
import json, sys

root = Path(__file__).resolve().parents[1]
master = json.loads((root/"data/kanji_master.json").read_text(encoding="utf-8"))
targets = json.loads((root/"data/reading_targets_2066.json").read_text(encoding="utf-8"))
bank = json.loads((root/"data/reviewed_problem_bank.json").read_text(encoding="utf-8"))

errors = []
if master["metadata"]["uniqueKanjiCount"] != 1026:
    errors.append("漢字マスターが1026字ではありません")
if targets["metadata"]["readingTargetCount"] != 2066:
    errors.append("読みターゲットが2066件ではありません")
if len(targets["targets"]) != 2066:
    errors.append("targets実数が2066件ではありません")
if len({x["readingTargetId"] for x in targets["targets"]}) != 2066:
    errors.append("readingTargetIdが重複しています")
if any(not x.get("firstVolume") for x in targets["targets"]):
    errors.append("初出巻が空の読みターゲットがあります")
if any(q.get("reviewStatus") != "reviewed" for q in bank["questions"]):
    errors.append("児童用問題バンクに未レビュー問題があります")

if errors:
    print("FAIL")
    for e in errors:
        print("-", e)
    sys.exit(1)

covered = sum(1 for x in targets["targets"] if x["questionCoverageStatus"] == "reviewed")
print("PASS: master integrity")
print("漢字:", master["metadata"]["uniqueKanjiCount"])
print("読みターゲット:", len(targets["targets"]))
print("現時点のレビュー済み読みターゲット:", covered)
print("今後問題化が必要:", 2066-covered)
