# Peta indikasi luapan Kali Celeng Q25

Peta interaktif **97 penampang** model HEC-RAS Celeng, dengan status indikasi luapan, tautan Google Maps, dan unduhan CSV, KML, serta GeoJSON.

## Buka peta

https://flaxee1125.github.io/peta-luapan-celeng/

## Cakupan dan keterbatasan

- Peta ini menampilkan skenario Q25; hasil Q95 terpisah tidak ditampilkan pada peta ini.
- **21 penampang terindikasi luapan**, **76 tidak terindikasi luapan**; 24 titik tebing terlampaui (13 kiri, 11 kanan).
- Plan: **Celeng Q25 Lateral Merata RS200**, hasil `KaliCeleng.p10.hdf`, geometri g05, unsteady flow u03. Batas muka air hilir konstan **+16,75 m**.
- Periode simulasi: 28 Oktober 2026 00:00 sampai 29 Oktober 2026 05:00.
- Indikasi membandingkan muka air maksimum sepanjang simulasi dengan elevasi profil pada bank station kiri/kanan pada geometri hasil yang sama. Selisih positif diklasifikasikan terindikasi luapan.
- Bank station model berada pada ujung penampang (0 dan 100 m). Klasifikasi ini merujuk tebing model, bukan hasil verifikasi puncak tebing di lapangan.
- Koordinat sumber **EPSG:32749 (WGS 84 / UTM zona 49S)** dikonfirmasi dari metadata HDF, lalu dikonversi ke WGS 84 lintang/bujur. Titik RS merupakan perpotongan garis penampang dengan centerline sungai; semua 97 penampang memiliki satu perpotongan.
- Pin menunjukkan lokasi penampang dan titik tebing, bukan batas luas genangan maupun verifikasi banjir lapangan.
- Kiri/kanan dilihat ke arah hilir.
- STA/RS4900 ditandai sebagai lokasi samping Polsek Imogiri berdasarkan keterangan pengguna; hasilnya tidak terindikasi luapan.
- Delapan plot penampang asli HEC-RAS tersedia dari popup RS2400, RS2900, RS3200, RS3500, RS3900, RS4700, RS6800, dan RS7700.
- Peta dasar OpenStreetMap dan Leaflet dimuat melalui internet.

## Lokasi terindikasi luapan

RS2400; RS2700–2900; RS3200–3300; RS3500–3600; RS3800–3900; RS4700; RS5200; RS6500; RS6800–7000; RS7600–8000.

## Berkas data

- `data.json`: metadata, seluruh RS, titik tebing, dan centerline.
- `Koordinat_97_RS_Google_Maps.csv`: semua 97 lokasi dan hasil elevasi.
- `Koordinat_24_Tebing_Melimpas_Google_Maps.csv`: titik tebing yang terlampaui.
- `Lokasi_Indikasi_Luapan_Celeng.geojson`: 97 titik RS, 97 garis penampang, 194 titik tebing, dan 1 centerline (389 fitur).
- `Lokasi_Indikasi_Luapan_Celeng.kml`: seluruh RS, titik tebing melimpas, garis penampang, dan alur untuk Google Earth.

SHA-256 hasil sumber: `3afbb5b284e4ee6803e847f6316ea528e46f6242159907e36054501ce30a7fbe`.

Diperbarui 29 Oktober 2026.
