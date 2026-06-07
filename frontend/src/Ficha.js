import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:3001/api';

export default function Ficha({ codigo }) {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarFicha();
  }, []);

  async function cargarFicha() {
    try {
      const res = await axios.get(`${API}/fichas/${codigo}`);
      setData(res.data);
    } catch (err) {
      setError('Ficha no encontrada');
    } finally {
      setCargando(false);
    }
  }

  if (cargando) return <div style={{padding:20}}>Cargando...</div>;
  if (error) return <div style={{padding:20}}>{error}</div>;

  return (
    <div style={{background:'#f9fafb', minHeight:'100vh', padding:'16px', maxWidth:'500px', margin:'0 auto'}}>
      <div style={{textAlign:'center', marginBottom:'20px'}}>
        <p style={{fontSize:'20px'}}>🏠</p>
        <p style={{fontWeight:'600'}}>Seleccion para {data.cliente}</p>
        <p style={{color:'#666', fontSize:'14px'}}>{data.propiedades.length} propiedades</p>
      </div>

      {data.propiedades.map((prop, i) => (
        <div key={i} style={{background:'white', borderRadius:'12px', overflow:'hidden', marginBottom:'16px', border:'1px solid #e5e7eb'}}>
          {prop.fotos && prop.fotos[0] && (
            <img
              src={prop.fotos[0]}
              alt={prop.titulo}
              referrerPolicy="no-referrer"
              style={{width:'100%', height:'200px', objectFit:'cover'}}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <div style={{padding:'16px'}}>
            <p style={{fontWeight:'600', marginBottom:'4px'}}>{prop.titulo}</p>
            <p style={{color:'#666', fontSize:'14px', marginBottom:'12px'}}>📍 {prop.zona}</p>
            <p style={{fontSize:'20px', fontWeight:'600', marginBottom:'12px'}}>USD {prop.precio && prop.precio.toLocaleString()}</p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px'}}>
              {prop.m2 && <div style={{background:'#f3f4f6', borderRadius:'8px', padding:'8px'}}><p style={{fontSize:'12px', color:'#999'}}>Superficie</p><p style={{fontWeight:'500'}}>{prop.m2} m2</p></div>}
              {prop.ambientes && <div style={{background:'#f3f4f6', borderRadius:'8px', padding:'8px'}}><p style={{fontSize:'12px', color:'#999'}}>Ambientes</p><p style={{fontWeight:'500'}}>{prop.ambientes}</p></div>}
              {prop.antiguedad && <div style={{background:'#f3f4f6', borderRadius:'8px', padding:'8px'}}><p style={{fontSize:'12px', color:'#999'}}>Antiguedad</p><p style={{fontWeight:'500'}}>{prop.antiguedad} anos</p></div>}
              {prop.banos && <div style={{background:'#f3f4f6', borderRadius:'8px', padding:'8px'}}><p style={{fontSize:'12px', color:'#999'}}>Banos</p><p style={{fontWeight:'500'}}>{prop.banos}</p></div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}