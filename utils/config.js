// utils/config.js - Configuración para LAG.barberia (VERSIÓN ÚNICA Y CORREGIDA)

console.log('⚙️ config.js cargado (modo Supabase)');

let configuracionGlobal = {
    duracion_turnos: 60,
    intervalo_entre_turnos: 0,
    modo_24h: false
};

let horariosBarberos = {};

// ============================================
// FUNCIONES AUXILIARES (UNA SOLA VEZ)
// ============================================
const indiceToHoraLegible = (indice) => {
    const horas = Math.floor(indice / 2);
    const minutos = indice % 2 === 0 ? '00' : '30';
    return `${horas.toString().padStart(2, '0')}:${minutos}`;
};

const horaToIndice = (horaStr) => {
    const [horas, minutos] = horaStr.split(':').map(Number);
    return horas * 2 + (minutos === 30 ? 1 : 0);
};

// ============================================
// FUNCIONES DE CARGA
// ============================================
async function cargarConfiguracionGlobal() {
    try {
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/configuracion?select=*`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                }
            }
        );
        if (!response.ok) return null;
        const data = await response.json();
        if (data && data.length > 0) {
            configuracionGlobal = data[0];
            console.log('✅ Configuración cargada:', configuracionGlobal);
        }
        return configuracionGlobal;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// ============================================
// OBJETO PRINCIPAL salonConfig
// ============================================
window.salonConfig = {
    get: async function() {
        await cargarConfiguracionGlobal();
        return { ...configuracionGlobal };
    },
    
    getHorariosBarbero: async function(barberoId) {
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/horarios_barberos?barbero_id=eq.${barberoId}&select=*`,
                {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                    }
                }
            );
            if (!response.ok) return { horas: [], dias: [] };
            const data = await response.json();
            return {
                horas: data[0]?.horas || [],
                dias: data[0]?.dias || []
            };
        } catch (error) {
            console.error('Error:', error);
            return { horas: [], dias: [] };
        }
    },
    
    getHorariosPorDia: async function(barberoId) {
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/horarios_barberos?barbero_id=eq.${barberoId}&select=*`,
                {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                    }
                }
            );
            if (!response.ok) return {};
            const data = await response.json();
            return data[0]?.horarios_por_dia || {};
        } catch (error) {
            console.error('Error:', error);
            return {};
        }
    }
};

// Cargar configuración al inicio
setTimeout(async () => {
    await cargarConfiguracionGlobal();
}, 1000);

console.log('✅ salonConfig inicializado');