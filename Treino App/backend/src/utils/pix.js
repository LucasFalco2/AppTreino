const QRCode = require("qrcode");

function emv(id, value) {
  const s = String(value);
  return id + String(s.length).padStart(2, "0") + s;
}
function crc16(payload) {
  let crc = 0xffff;
  for (let i=0;i<payload.length;i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j=0;j<8;j++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4,"0");
}
function buildPixPayload({ key, name, city, amount, txid }) {
  if (!key) throw new Error("PIX_KEY não configurada.");
  const merchant = emv("00","BR.GOV.BCB.PIX") + emv("01", key);
  const mai = emv("26", merchant);
  const payload =
    emv("00","01") + mai + emv("52","0000") + emv("53","986") +
    (amount > 0 ? emv("54", Number(amount).toFixed(2)) : "") +
    emv("58","BR") + emv("59", String(name).slice(0,25).toUpperCase()) +
    emv("60", String(city).slice(0,15).toUpperCase()) +
    emv("62", emv("05", String(txid).slice(0,25))) + "6304";
  return payload + crc16(payload);
}
async function makePix({ key, name, city, amount, txid }) {
  const payload = buildPixPayload({key,name,city,amount,txid});
  return { payload, qrDataUrl: await QRCode.toDataURL(payload, { margin: 1, width: 360 }) };
}
module.exports = { makePix };
