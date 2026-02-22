import L from 'leaflet'

export const createCustomIcon = (number) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
      ">
        <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            fill="#B54B4B"
            stroke="white"
            stroke-width="1.5"
          />
          <circle cx="12" cy="9" r="3" fill="white"/>
        </svg>
        <div style="
          position: absolute;
          top: 6px;
          left: 50%;
          transform: translateX(-50%);
          color: #B54B4B;
          font-weight: bold;
          font-size: 14px;
          font-family: system-ui, -apple-system, sans-serif;
        ">${number}</div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  })
}
