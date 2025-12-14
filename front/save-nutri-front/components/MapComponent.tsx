'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Map, { Source, Layer, Popup, type MapMouseEvent } from 'react-map-gl/mapbox'; // <--- Import corrigido
import 'mapbox-gl/dist/mapbox-gl.css';
import { School, Tractor, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

// --- ATUALIZAÇÃO 1: FILTROS EM PORTUGUÊS ---
const layers = {
  school: {
    id: 'school-point',
    type: 'circle',
    paint: {
      'circle-radius': 8,
      'circle-color': '#1e293b', 
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    },
    // O Mapbox vai procurar onde "tipo" é igual a "escola"
    filter: ['==', 'tipo', 'escola'] 
  },
  farmer: {
    id: 'farmer-point',
    type: 'circle',
    paint: {
      'circle-radius': 6,
      'circle-color': '#10b981', 
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff'
    },
    // O Mapbox vai procurar onde "tipo" é igual a "agricultor"
    filter: ['==', 'tipo', 'agricultor']
  },
  route: {
    id: 'route-line',
    type: 'line',
    paint: {
      'line-color': '#6366f1',
      'line-width': 4,
      'line-dasharray': [2, 1]
    }
  }
};

type MapProps = {
  // --- ATUALIZAÇÃO 2: IDs AGORA SÃO STRINGS ---
  selectedSchoolId?: string | null;
  matchedFarmerId?: string | null;
  onSchoolClick?: (id: string) => void;
};

export default function MapComponent({ selectedSchoolId, matchedFarmerId, onSchoolClick }: MapProps) {
  const [viewState, setViewState] = useState({
    longitude: -42.960, 
    latitude: -22.415,
    zoom: 12
  });

  const [geoData, setGeoData] = useState<any>(null);
  const [popupInfo, setPopupInfo] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await axios.get(`http://localhost:8000/geojson/enriched`); // Ou a URL que você usou
        setGeoData(res.data);
      } catch (error) {
        console.error("Erro no mapa:", error);
      }
    }
    loadData();
  }, []);

  const routeGeoJSON = useMemo(() => {
    if (!selectedSchoolId || !matchedFarmerId || !geoData) return null;

    // Comparação de Strings agora
    const school = geoData.features.find((f: any) => f.properties.id === selectedSchoolId);
    const farmer = geoData.features.find((f: any) => f.properties.id === matchedFarmerId);

    if (!school || !farmer) return null;

    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [school.geometry.coordinates, farmer.geometry.coordinates]
      }
    };
  }, [selectedSchoolId, matchedFarmerId, geoData]);

  const handleMapClick = (event: MapMouseEvent) => {
    const feature = event.features?.[0];
    
    if (feature) {
      const props = feature.properties as any;
      const geometry = feature.geometry as any; // Cast forçado para evitar erro de TS
      const [lng, lat] = geometry.coordinates;

      setPopupInfo({
        longitude: lng,
        latitude: lat,
        ...props
      });

      // --- ATUALIZAÇÃO 3: USA PROPRIEDADE 'tipo' ---
      if (props.tipo === 'escola' && onSchoolClick) {
        onSchoolClick(props.id);
      }
    } else {
      setPopupInfo(null);
    }
  };

  return (
    <div className="w-full h-full relative">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={"pk.eyJ1IjoiZ3VpbGVyIiwiYSI6ImNtaGhjZ3licDAyMTgyaW84NXpocjU1YWoifQ.ZZ2X0f82bfAqc99B4-qHKA"}
        interactiveLayerIds={['school-point', 'farmer-point']}
        onClick={handleMapClick}
      >
        {geoData && (
          <Source id="main-data" type="geojson" data={geoData}>
            {/* Filtros atualizados no objeto layers acima */}
            <Layer {...layers.school as any} /> 
            <Layer {...layers.farmer as any} />
          </Source>
        )}

        {routeGeoJSON && (
          <Source id="route-data" type="geojson" data={routeGeoJSON as any}>
            <Layer {...layers.route as any} />
          </Source>
        )}

        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeButton={false}
          >
            <div className="p-3 min-w-[200px]">
              <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                {/* Verifica 'tipo' em vez de 'type' */}
                {popupInfo.tipo === 'escola' ? <School className="w-4 h-4 text-blue-600"/> : <Tractor className="w-4 h-4 text-green-600"/>}
                {popupInfo.name}
              </div>
              
              <div className="text-xs text-slate-500 border-t pt-2 mt-1">
                {popupInfo.tipo === 'escola' ? (
                  <>
                    <p className="font-semibold text-slate-700">Demanda:</p>
                    <p>{popupInfo.demanda_atual || 'Variados'}</p>
                  </>
                ) : (
                  <>
                     <p className="font-semibold text-slate-700">Disponível:</p>
                     {/* O JSON retorna array, o mapbox flattena para string as vezes, cuidado visual */}
                     <p className="truncate max-w-[180px]">{popupInfo.produtos_disponiveis}</p> 
                     
                     <div className="mt-2 flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                        <CheckCircle2 size={12} />
                        <span className="font-bold text-[10px]">DAP ATIVA</span>
                     </div>
                  </>
                )}
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}