import { useState, useEffect } from 'react';
import Ficha from './Ficha';
import axios from 'axios';

const API = 'https://propfinder-production-63e1.up.railway.app/api';
function Badge({ tipo }) {
  if (!tipo) return null;
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
      tipo === 'FLIP' 
        ? 'bg-red-100 text-red-700' 
        : 'bg-yellow-100 text-yellow-700'
    }`}>
      {tipo === 'FLIP' ? '🔴 FLIP' : '🟡 OPO'}
    </span>
  );
}

function Card({ prop, clientes, onEnviar, onGuardar, guardada }) {
  const matches = clientes.filter(c => {
    const zonaOk = !c.zonas || c.zonas.some(z => 
      prop.zona?.toLowerCase().includes(z.toLowerCase())
    );
    const precioOk = !c.presupuesto_max || prop.precio <= c.presupuesto_max;
    const tipoOk = !c.tipo_busqueda || c.tipo_busqueda === prop.tipo_oportunidad;
    return zonaOk && precioOk && tipoOk;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="relative">
      {prop.fotos?.[0] ? (
  <img 
    src={prop.fotos[0]}
    alt={prop.titulo}
    className="w-full h-44 object-cover"
    referrerPolicy="no-referrer"
    onError={(e) => { e.target.style.display='none' }}
  />
) : (
          <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400">
            Sin foto
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge tipo={prop.tipo_oportunidad} />
        </div>
        <span className="absolute bottom-2 right-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">
          {prop.fuente} · {prop.tipo}
        </span>
      </div>

      <div className="p-3">
        <p className="font-medium text-gray-900">{prop.titulo}</p>
        <p className="text-sm text-gray-500 mb-2">📍 {prop.zona}</p>

        <div className="flex gap-3 text-sm text-gray-600 mb-2">
          {prop.m2 && <span><strong>{prop.m2}</strong> m²</span>}
          {prop.ambientes && <span><strong>{prop.ambientes}</strong> amb</span>}
          {prop.antiguedad && <span><strong>{prop.antiguedad}</strong> años</span>}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-lg font-semibold">
              USD {prop.precio?.toLocaleString()}
            </p>
            {prop.descuento_porcentaje > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {prop.descuento_porcentaje}% bajo mercado
              </span>
            )}
          </div>
          <div className="flex gap-2">
  <button
    onClick={() => onGuardar(prop)}
    className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border ${
      guardada ? 'bg-blue-50 text-blue-800 border-blue-300' : 'bg-gray-50 text-gray-700 border-gray-200'
    }`}
  >
    {guardada ? '✓ Guardada' : '+ Guardar'}
  </button>
  <button
    onClick={() => onEnviar(prop)}
    className="flex items-center gap-1 text-sm px-3 py-1.5 bg-green-50 text-green-800 border border-green-300 rounded-lg"
  >
    📲 Enviar
  </button>
</div>
        </div>

        {matches.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400 mr-1">Match:</span>
            {matches.map(c => (
              <span key={c.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                {c.nombre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NuevoCliente({ onGuardado }) {
  const [form, setForm] = useState({
    nombre: '', telefono: '', tipo_busqueda: 'FLIP',
    presupuesto_max: '', zonas: '', tipos_propiedad: ''
  });
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    if (!form.nombre) return;
    setGuardando(true);
    try {
      await axios.post(`${API}/clientes`, {
        ...form,
        presupuesto_max: parseFloat(form.presupuesto_max) || null,
        zonas: form.zonas ? form.zonas.split(',').map(z => z.trim()) : [],
        tipos_propiedad: form.tipos_propiedad ? form.tipos_propiedad.split(',').map(t => t.trim()) : []
      });
      setForm({ nombre: '', telefono: '', tipo_busqueda: 'FLIP', presupuesto_max: '', zonas: '', tipos_propiedad: '' });
      onGuardado();
    } catch (err) {
      console.error('Error guardando cliente:', err);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
      <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Teléfono WhatsApp" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
      <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.tipo_busqueda} onChange={e => setForm({...form, tipo_busqueda: e.target.value})}>
        <option value="FLIP">🔴 FLIP</option>
        <option value="OPO">🟡 Oportunidad de valor</option>
        <option value="">Ambos</option>
      </select>
      <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Presupuesto máximo en USD" value={form.presupuesto_max} onChange={e => setForm({...form, presupuesto_max: e.target.value})} />
      <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Zonas (ej: palermo, belgrano)" value={form.zonas} onChange={e => setForm({...form, zonas: e.target.value})} />
      <button onClick={guardar} disabled={guardando} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg">
        {guardando ? 'Guardando...' : 'Agregar cliente'}
      </button>
    </div>
  );
}
function PanelFicha({ seleccionadas, clientes, onLimpiar }) {
  const [clienteId, setClienteId] = useState('');
  const [link, setLink] = useState(null);
  const [generando, setGenerando] = useState(false);

  async function generarFicha() {
    if (!clienteId) return;
    setGenerando(true);
    try {
      const res = await axios.post(`${API}/fichas`, {
        cliente_id: parseInt(clienteId),
        propiedades_ids: seleccionadas.map(p => p.id)
      });
      setLink(res.data.link);
    } catch (err) {
      console.error('Error generando ficha:', err);
    } finally {
      setGenerando(false);
    }
  }

  function enviarPorWhatsapp() {
    const cliente = clientes.find(c => c.id === parseInt(clienteId));
    const texto = `Hola! Te comparto ${seleccionadas.length} propiedad${seleccionadas.length > 1 ? 'es' : ''} que seleccioné para vos:\n\n${link}`;
    const tel = cliente?.telefono ? `https://wa.me/54${cliente.telefono}` : 'https://wa.me/';
    window.open(`${tel}?text=${encodeURIComponent(texto)}`, '_blank');
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium text-blue-900">
          {seleccionadas.length} propiedad{seleccionadas.length > 1 ? 'es' : ''} seleccionada{seleccionadas.length > 1 ? 's' : ''}
        </p>
        <button onClick={onLimpiar} className="text-xs text-blue-500">Limpiar</button>
      </div>

      {!link ? (
        <>
          <select 
            className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm mb-2 bg-white"
            value={clienteId}
            onChange={e => setClienteId(e.target.value)}
          >
            <option value="">Seleccioná un cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <button
            onClick={generarFicha}
            disabled={!clienteId || generando}
            className="w-full bg-blue-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {generando ? 'Generando...' : 'Generar ficha'}
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-blue-700 break-all bg-white border border-blue-200 rounded-lg p-2">{link}</p>
          <button
            onClick={enviarPorWhatsapp}
            className="w-full bg-green-600 text-white text-sm px-4 py-2 rounded-lg"
          >
            📲 Enviar por WhatsApp
          </button>
          <button
            onClick={() => setLink(null)}
            className="text-xs text-blue-500 text-center"
          >
            Generar otra ficha
          </button>
        </div>
      )}
    </div>
  );
}
export default function App() {
  const [propiedades, setPropiedades] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [pantalla, setPantalla] = useState('feed');
  const [cargando, setCargando] = useState(true);
  const [seleccionadas, setSeleccionadas] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [props, cls] = await Promise.all([
        axios.get(`${API}/propiedades`),
        axios.get(`${API}/clientes`)
      ]);
      setPropiedades(props.data);
      setClientes(cls.data);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setCargando(false);
    }
  }
  const codigo = window.location.pathname.startsWith('/ficha/') 
  ? window.location.pathname.split('/ficha/')[1] 
  : null;

if (codigo) return <Ficha codigo={codigo} />;
  function propsFiltradas() {
    if (filtro === 'todos') return propiedades;
    return propiedades.filter(p => p.tipo_oportunidad === filtro);
  }

  function enviarWhatsapp(prop) {
    const texto = `🏠 *${prop.titulo}*\n📍 ${prop.zona}\n💵 USD ${prop.precio?.toLocaleString()}\n📐 ${prop.m2} m²\n🔗 ${prop.url_original}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <span className="font-semibold text-gray-900">PropFinder</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPantalla('feed')}
            className={`text-sm px-3 py-1.5 rounded-lg border ${pantalla === 'feed' ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600'}`}
          >
            Feed
          </button>
          <button
            onClick={() => setPantalla('clientes')}
            className={`text-sm px-3 py-1.5 rounded-lg border ${pantalla === 'clientes' ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600'}`}
          >
            Clientes
          </button>
        </div>
      </div>

      {pantalla === 'feed' && (
        <>
          {/* Filtros */}
          <div className="flex gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100 overflow-x-auto">
            {['todos', 'FLIP', 'OPO'].map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`text-sm px-3 py-1.5 rounded-full border whitespace-nowrap ${filtro === f ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white border-gray-200 text-gray-600'}`}
              >
                {f === 'todos' ? 'Todos' : f === 'FLIP' ? '🔴 FLIP' : '🟡 OPO'}
              </button>
            ))}
          </div>

          {/* Feed */}
          <div className="p-4">
            {cargando ? (
              <p className="text-center text-gray-400 mt-10">Cargando propiedades...</p>
            ) : propsFiltradas().length === 0 ? (
              <p className="text-center text-gray-400 mt-10">
                El scraper está corriendo, las propiedades aparecen en minutos...
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
    {propsFiltradas().length} oportunidades detectadas
  </p>

  {seleccionadas.length > 0 && (
    <PanelFicha 
      seleccionadas={seleccionadas} 
      clientes={clientes}
      onLimpiar={() => setSeleccionadas([])}
    />
  )}
                {propsFiltradas().map(p => (
  <Card 
    key={p.id} 
    prop={p} 
    clientes={clientes} 
    onEnviar={enviarWhatsapp}
    onGuardar={(prop) => {
      setSeleccionadas(prev => 
        prev.find(s => s.id === prop.id) 
          ? prev.filter(s => s.id !== prop.id)
          : [...prev, prop]
      );
    }}
    guardada={seleccionadas.some(s => s.id === p.id)}
  />
))}
              </div>
            )}
          </div>
        </>
      )}

      {pantalla === 'clientes' && (
        <div className="p-4 max-w-2xl mx-auto">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">
            {clientes.length} clientes activos
          </p>
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
  <p className="font-medium text-gray-900 mb-3">Agregar cliente</p>
  <NuevoCliente onGuardado={cargarDatos} />
</div>

{clientes.length === 0 ? (
  <p className="text-center text-gray-400 mt-10">No hay clientes todavía</p>
) : (
            clientes.map(c => {
              const matches = propiedades.filter(p => {
                const zonaOk = !c.zonas || c.zonas.some(z =>
                  p.zona?.toLowerCase().includes(z.toLowerCase())
                );
                const precioOk = !c.presupuesto_max || p.precio <= c.presupuesto_max;
                return zonaOk && precioOk;
              });
              return (
                <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{c.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {c.tipo_busqueda} · {c.zonas?.join(', ')} · hasta USD {c.presupuesto_max?.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                    {matches.length} matches
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
