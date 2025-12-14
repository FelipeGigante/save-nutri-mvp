'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
// IMPORTANTE: Mantenha o import assim para evitar erro de versão
import Map, { Source, Layer, Popup, type MapMouseEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { School, Tractor, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

// --- CONFIGURAÇÕES CHUMBADAS (HARDCODED) ---
// 1. COLE SEU TOKEN AQUI (Começa com pk.eyJ...)
const MAPBOX_TOKEN = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"; // <--- TROQUE PELO SEU TOKEN REAL SE O MAPA NÃO CARREGAR

// 2. URL DO BACKEND FIXA
const API_URL = "http://localhost:8000";

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
  const [cursor, setCursor] = useState<string>('auto');

  // FETCH DOS DADOS (Com Logs de Debug)
  useEffect(() => {
    async function loadData() {
      try {
        console.log("MapComponent: Buscando dados em " + API_URL);
        const res = await axios.get(`${API_URL}/geojson/enriched`);
        console.log("MapComponent: Dados recebidos!", res.data);
        setGeoData(res.data);
      } catch (error) {
        console.error("ERRO FATAL NO MAPA: O Backend está rodando? ", error);
      }
    }
    loadData();
  }, []);

  const routeGeoJSON = useMemo(() => {
    if (!selectedSchoolId || !matchedFarmerId || !geoData) return null;

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

  const handleMapClick = useCallback((event: MapMouseEvent) => {
    const feature = event.features?.[0];
    
    if (feature) {
      const props = feature.properties as any;
      const geometry = feature.geometry as any; 
      const [lng, lat] = geometry.coordinates;

      let produtosFormatados = props.produtos_disponiveis;
      if (typeof props.produtos_disponiveis === 'string' && props.produtos_disponiveis.startsWith('[')) {
          try {
            produtosFormatados = JSON.parse(props.produtos_disponiveis).join(', ');
          } catch (e) {
            produtosFormatados = props.produtos_disponiveis;
          }
      }

      setPopupInfo({
        longitude: lng,
        latitude: lat,
        ...props,
        produtos_exibicao: produtosFormatados
      });

      if (props.tipo === 'escola' && onSchoolClick) {
        onSchoolClick(props.id);
      }
    } else {
      setPopupInfo(null);
    }
  }, [onSchoolClick]);

  const onMouseEnter = useCallback(() => setCursor('pointer'), []);
  const onMouseLeave = useCallback(() => setCursor('auto'), []);

  return (
    <div className="w-full h-full relative">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        cursor={cursor}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN} // <--- TOKEN CHUMBADO AQUI
        interactiveLayerIds={['school-point', 'farmer-point']}
        onClick={handleMapClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {geoData && (
          <Source id="main-data" type="geojson" data={geoData}>
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
            closeButton={true}
            closeOnClick={false}
          >
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                {popupInfo.tipo === 'escola' ? <School className="w-4 h-4 text-blue-600"/> : <Tractor className="w-4 h-4 text-green-600"/>}
                <span className="text-sm">{popupInfo.name}</span>
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
                     <p className="leading-snug">{popupInfo.produtos_exibicao || popupInfo.produtos_disponiveis}</p>
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