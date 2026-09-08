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

## 🚀 Cara Pakai

### Versi web (development)
Buka `index.html` langsung di browser (atau `npx serve .`).

1. Isi **Tanggal lahir** dan **Tanggal race day** (terisi otomatis dari racecard bila ada).
2. Tempel **URL racecard** (`https://en.netkeiba.com/race/shutuba.html?race_id=...` atau `https://umanity.jp/.../race_*.php?code=...`) → klik **Ambil Data**.
   - Jika diblokir CORS/WAF, gunakan **Fallback: tempel HTML** atau jalankan proxy lokal:
     ```bash
     node proxy.js   # http://localhost:8080
     ```
3. Atau klik **Muat Contoh Race (12 kuda)** / isi tabel manual.
4. Klik **Lihat Ramalanku** → hasil, kombinasi, BOX, dan peta waku muncul.
5. **Salin Tiket** / **Salin BOX** untuk share.

### Versi single-file (HP)
Buka `hatono-haron.html` — 1 file, offline kecuali auto-fetch. Kirim via WA/Telegram/USB, buka di Chrome/Safari, *Add to Home Screen* untuk akses seperti aplikasi.

Regenerate setelah edit source:
```bash
python scratch/build-single.py
```

## 🛠️ Teknologi

- **Vanilla HTML/CSS/JS** — tanpa framework, tanpa build step.
- Parser DOM (`DOMParser`) untuk netkeiba & umanity, parser markdown untuk Jina Reader.
- Seeded RNG (`mulberry32` + `xmur3`-style hash) untuk ranking & kombinasi yang reproduksibel.
- Proxy CORS lokal Node.js (`proxy.js`, stdlib `http`/`https` saja).

## 📁 Struktur

```
Hatono Haron Engine/
├── index.html          # Entry point (dev, multi-file)
├── styles.css          # Professional dark theme
├── app.js              # Engine: zodiak, ranking, fetch, parser, kombinasi, render
├── proxy.js            # CORS proxy lokal (node proxy.js)
├── logo.jpg            # Logo banner 3254×1312
├── logo-small.jpg      # Logo terkompresi untuk build single-file
├── hatono-haron.html   # Build single-file HP (generated)
└── scratch/
    └── build-single.py # Script build: gabung HTML+CSS+JS+logo → hatono-haron.html
```

## ⚠️ Disclaimer

Hiburan berbasis zodiak & angka acak deterministik — **bukan jaminan menang**. Bertaruhlah dengan bijak (20+), jangan melebihi kemampuan. Data racecard milik **netkeiba.com / umanity.jp**. Bracket JRA: 1 Putih, 2 Hitam, 3 Merah, 4 Biru, 5 Kuning, 6 Hijau, 7 Oranye, 8 Pink. Karakter Hatono Haron © **Stellaparade Co., Ltd. / Stella Lab**.

---

## Short Description (untuk listing / sosmed)

**ID:** *Hatono Haron Engine* — web ramalan tiket JRA dari zodiak harian. Rank 1–3 TRIO, 4–6 EXACTA, 7–9 Quinella, 10–12 Wide; warna bracket & nomor hoki personal, kombinasi + BOX 5 kuda, import racecard netkeiba/umanity (auto-fetch 10 jalur / tempel HTML), single-file siap HP. Hiburan, bukan jaminan menang. 20+.

**EN:** *Hatono Haron Engine* — JRA fortune-telling for horse racing tickets based on your daily zodiac ranking. Ranks 1–3 TRIO, 4–6 EXACTA, 7–9 Quinella, 10–12 Wide; lucky bracket color & horse numbers, 3 combos + 5-horse BOX, netkeiba/umanity racecard import (10-route auto-fetch / paste-HTML fallback), single-file mobile build. For entertainment only. 20+.

### Caption Ultra-Pendek (siap copy-paste)

**X / Threads (≤280 char) — ID (275 char):**
> Hatono Haron Engine 🎲🐴 Ramalan tiket JRA dari zodiak harian — TRIO/EXACTA/Quinella/Wide, warna waku & nomor hoki, BOX 5 kuda. Import netkeiba/umanity, 1 file siap HP. Hiburan, bukan jaminan menang. 20+ #JRA #Keiba

**X / Threads (≤280 char) — EN (268 char):**
> Hatono Haron Engine 🎲🐴 JRA ticket fortune from your daily zodiac — TRIO/EXACTA/Quinella/Wide, lucky waku & numbers, 5-horse BOX. netkeiba/umanity import, single-file mobile build. For fun only, not a guarantee. 20+ #JRA #Keiba

**Instagram Bio / Tagline — ID (≤150 char, 138 char):**
> Ramalan tiket JRA dari zodiak harian 🎲 TRIO·EXACTA·Quinella·Wide + BOX 5 kuda. netkeiba/umanity → 1 file siap HP. Hiburan 20+

**Instagram Bio / Tagline — EN (≤150 char, 132 char):**
> JRA ticket fortune from your zodiac 🎲 TRIO·EXACTA·Quinella·Wide + 5-horse BOX. netkeiba/umanity → single file. For fun 20+

**Satu baris — ID (68 char):**
> Hatono Haron Engine — ramalan tiket JRA dari zodiak harian. Hiburan 20+.

**Satu baris — EN (65 char):**
> Hatono Haron Engine — JRA ticket fortune from your zodiac. For fun 20+.

