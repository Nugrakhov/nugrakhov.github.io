# Hatono Haron Engine — JRA Fortune Racing × Zodiak Harian

> Ramalan tiket pacuan kuda **JRA** berbasis **peringkat zodiak harian**. Masukkan tanggal lahir & racecard (netkeiba / umanity), dapatkan rekomendasi tiket yang dipersonalisasi: jenis tiket, warna bracket, dan nomor kuda keberuntungan.

![Hatono Haron](logo-small.jpg)

**Karakter:** 鳩乃はろん (Hatono Haron) — *ギャンブル好き自堕落警察官* — polisi pemalas yang hobi judi dari **Stella Lab / Stellaparade Co., Ltd.**

---

## ✨ Fitur

- **Ramalan personal** — zodiak dari tanggal lahir, ranking 1–12 diacak deterministik per *race day* (seeded shuffle, hasil sama untuk tanggal yang sama).
- **Rekomendasi tiket otomatis** sesuai peringkat harian:
  | Rank | Tiket | Arti |
  |------|-------|------|
  | 1–3 | **TRIO** | Trio / Trifecta — pilih 3 kuda |
  | 4–6 | **EXACTA** | Quinella + Exacta — pilih 2 kuda (urutan) |
  | 7–9 | **Quinella** | Tanpa urutan — cukup 1-2 |
  | 10–12 | **Quinella Place (Wide)** | Keduanya masuk 3 besar |
- **Warna bracket (waku) & nomor keberuntungan** — dipetakan dari zodiak (8 warna JRA: Putih/Hitam/Merah/Biru/Kuning/Hijau/Oranye/Pink).
- **Kombinasi tiket (3 variasi)** + **varian BOX maksimal 5 kuda** — jangkar nomor lucky selalu ikut, prioritas waku lucky, sub-kombinasi kombinatorial (C(5,3) untuk TRIO, C(5,2) untuk lainnya; EXACTA di-expand 2 arah).
- **Import racecard fleksibel:**
  - **Auto-fetch** — 10 jalur fallback (direct → proxy lokal `proxy.js` → 7 proxy publik → Jina Reader `r.jina.ai`), status live per jalur.
  - **Fallback tempel HTML** — `Ctrl+U → Ctrl+A → Ctrl+C` dari halaman shutuba/race, lalu *Parse HTML Tempelan* (parser `parseNetkeiba` / `parseUmanity` / `parseShutuba` / `parseJinaMarkdown`).
  - **Input manual & edit tabel** — tambah/hapus kuda langsung di tabel.
- **Tanggal race day otomatis** — diekstrak dari URL (`race_id` / `code`), dari `<title>` / breadcrumb HTML, atau dari markdown Jina.
- **Single-file build** — `hatono-haron.html` (~124 KB, logo base64, CSS+JS inline, tanpa dependensi eksternal) siap kirim ke HP dan *Add to Home Screen*.
- **Desain profesional** — dark theme minimal, tanpa glassmorphism, tipografi rapi, responsif mobile.

## 🎲 Cara Kerja

1. **Zodiak** ditentukan dari tanggal lahir (12 zodiak dengan rentang tanggal & warna/nomor lucky masing-masing).
2. **Ranking harian** dihitung dengan `seededShuffle` dari `hash("haron-rank:" + raceDate)` — deterministik, berubah tiap hari, mencakup 12 zodiak.
3. **Jenis tiket** dipilih dari rank (`ticketForRank`).
4. **Kombinasi** diracik: nomor lucky sebagai jangkar + kuda dari waku lucky + pelengkap acak seeded dari daftar kuda racecard.

## ⚠️ Disclaimer

Hiburan berbasis zodiak & angka acak deterministik — **bukan jaminan menang**. Bertaruhlah dengan bijak (20+), jangan melebihi kemampuan. Data racecard milik **netkeiba.com / umanity.jp**. Bracket JRA: 1 Putih, 2 Hitam, 3 Merah, 4 Biru, 5 Kuning, 6 Hijau, 7 Oranye, 8 Pink. Karakter Hatono Haron © **Stellaparade Co., Ltd. / Stella Lab**.
