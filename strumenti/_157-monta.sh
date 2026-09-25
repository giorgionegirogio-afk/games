set -e
cd "$(dirname "$0")/.."
SRC="${2:-fuori/157-base.html}"
OUT="${1:-fuori/157a.html}"
node strumenti/_toppa-157-quadro.js --da "$SRC" --out fuori/_t1.html >/dev/null
node strumenti/_toppa-157-valore.js --da fuori/_t1.html --out fuori/_t2.html >/dev/null
node strumenti/_toppa-157-verbi.js  --da fuori/_t2.html --out fuori/_t3.html >/dev/null
node strumenti/_toppa-157-peso.js   --da fuori/_t3.html --out "$OUT" >/dev/null
rm -f fuori/_t1.html fuori/_t2.html fuori/_t3.html
echo "montato: $OUT (da $SRC)"
