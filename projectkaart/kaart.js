(() => {
  const rows = [...document.querySelectorAll('#projects li')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const reset = document.querySelector('#reset');
  const count = document.querySelector('#count');
  const overview = document.querySelector('#overview');
  const status = document.querySelector('#status');
  let category = 'all';
  let selectedGroup = null;
  let map, markers;

  function matches(row) {
    return category === 'all' || row.dataset.type === category;
  }
  function updateList() {
    const visible = rows.filter(row => matches(row) && (!selectedGroup || selectedGroup.includes(row)));
    rows.forEach(row => { row.hidden = !visible.includes(row); });
    count.textContent = visible.length + (visible.length === 1 ? ' project' : ' projecten');
    reset.hidden = !selectedGroup;
    document.querySelector('#projects').scrollTop = 0;
  }
  function locationOf(row) {
    return [Number(row.dataset.lat), Number(row.dataset.lon)];
  }
  function inView() {
    return rows.filter(row => matches(row) && row.hasAttribute('data-lat'));
  }
  function fit(rowsToFit) {
    if (map && rowsToFit.length) map.fitBounds(rowsToFit.map(locationOf), {padding:[35,35], maxZoom:16, animate:false});
  }
  function renderMarkers() {
    if (!map) return;
    markers.clearLayers();
    const groups = [];
    for (const row of inView()) {
      const point = map.project(locationOf(row));
      const nearby = groups.find(group => group.point.distanceTo(point) < 42);
      if (nearby) nearby.rows.push(row);
      else groups.push({point,rows:[row]});
    }
    for (const group of groups) {
      const items = group.rows;
      const row = items[0];
      const single = items.length === 1;
      const title = single ? row.querySelector('a span').firstChild.textContent : items.length + ' projecten bekijken';
      const colors = {wonen:'#f58e84',interieur:'#f8ed43',techniek:'#7a4456'};
      let percentage = 0;
      const stops = Object.entries(colors).flatMap(([type,color]) => {
        const amount = items.filter(item => item.dataset.type === type).length;
        if (!amount) return [];
        const start = percentage;
        percentage += 100 * amount / items.length;
        return [color+' '+start+'% '+percentage+'%'];
      });
      const ring = stops.length > 1 ? 'conic-gradient('+stops.join(',')+')' : colors[row.dataset.type];
      const icon = L.divIcon({
        className:'map-pin',
        html:single ? '<span class="symbol '+row.dataset.type+'"></span>' : '<span class="cluster" style="background:'+ring+'"><b>'+items.length+'</b></span>',
        iconSize:single ? [22,22] : [32,32]
      });
      const marker = L.marker(locationOf(row), {icon,title,alt:title}).addTo(markers);
      marker.getElement().setAttribute('aria-label', title);
      marker.on('click', () => {
        if (single) { location.assign(row.querySelector('a').href); return; }
        selectedGroup = items;
        updateList();
        fit(items);
        const first = row.querySelector('a');
        first.focus({preventScroll:true});
        if (matchMedia('(max-width:720px)').matches) count.scrollIntoView({block:'start'});
      });
    }
  }
  function resetView() {
    selectedGroup = null;
    updateList();
    fit(inView());
    renderMarkers();
  }
  for (const button of filters) button.addEventListener('click', () => {
    category = button.dataset.filter;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    resetView();
  });
  reset.addEventListener('click', resetView);
  overview.addEventListener('click', resetView);
  updateList();
  if (!window.L) {
    status.textContent = 'De kaart is niet beschikbaar. Open een project in de lijst.';
    status.hidden = false;
    return;
  }
  map = L.map('map', {minZoom:6,maxZoom:19,zoomControl:false,scrollWheelZoom:false});
  L.control.zoom({position:'bottomright',zoomInTitle:'Inzoomen',zoomOutTitle:'Uitzoomen'}).addTo(map);
  let tileLoaded = false;
  L.tileLayer('https://service.pdok.nl/kadaster/brt-achtergrondkaart/wmts/v2_0/grijs/EPSG:3857/{z}/{x}/{y}.png', {
    maxNativeZoom:19,maxZoom:19,attribution:'Kaart: <a href="https://www.pdok.nl/">Kadaster / PDOK</a>'
  }).on('tileload', () => { tileLoaded = true; status.hidden = true; })
    .on('tileerror', () => {
      if (!tileLoaded) { status.textContent = 'De onderkaart is tijdelijk niet beschikbaar.'; status.hidden = false; }
    }).addTo(map);
  markers = L.layerGroup().addTo(map);
  resetView();
  map.on('zoomend', renderMarkers);
})();
