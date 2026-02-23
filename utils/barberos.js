// utils/barberos.js - Gestión de barberos para LAG.barberia

console.log('👥 barberos.js cargado (modo Supabase)');

let barberosCache = [];
let ultimaActualizacionBarberos = 0;
const CACHE_DURATION_BARBEROS = 5 * 60 * 1000;

async function cargarBarberosDesdeDB() {
    try {
        console.log('🌐 Cargando barberos desde Supabase...');
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/barberos?select=*&order=id.asc`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            console.error('Error response:', await response.text());
            return null;
        }
        
        const data = await response.json();
        console.log('✅ Barberos cargados desde Supabase:', data);
        barberosCache = data;
        ultimaActualizacionBarberos = Date.now();
        return data;
    } catch (error) {
        console.error('Error cargando barberos:', error);
        return null;
    }
}

window.salonBarberos = {
    getAll: async function(activos = true) {
        if (Date.now() - ultimaActualizacionBarberos < CACHE_DURATION_BARBEROS && barberosCache.length > 0) {
            if (activos) {
                return barberosCache.filter(b => b.activo === true);
            }
            return [...barberosCache];
        }
        
        const datos = await cargarBarberosDesdeDB();
        if (datos) {
            if (activos) {
                return datos.filter(b => b.activo === true);
            }
            return datos;
        }
        
        const defaultData = [
            { id: 1, nombre: "Carlos", especialidad: "Cortes clásicos", color: "bg-amber-600", avatar: "👨‍🎨", activo: true, nivel: 3 },
            { id: 2, nombre: "Miguel", especialidad: "Barba y diseños", color: "bg-amber-700", avatar: "👨‍🎨", activo: true, nivel: 2 },
            { id: 3, nombre: "Javier", especialidad: "Cortes modernos", color: "bg-amber-800", avatar: "👨‍🎨", activo: true, nivel: 1 }
        ];
        barberosCache = defaultData;
        ultimaActualizacionBarberos = Date.now();
        return activas ? defaultData : defaultData;
    },
    
    getById: async function(id) {
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/barberos?id=eq.${id}&select=*`,
                {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (!response.ok) return null;
            const data = await response.json();
            return data[0] || null;
        } catch (error) {
            console.error('Error obteniendo barbero:', error);
            return null;
        }
    },
    
    crear: async function(barbero) {
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/barberos`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        nombre: barbero.nombre,
                        especialidad: barbero.especialidad,
                        color: barbero.color || 'bg-amber-600',
                        avatar: barbero.avatar || '👨‍🎨',
                        activo: true,
                        telefono: barbero.telefono || null,
                        password: barbero.password || null,
                        nivel: barbero.nivel || 1
                    })
                }
            );
            
            if (!response.ok) {
                const error = await response.text();
                console.error('Error al crear barbero:', error);
                return null;
            }
            
            const nuevo = await response.json();
            console.log('✅ Barbero creado:', nuevo);
            
            barberosCache = await cargarBarberosDesdeDB() || barberosCache;
            
            if (window.dispatchEvent) {
                window.dispatchEvent(new Event('barberosActualizados'));
            }
            
            return nuevo[0];
        } catch (error) {
            console.error('Error en crear:', error);
            return null;
        }
    },
    
    actualizar: async function(id, cambios) {
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/barberos?id=eq.${id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(cambios)
                }
            );
            
            if (!response.ok) {
                const error = await response.text();
                console.error('Error al actualizar barbero:', error);
                return null;
            }
            
            const actualizado = await response.json();
            console.log('✅ Barbero actualizado:', actualizado);
            
            barberosCache = await cargarBarberosDesdeDB() || barberosCache;
            
            if (window.dispatchEvent) {
                window.dispatchEvent(new Event('barberosActualizados'));
            }
            
            return actualizado[0];
        } catch (error) {
            console.error('Error en actualizar:', error);
            return null;
        }
    },
    
    eliminar: async function(id) {
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/barberos?id=eq.${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                const error = await response.text();
                console.error('Error al eliminar barbero:', error);
                return false;
            }
            
            console.log('✅ Barbero eliminado');
            
            barberosCache = await cargarBarberosDesdeDB() || barberosCache;
            
            if (window.dispatchEvent) {
                window.dispatchEvent(new Event('barberosActualizados'));
            }
            
            return true;
        } catch (error) {
            console.error('Error en eliminar:', error);
            return false;
        }
    }
};

setTimeout(async () => {
    await window.salonBarberos.getAll(false);
}, 1000);

console.log('✅ salonBarberos inicializado');