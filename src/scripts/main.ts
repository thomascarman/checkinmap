const API_KEY: string | undefined = process.env.API_KEY;
const FORM: HTMLElement | null = document.getElementById("form");
const BTN: HTMLButtonElement = document.createElement("button");
const MAP: L.Map = L.map("hot-map-container");

const LATLNG_DEFAULT: L.LatLngExpression = { lat: 31.2, lng: -99.67 };
const ZOOM_DEFAULT: number = 4;
L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    //! Have not setup env Yet
    accessToken: process.env.API_KEY,
  }
).addTo(mymap);

mymap.addEventListener("click", (evt: any) => {
  console.log(evt);
});
