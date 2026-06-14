const query = '[out:json][timeout:25];\n(\nnode["amenity"~"toilets"](around:1000,52.0907,5.1214);\n);\nout center;';

fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  body: 'data=' + encodeURIComponent(query),
  headers: { 
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'HDZ-Dashboard/1.0'
  },
}).then(r => {
  console.log(r.status, r.statusText);
  return r.json();
}).then(console.log).catch(console.error);
