(() => {
  const rows = [...document.querySelectorAll('#projects li')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const dialog = document.querySelector('#catalog');
  const colors = {wonen:'#f58e84',interieur:'#f8ed43',techniek:'#7a4456'};
  let category = 'all';
  let map, markers;
  const coordinates = row => [Number(row.dataset.lat), Number(row.dataset.lon)];
  const visible = () => rows.filter(row => !row.hidden && row.hasAttribute('data-lat'));
  function fit(items) {
    if (map && items.length) map.fitBounds(items.map(coordinates), {padding:[44,54],maxZoom:17});
  }
  function select(items, position) {
    const box = document.createElement('div');
    const list = document.createElement('div');
    list.className = 'selection';
    items.forEach(row => list.append(row.querySelector('a').cloneNode(true)));
    box.append(list);
    if (items.length > 1 && items.some(row => map.distance(position,coordinates(row)) > 10)) {
      const zoom = document.createElement('button');
      zoom.className = 'zoom-group';
      zoom.textContent = 'Inzoomen op deze projecten';
      zoom.onclick = () => { map.closePopup(); fit(items); };
      box.append(zoom);
    }
    L.popup({maxWidth:285,autoPanPadding:[18,65]}).setLatLng(position).setContent(box).openOn(map);
    list.querySelector('a').focus({preventScroll:true});
  }
  function render() {
    markers.clearLayers();
    const groups = [];
    for (const row of visible()) {
      const point = map.project(coordinates(row));
      const near = groups.find(group => group.point.distanceTo(point) < 32);
      if (near) near.items.push(row);
      else groups.push({point,items:[row]});
    }
    for (const {items} of groups) {
      const row = items[0], single = items.length === 1;
      const types = [...new Set(items.map(item => item.dataset.type))];
      const ring = types.length === 1 ? colors[types[0]] : 'conic-gradient('+types.map((type,i) => colors[type]+' '+(100*i/types.length)+'% '+(100*(i+1)/types.length)+'%').join(',')+')';
      const icon = L.divIcon({className:'map-pin',iconSize:[32,32],html:single
        ? '<i class="symbol '+row.dataset.type+'"></i>'
        : '<i class="cluster" style="background:'+ring+'"></i>'});
      const marker = L.marker(coordinates(row),{icon}).addTo(markers);
      const el = marker.getElement();
      el.setAttribute('role','button');
      el.setAttribute('aria-label',single ? row.querySelector('span').firstChild.textContent : items.length+' projecten bekijken');
      marker.on('click',() => select(items,marker.getLatLng()));
    }
  }
  document.querySelector('#index').onclick = () => dialog.showModal();
  dialog.onclick = event => { if (event.target === dialog) dialog.close(); };
  function update(type) {
    category = type;
    rows.forEach(row => { row.hidden = category !== 'all' && row.dataset.type !== category; });
    document.querySelector('#count').textContent = rows.filter(row => !row.hidden).length+' projecten';
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === type)));
  }
  filters.forEach(button => button.onclick = () => {
    update(button.dataset.filter); dialog.close();
    if (map) { map.closePopup(); render(); fit(visible()); }
  });
  update('all');
  if (!window.L) { dialog.showModal(); return; }
  map = L.map('map',{minZoom:7,maxZoom:19,zoomControl:false,attributionControl:false}).setView([52.368,4.925],11);
  L.control.zoom({zoomInTitle:'Inzoomen',zoomOutTitle:'Uitzoomen'}).addTo(map);
  L.tileLayer('https://rtiles.waag.org/services/buildings/tiles/{z}/{x}/{y}.png',{
    maxNativeZoom:15,maxZoom:19,bounds:[[50.70,3.20],[53.60,7.30]],noWrap:true
  }).addTo(map);
  markers = L.layerGroup().addTo(map);
  render();
  map.on('zoomend',render);
  document.querySelector('#overview').onclick = () => { map.closePopup(); fit(visible()); };
})();
