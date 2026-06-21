(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,10565,e=>{"use strict";var t=e.i(1265),n=e.i(88839);let a=null,o={300:"#3b82f6",500:"#8b5cf6",750:"#a855f7",1e3:"#6366f1",1500:"#4f46e5"},l={food:"#10b981",healthcare:"#ef4444",sanitation:"#06b6d4",transport:"#f59e0b",school:"#8b5cf6",green:"#22c55e",social:"#f97316",housing:"#6b7280"};e.s(["default",0,function({center:r,amenities:i,mapLayers:s,onMapClick:c,language:d,activeRadius:p=1e3}){let u=(0,n.useRef)(null),h=(0,n.useRef)(null),f=(0,n.useRef)([]),b=(0,n.useRef)([]),m=(0,n.useRef)(null),[g,x]=(0,n.useState)(!1);return(0,n.useEffect)(()=>{e.A(46263).then(e=>{a=e.default??e,x(!0)})},[]),(0,n.useEffect)(()=>{if(!g||!u.current||!a||h.current)return;let e=a.map(u.current,{center:[r.lat,r.lng],zoom:14,zoomControl:!0});a.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',maxZoom:19}).addTo(e),e.on("click",e=>{c({lat:e.latlng.lat,lng:e.latlng.lng})}),h.current=e,setTimeout(()=>e.invalidateSize(),50),setTimeout(()=>e.invalidateSize(),300);let t=new ResizeObserver(()=>{h.current&&h.current.invalidateSize()});return t.observe(u.current),()=>{t.disconnect(),e.remove(),h.current=null}},[g]),(0,n.useEffect)(()=>{if(!h.current||!a)return;h.current.flyTo([r.lat,r.lng],15,{duration:1.2}),m.current&&m.current.remove();let e=a.divIcon({className:"",html:`<div style="
        width:32px;height:32px;background:#3b82f6;
        border:3px solid #fff;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 0 0 4px rgba(59,130,246,0.3),0 4px 16px rgba(59,130,246,0.6);
      "></div>`,iconSize:[32,32],iconAnchor:[16,32]});m.current=a.marker([r.lat,r.lng],{icon:e}).addTo(h.current).bindPopup("nl"===d?"<b>Geselecteerde locatie</b>":"<b>Selected location</b>")},[r,d]),(0,n.useEffect)(()=>{h.current&&a&&(b.current.forEach(e=>e.remove()),b.current=[],s.radiusCircles&&[1e3,500,300].forEach(e=>{let t=e===p,n=o[e]??"#3b82f6",l=a.circle([r.lat,r.lng],{radius:e,color:n,fillColor:n,fillOpacity:t?.06:.01,weight:t?3:1.5,dashArray:t?void 0:"8 5",opacity:t?.9:.35}).addTo(h.current);a.marker([r.lat+e/111320,r.lng],{icon:a.divIcon({className:"",html:`<span style="
            background:rgba(10,14,26,0.85);
            color:${n};
            font-size:${t?11:9}px;
            font-weight:${t?800:600};
            padding:1px 5px;border-radius:4px;
            border:1px solid ${n}60;
            white-space:nowrap;
            box-shadow:0 1px 4px rgba(0,0,0,0.5);
          ">${e}m</span>`})}).addTo(h.current),b.current.push(l)}))},[r,s.radiusCircles,p]),(0,n.useEffect)(()=>{if(!h.current||!a)return;f.current.forEach(e=>e.remove()),f.current=[];let e=new Set;s.amenities&&(e.add("food"),e.add("sanitation"),e.add("social"),e.add("healthcare")),s.transport&&e.add("transport"),s.schools&&e.add("school"),s.greenSpace&&e.add("green"),s.residential&&e.add("housing"),i.filter(t=>e.has(t.type)).slice(0,100).forEach(e=>{var t;let n,o,{icon:r,color:i}=(n=((t=e).name??"").toLowerCase(),o=l[t.type],"sanitation"===t.type?n.includes("toilet")||n.includes("wc")?{icon:"🚽",color:"#06b6d4"}:n.includes("douche")||n.includes("shower")||n.includes("bad")?{icon:"🚿",color:"#0ea5e9"}:{icon:"🚿",color:o}:"food"===t.type?n.includes("voedselbank")||n.includes("food bank")?{icon:"🍲",color:"#059669"}:n.includes("soep")||n.includes("soup")?{icon:"🍜",color:"#059669"}:{icon:"🛒",color:o}:"social"===t.type?n.includes("nacht")||n.includes("night")||n.includes("overnight")?{icon:"🌙",color:"#7c3aed"}:n.includes("dag")||n.includes("day centre")||n.includes("inloop")?{icon:"☀️",color:"#d97706"}:n.includes("dakloos")||n.includes("homeless")||n.includes("opvang")||n.includes("shelter")?{icon:"🏠",color:"#dc2626"}:n.includes("voedsel")||n.includes("food")?{icon:"🍲",color:"#059669"}:{icon:"🤝",color:o}:"healthcare"===t.type?n.includes("apotheek")||n.includes("pharma")?{icon:"💊",color:"#f43f5e"}:n.includes("ziekenhuis")||n.includes("hospital")?{icon:"🏥",color:"#ef4444"}:n.includes("ggz")||n.includes("mental")?{icon:"🧠",color:"#a855f7"}:{icon:"➕",color:o}:{icon:({food:"🛒",healthcare:"➕",sanitation:"🚿",transport:"🚌",school:"🏫",green:"🌳",social:"🤝",housing:"🏠"})[t.type],color:o}),s=Math.round(e.distanceMeters),c=s<1e3?`${s}m`:`${(s/1e3).toFixed(1)}km`,p=`https://www.google.com/maps/search/?api=1&query=${e.coordinates.lat},${e.coordinates.lng}`,u=a.marker([e.coordinates.lat,e.coordinates.lng],{icon:a.divIcon({className:"",html:`<div style="
              position:relative;
              width:36px;height:36px;
              background:white;
              border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              box-shadow:0 2px 8px rgba(0,0,0,0.55),0 0 0 2px ${i};
              font-size:17px;
              line-height:1;
            ">${r}</div>`,iconSize:[36,36],iconAnchor:[18,18]})}).addTo(h.current).bindPopup(`
            <div style="min-width:160px; font-family: sans-serif;">
              <a href="${p}" target="_blank" rel="noopener noreferrer" style="font-size:13px; display:block; margin-bottom:2px; color:#60a5fa; font-weight:bold; text-decoration:none; display:flex; align-items:center; gap:4px;">
                ${e.name} <span style="font-size:10px;">↗</span>
              </a>
              ${e.amenityTypeLabel?`
                <span style="font-size:10px; color:#cbd5e1; display:block; margin-bottom:4px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">
                  ${"nl"===d?e.amenityTypeLabel.nl:e.amenityTypeLabel.en}
                </span>
              `:""}
              <div style="display:flex; align-items:center; justify-content:space-between; margin-top:6px;">
                <span style="color:#94a3b8;font-size:10px; font-weight:500;">
                  📍 ${c} ${"nl"===d?"van locatie":"from site"}
                </span>
                ${e.website?`
                  <a href="${e.website}" target="_blank" rel="noopener noreferrer" style="font-size:10px; color:#3b82f6; text-decoration:none; font-weight:600; display:flex; align-items:center; gap:2px;">
                    Website ↗
                  </a>
                `:""}
              </div>
            </div>
          `);f.current.push(u)})},[i,s,d]),(0,t.jsxs)("div",{className:"relative w-full h-full",style:{minHeight:200},children:[(0,t.jsx)("div",{ref:u,className:"hdz-map w-full h-full",style:{minHeight:200}}),!g&&(0,t.jsx)("div",{className:"absolute inset-0 flex items-center justify-center bg-[#0a0e1a]",children:(0,t.jsx)("div",{className:"text-[#3b82f6] text-sm animate-pulse",children:"nl"===d?"Kaart laden...":"Loading map..."})}),(0,t.jsxs)("div",{className:"absolute bottom-3 left-3 z-[500] bg-[#0d1117]/92 backdrop-blur-sm rounded-lg p-2.5 border border-white/10 space-y-1.5 shadow-xl",children:[s.radiusCircles&&(0,t.jsxs)(t.Fragment,{children:[[300,500,1e3].map(e=>(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)("div",{className:"w-4 h-px",style:{background:o[e]??"#3b82f6",height:e===p?2:1}}),(0,t.jsxs)("span",{className:"text-[9px]",style:{color:o[e]??"#3b82f6",fontWeight:e===p?700:400},children:[e,"m"]})]},e)),(0,t.jsx)("div",{className:"h-px bg-white/10 my-1"})]}),[{type:"food",icon:"🛒",labelNl:"Voedsel / Voedselbank",labelEn:"Food / Food bank"},{type:"sanitation",icon:"🚽",labelNl:"Toilet / Douche",labelEn:"Toilet / Shower"},{type:"healthcare",icon:"➕",labelNl:"Zorg / Apotheek",labelEn:"Care / Pharmacy"},{type:"social",icon:"🤝",labelNl:"Opvang / Dagcentrum",labelEn:"Shelter / Day centre"},{type:"transport",icon:"🚌",labelNl:"Openbaar vervoer",labelEn:"Public transport"}].filter(e=>{let t=new Set;return s.amenities&&(t.add("food"),t.add("sanitation"),t.add("social"),t.add("healthcare")),s.transport&&t.add("transport"),t.has(e.type)}).map(e=>(0,t.jsxs)("div",{className:"flex items-center gap-1.5",children:[(0,t.jsx)("div",{className:"w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] flex-shrink-0 shadow-sm",style:{boxShadow:`0 0 0 1.5px ${l[e.type]}`},children:e.icon}),(0,t.jsx)("span",{className:"text-[9px] text-[#94a3b8]",children:"nl"===d?e.labelNl:e.labelEn})]},e.type))]})]})}])},8517,e=>{e.n(e.i(10565))},46263,e=>{e.v(t=>Promise.all(["static/chunks/0hqwzef572gul.js"].map(t=>e.l(t))).then(()=>t(7222)))}]);