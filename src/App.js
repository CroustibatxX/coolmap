import './css/App.css';
import React, { useRef, useEffect, useState } from 'react';
import * as mapboxgl from 'mapbox-gl';
import axios from 'axios'
import PopupDetails from './components/PopupDetails'
import PopupAddPlace from './components/PopupAddPlace'

mapboxgl.accessToken = 'pk.eyJ1IjoiY3JvdXN0aWJhdHoiLCJhIjoiY2wwcng5dm9yMDF5bDNjcGc2NHpkOHFpMCJ9.gwo4X3kWd4ItYgtrb5cW4w';

function App() {
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const btnAdd = useRef(null);
  const popupDetails = useRef(null);
  const popupAddPlace = useRef(null);
  const [zoom, setZoom] = useState(12.5);
  const [details, setDetails] = useState(null);

  const [popupDetailsOpen, setPopupDetailsOpen] = useState(false);
  const [popupAddOpen, setPopupAddOpen] = useState(false);


  const loadMap = async () => {
    
      let placesData = await getPlaces()
      
      // Add a source and layer displaying a point which will be animated in a circle.
      map.current.addSource('places', {
        "type": "geojson",
        "data": placesData,
        buffer: 5,
        maxzoom: 10
      });

      map.current.addLayer({
        "id": "places",
        "source": "places",
        "type": "symbol",
        "layout": {
            //Control the icon image using data-driven styles
            "icon-image": {
                "property": "icon_type",
                "type": "identity"
            },
            "icon-size": {
                //Control the icon-size based on zoom level
                "stops": [
                    [0, 0.1],
                    [7, 0.5]
                ]
            },
            "icon-allow-overlap": true
        }
      })
  }

  const getPlaces = async () => {
    //Load places
    return await axios.get("/api/getPlaces").then(function (res) {
      let placesData = {type:"FeatureCollection", features: []}
      res.data.forEach(element => {
        let place = {
          type: "Feature",
          geometry:{
            type: "Point",
            coordinates: [element.lng,element.lat]
          },
          properties:{
            data: {
              lat: element.lat,
              lng: element.lng,
              name: element.name, 
              desc: element.desc, 
              beerPrice: element.beerPrice,
              happyPrice: element.happyPrice,
              ricardPrice: element.ricardPrice,
              placeid: element._id,
              menu: element.menu,
              icon: element.icon,
              images: element.images,
              placeName: element.placeName},
              icon_type: element.icon
          }
        }
        placesData.features.push(place)
      });
      return placesData
    })
    .catch(function (error) {
      console.log(error);
    });    
  }

  

  const updateMap = async () => {
    let placesData = await getPlaces()
    map.current.getSource('places').setData(placesData); 
  }

  const loadIcon = () => {
    map.current.loadImage(
      '/images/beer.png',
      (error, image) => {
      if (error) throw error;
       
      // Add the image to the map style.
      map.current.addImage('beer', image);
    })
    map.current.loadImage(
      '/images/ricard.png',
      (error, image) => {
      if (error) throw error;
       
      // Add the image to the map style.
      map.current.addImage('ricard', image);
    })
    map.current.loadImage(
      '/images/shot.png',
      (error, image) => {
      if (error) throw error;
       
      // Add the image to the map style.
      map.current.addImage('shot', image);
    })

  }

  const updateDetailsPopupState = (state) => {
    setPopupDetailsOpen(state)
  }

  const updateAddPopupState = (state) => {
    if(state == false){
      btnAdd.current.classList.remove("hidden")
    }
    setPopupAddOpen(state)
  }

  const handleAddLocation = () => {
    btnAdd.current.classList.add("hidden")
    popupAddPlace.current.openPopup()
  }

  // const authorizeGeoLoc = () => {
  //   if(navigator.geolocation){
  //     navigator.geolocation.getCurrentPosition(function(e){console.log(e)},function(e){console.log(e)})
  //   }else{
  //     console.log("no")
  //   }
  //   navigator.permissions.query({name:'geolocation'}).then(function(result) {
  //     if (result.state == 'granted') {
  //       console.log(result.state);
  //       addGeoLoc()
  //     } else if (result.state == 'prompt') {
  //       console.log(result.state);
  //     } else if (result.state == 'denied') {
        
  //     }
  //     result.onchange = function() {
  //       console.log(result.state);
  //     }
  //   });
  // }

  const addGeoLoc = () => {
    map.current.addControl(
      new mapboxgl.GeolocateControl({
      positionOptions: {
      enableHighAccuracy: true
      },
      // When active the map will receive updates to the device's location as it changes.
      trackUserLocation: true,
      // Draw an arrow next to the location dot to indicate which direction the device is heading.
      showUserHeading: true
      }))
  }

  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    //Load map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v10?optimize=true',
      center: [4.8601628, 45.7605725],
      zoom: zoom,
      minZoom: 5,
    });

    //authorizeGeoLoc()

    map.current.on('click', 'places', (e) => {
      // Copy coordinates array.
      let data = e.features[0].properties.data;
      setDetails(JSON.parse(data))
      //Open popup
      popupDetails.current.openPopup()
    });
    
    // Change the cursor to a pointer when the mouse is over the places layer.
    map.current.on('mouseenter', 'places', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });
    
    // Change it back to a pointer when it leaves.
    map.current.on('mouseleave', 'places', () => {
      map.current.getCanvas().style.cursor = '';
    });

    map.current.on('styleimagemissing', () => {
      loadIcon()
    });
   
    map.current.on('style.load', function() {
      loadIcon()
      loadMap()
    });
  });


  return (
    <div className='relative'>
      <div ref={mapContainer} className="map-container" />
      <PopupDetails ref={popupDetails} detailsData={details} updateMap={updateMap} popupAddOpen={popupAddOpen} mapref={map} updateDetailsPopupState={updateDetailsPopupState}/>
      <PopupAddPlace ref={popupAddPlace} updateMap={updateMap} updateAddPopupState={updateAddPopupState} mapref={map}/>
      <div>
        { !popupDetailsOpen ?  <button ref={btnAdd} id="addLocationButton" onClick={handleAddLocation} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
          Ajouter un lieu
        </button> : ""}
      </div>
    </div>
  );
}



export default App;
