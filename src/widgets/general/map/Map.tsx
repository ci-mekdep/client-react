import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { icon } from 'leaflet'

const markerIcon = icon({
  iconUrl: '/images/map-pin.png',
  iconSize: [31, 42]
})

const MyMap = ({ position }: { position: any }) => {
  return (
    <MapContainer
      zoom={18}
      attributionControl={false}
      center={position !== null ? position : [37.94, 58.38]}
      style={{
        height: '100%',
        width: '100%'
      }}
    >
      <TileLayer url='https://map.mekdep.org/tile/{z}/{x}/{y}.png' />
      <Marker icon={markerIcon} position={position !== null ? position : [37.94, 58.38]}></Marker>
    </MapContainer>
  )
}

export default MyMap
