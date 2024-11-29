import { icon } from 'leaflet'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'

const markerIcon = icon({
  iconUrl: '/images/map-pin.png',
  iconSize: [31, 42]
})

const MyMap = ({ position, setPosition }: { position: any; setPosition: any }) => {
  const defaultPosition = [37.94, 58.38]
  const mapPosition = position || defaultPosition

  const MapClickHandler = () => {
    useMapEvents({
      click: e => {
        if (e.latlng.lat && e.latlng.lng) {
          setPosition([e.latlng.lat, e.latlng.lng])
        }
      }
    })

    return null
  }

  return (
    <MapContainer
      zoom={18}
      center={mapPosition}
      attributionControl={false}
      style={{
        height: '100%',
        width: '100%'
      }}
    >
      <TileLayer url='https://map.mekdep.org/tile/{z}/{x}/{y}.png' />
      <Marker icon={markerIcon} position={mapPosition}></Marker>
      <MapClickHandler />
    </MapContainer>
  )
}

export default MyMap
