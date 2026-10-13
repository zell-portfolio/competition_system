/**
 * Penerima jawaban lomba -> Google Sheets.
 * Tempel di Extensions > Apps Script pada Google Sheet kamu.
 * KUNCI = indeks opsi benar (mulai dari 0), urutannya sama dengan SOAL di index.html.
 */
const KUNCI = [1, 2, 1, 3, 1];
const NAMA_SHEET = "Hasil";
const WAKTU_MULAI = new Date("2026-10-20T19:00:00+08:00"); // samakan dengan index.html
const BATAS_KIRIM = new Date("2026-10-20T21:00:00+08:00"); // batas akhir pengiriman jawaban
const TOTAL_DETIK = 105; // jumlah semua waktu soal (detik) di index.html
const HEADER = ["Waktu Kirim", "Nama", "Kode", "Skor", "Benar", "Total Soal", "Status",
  "Deteksi Online", "Pindah Tab", "Mulai (client)", "Selesai (client)", "Durasi (detik)",
  "Jawaban (indeks)", "ID Pengiriman", "Catatan"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (!d.nama || !d.kode || !Array.isArray(d.jawaban)) return out({ ok: false, pesan: "Data tidak lengkap." });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(NAMA_SHEET) || ss.insertSheet(NAMA_SHEET);
    if (sh.getLastRow() === 0) sh.appendRow(HEADER);

    const kode = String(d.kode).trim().toUpperCase();
    const rows = sh.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][2]).toUpperCase() === kode) {
        // kirim ulang dari perangkat yang sama dianggap sukses; kode dipakai orang lain ditolak
        return rows[i][13] === d.subId ? out({ ok: true }) : out({ ok: false, pesan: "Kode peserta sudah dipakai." });
      }
    }

    let benar = 0;
    KUNCI.forEach((k, i) => { if (d.jawaban[i] === k) benar++; });
    const skor = Math.round((benar / KUNCI.length) * 100);
    const status = d.alasan === "online" ? "DIHENTIKAN (online terdeteksi)"
      : d.alasan === "pindah_tab" ? "DIHENTIKAN (keluar halaman)" : "Selesai";
    const catatan = [];
    if (d.mulai < WAKTU_MULAI.getTime() - 60000) catatan.push("mulai sebelum jadwal");
    if (new Date() > BATAS_KIRIM) catatan.push("kirim terlambat");
    if (d.selesai - d.mulai > TOTAL_DETIK * 1000 + 30000) catatan.push("durasi melebihi total waktu soal");
    if (d.log && d.log.length) catatan.push("log: " + d.log.join(","));

    sh.appendRow([new Date(), d.nama, kode, skor, benar, KUNCI.length, status,
      d.pelanggaran, d.pindahTab, new Date(d.mulai), new Date(d.selesai),
      Math.round((d.selesai - d.mulai) / 1000), JSON.stringify(d.jawaban), d.subId, catatan.join("; ")]);
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, pesan: String(err) });
  } finally {
    lock.release();
  }
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
