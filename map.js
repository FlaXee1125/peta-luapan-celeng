'use strict';
(async function () {
  const message = document.getElementById('message');
  try {
    if (!window.L) throw new Error('Leaflet belum termuat. Periksa koneksi internet.');
    const response = await fetch('data.json', {cache: 'no-cache'});
    if (!response.ok) throw new Error(`Data penampang tidak dapat dimuat (${response.status}).`);
    const data = await response.json();
    const sections = data.sections;
    const n = x => Number(x).toLocaleString('id-ID', {minimumFractionDigits: 3, maximumFractionDigits: 3});
    const statusText = r => r.status === 'melimpas' ? 'Terindikasi luapan' : 'Tidak terindikasi luapan';
    const color = r => r.status === 'melimpas' ? '#dc3545' : '#168755';
    const asLatLng = xy => [xy[1], xy[0]];
    const map = L.map('map', {preferCanvas: true, scrollWheelZoom: true});
    const popupWidth = Math.max(180, Math.min(330, document.getElementById('map').clientWidth - 70));
    const popupOptions = {maxWidth: popupWidth, minWidth: Math.min(245, popupWidth)};
    const basemap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    const river = L.polyline(data.river_lonlat.map(asLatLng), {color: '#1977b6', weight: 3, opacity: .8}).addTo(map);
    const cuts = L.layerGroup().addTo(map);
    const bankOver = L.layerGroup().addTo(map);
    const bankAll = L.layerGroup();
    const points = L.layerGroup().addTo(map);
    const markers = new Map();
    const byRS = new Map(sections.map(r => [r.RS, r]));
    let filter = 'all';
    const bounds = L.latLngBounds(sections.map(r => [r.latitude, r.longitude]));
    map.fitBounds(bounds.pad(.08));
    L.control.scale({imperial: false}).addTo(map);
    L.control.layers({'OpenStreetMap': basemap}, {'Alur Kali Celeng': river, 'Garis penampang': cuts, '19 titik tebing melimpas': bankOver, 'Seluruh titik tebing (194)': bankAll}, {collapsed: true}).addTo(map);
    function popup(r) {
      const overflow = r.status === 'melimpas';
      return `<h3>RS ${r.RS}</h3><div class="popup-status ${overflow ? 'red' : 'green'}">${statusText(r)}</div>` +
        (r.RS === 4900 ? '<p>Samping Polsek Imogiri</p>' : '') +
        `<div class="popup-grid"><span>MAB maksimum</span><span>+${n(r.MAB_m)} m</span><span>Tebing kiri</span><span>+${n(r.tebing_kiri_m)} m</span><span>Tebing kanan</span><span>+${n(r.tebing_kanan_m)} m</span><span>Sisi terlampaui</span><span>${r.sisi}</span><span>Kelebihan maks.</span><span>${n(r.kelebihan_m)} m</span></div>` +
        `<p>${r.latitude.toFixed(7)}, ${r.longitude.toFixed(7)}</p><div class="popup-links"><a href="${r.google_maps}" target="_blank" rel="noopener">Buka Google Maps ↗</a>` +
        (r.gambar_penampang ? `<a href="${r.gambar_penampang}" target="_blank" rel="noopener">Plot asli HEC-RAS ↗</a>` : '') +
        '</div><p class="popup-note">Kiri/kanan dilihat ke hilir. Pin adalah lokasi model, bukan luas genangan.</p>';
    }
    for (const r of sections) {
      const marker = L.circleMarker([r.latitude, r.longitude], {radius: 6, color: 'white', weight: 1.5, fillColor: color(r), fillOpacity: 1});
      marker.bindPopup(popup(r), popupOptions);
      marker.bindTooltip(`RS ${r.RS}`, {permanent: true, direction: 'right', className: 'rs-label', offset: [7, 0]});
      markers.set(r.RS, marker);
    }
    function showRS(rs) {
      const r = byRS.get(rs);
      if (!r) { message.textContent = `RS ${rs} tidak ditemukan. Gunakan RS 100–9700 dengan interval 100 m.`; return; }
      if (filter !== 'all' && filter !== r.status) setFilter('all');
      map.setView([r.latitude, r.longitude], 18);
      markers.get(rs).openPopup();
      document.querySelectorAll('tbody tr').forEach(tr => tr.classList.toggle('highlight', Number(tr.dataset.rs) === rs));
      message.textContent = `RS ${rs} · ${statusText(r)}${r.sisi !== '—' ? ' · Tebing ' + r.sisi.toLowerCase() : ''}.`;
      document.getElementById('map').scrollIntoView({behavior: 'smooth', block: 'center'});
    }
    function render() {
      points.clearLayers(); cuts.clearLayers(); bankOver.clearLayers(); bankAll.clearLayers();
      const visible = sections.filter(r => filter === 'all' || r.status === filter);
      const ids = new Set(visible.map(r => r.RS));
      for (const r of visible) {
        markers.get(r.RS).addTo(points);
        L.polyline(r.cutline_lonlat.map(asLatLng), {color: color(r), weight: 1.4, opacity: .55}).bindPopup(popup(r), popupOptions).addTo(cuts);
      }
      for (const b of data.banks) {
        if (!ids.has(b.RS)) continue;
        const bp = `<h3>RS ${b.RS} · Tebing ${b.sisi.toLowerCase()}</h3><p class="${b.melimpas ? 'red' : 'green'}"><strong>${b.melimpas ? 'Terindikasi melimpas' : 'Tidak terindikasi melimpas'}</strong></p><p>MAB +${n(b.MAB_m)} m<br>Tebing +${n(b.elevasi_tebing_m)} m<br>Kelebihan ${n(b.kelebihan_m)} m</p><p><a href="${b.google_maps}" target="_blank" rel="noopener">Buka titik tebing di Google Maps ↗</a></p>`;
        const options = {radius: 4, color: b.melimpas ? '#b41e31' : '#168755', weight: 1.5, fillColor: 'white', fillOpacity: 1};
        L.circleMarker([b.latitude,b.longitude], options).bindPopup(bp, popupOptions).addTo(bankAll);
        if (b.melimpas) L.circleMarker([b.latitude,b.longitude], {...options, radius: 5, fillColor: '#dc3545'}).bindPopup(bp, popupOptions).addTo(bankOver);
      }
      const tbody = document.getElementById('station-table');
      tbody.innerHTML = visible.map(r => `<tr data-rs="${r.RS}"><td><button type="button" data-rs="${r.RS}">RS ${r.RS}</button></td><td class="${r.status === 'melimpas' ? 'red' : 'green'}">${statusText(r)}</td><td>${r.sisi}</td><td>${n(r.MAB_m)}</td><td>${n(r.tebing_kiri_m)}</td><td>${n(r.tebing_kanan_m)}</td><td>${n(r.kelebihan_m)}</td><td><a href="${r.google_maps}" target="_blank" rel="noopener">Google Maps ↗</a></td></tr>`).join('');
      message.textContent = `Menampilkan ${visible.length} dari 97 penampang. ${filter === 'all' ? '17 terindikasi luapan · 80 tidak terindikasi luapan.' : ''}`;
      document.getElementById('list-title').textContent = filter === 'all' ? 'Daftar seluruh penampang' : filter === 'melimpas' ? 'Penampang terindikasi luapan' : 'Penampang tidak terindikasi luapan';
    }
    function setFilter(next) {
      filter = next;
      document.querySelectorAll('[data-filter]').forEach(b => {const active = b.dataset.filter === filter; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active));});
      render();
    }
    document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => setFilter(b.dataset.filter)));
    document.getElementById('station-table').addEventListener('click', e => {const button = e.target.closest('button[data-rs]'); if (button) showRS(Number(button.dataset.rs));});
    document.getElementById('search-form').addEventListener('submit', e => {e.preventDefault(); const value = document.getElementById('rs-search').value.replace(/[^0-9.]/g, ''); if (value) showRS(Math.round(Number(value)));});
    document.getElementById('focus-4900').addEventListener('click', () => showRS(4900));
    document.getElementById('labels').addEventListener('change', e => document.getElementById('map').classList.toggle('labels-on', e.target.checked));
    document.getElementById('show-all').addEventListener('click', () => {setFilter('all');map.fitBounds(bounds.pad(.08));map.closePopup();});
    document.getElementById('bank-table').innerHTML = data.banks.filter(b => b.melimpas).sort((a,b) => b.RS-a.RS || (a.sisi === 'Kiri' ? -1 : 1)).map(b => `<tr><td>RS ${b.RS}</td><td>${b.sisi === 'Kiri' ? 'Ki' : 'Ka'}</td><td>${n(b.kelebihan_m)}</td><td>${b.longitude.toFixed(7)}</td><td>${b.latitude.toFixed(7)}</td><td><a href="${b.google_maps}" target="_blank" rel="noopener">Google Maps ↗</a></td></tr>`).join('');
    render();
    // Small read-only diagnostic surface for verifying deployed data and map layer counts.
    window.celengMap = {map, data, points, cuts, bankOver, bankAll, getFilter: () => filter};
  } catch (error) { message.classList.add('error'); message.textContent = error.message; console.error(error); }
})();

