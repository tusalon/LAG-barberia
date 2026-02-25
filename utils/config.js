// utils/config.js - Configuración para LAG.barberia (CON PROTECCIÓN CONTRA DOBLE CARGA)

// ============================================
// PROTECCIÓN CONTRA DOBLE CARGA
// ============================================
if (window.__CONFIG_CARGADO) {
    console.warn('⚠️ config.js ya fue cargado, ignorando segunda carga...');
} else {
    window.__CONFIG_CARGADO = true;

console.log('⚙️ config.js cargado (modo Supabase)');

let configuracionGlobal = {
    duracion_turnos: 60,
    intervalo_entre_turnos: 0,
    modo_24h: false,
    max_antelacion_dias: 30
};

let horariosBarberos = {};
let ultimaActualizacion = 0;
const CACHE_DURATION = 5 * 60 * 1000;

// ============================================
// FUNCIONES AUXILIARES
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
        console.log('🌐 Cargando configuración global desde Supabase...');
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/configuracion?select=*`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                }
            }
        );
        
        if (!response.ok) {
            console.log('⚠️ No se pudo cargar configuración');
            return null;
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            configuracionGlobal = data[0];
            console.log('✅ Configuración global cargada:', configuracionGlobal);
        }
        return configuracionGlobal;
    } catch (error) {
        console.error('Error cargando configuración:', error);
        return null;
    }
}

async function cargarHorariosBarberos() {
    try {
        console.log('🌐 Cargando horarios de barberos desde Supabase...');
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/horarios_barberos?select=*`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                }
            }
        );
        
        if (!response.ok) return {};
        
        const data = await response.json();
        
        const horarios = {};
        (data || []).forEach(item => {
            horarios[item.barbero_id] = {
                horariosPorDia: item.horarios_por_dia || {},
                horas: item.horas || [],
                dias: item.dias || []
            };
        });
        
        horariosBarberos = horarios;
        return horarios;
    } catch (error) {
        console.error('Error cargando horarios:', error);
        return {};
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
    
    // ============================================
    // FUNCIÓN GUARDAR COMPLETA
    // ============================================
    guardar: async function(nuevaConfig) {
        try {
            console.log('💾 Guardando configuración global:', nuevaConfig);
            
            const datosAGuardar = {
                duracion_turnos: nuevaConfig.duracion_turnos || 60,
                intervalo_entre_turnos: nuevaConfig.intervalo_entre_turnos || 0,
                modo_24h: nuevaConfig.modo_24h || false,
                max_antelacion_dias: nuevaConfig.max_antelacion_dias || 30
            };
            
            console.log('📤 Datos a enviar:', datosAGuardar);
            
            const checkResponse = await fetch(
                `${window.SUPABASE_URL}/rest/v1/configuracion?select=id`,
                {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                    }
                }
            );
            
            const existe = await checkResponse.json();
            console.log('📋 Registro existente:', existe);
            
            let response;
            let url;
            let method;
            
            if (existe && existe.length > 0) {
                console.log('🔄 Actualizando configuración ID:', existe[0].id);
                url = `${window.SUPABASE_URL}/rest/v1/configuracion?id=eq.${existe[0].id}`;
                method = 'PATCH';
            } else {
                console.log('➕ Insertando nueva configuración');
                url = `${window.SUPABASE_URL}/rest/v1/configuracion`;
                method = 'POST';
            }
            
            response = await fetch(url, {
                method: method,
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(datosAGuardar)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                alert('Error al guardar: ' + errorText);
                return null;
            }
            
            const data = await response.json();
            console.log('✅ Datos guardados:', data);
            
            // Actualizar variable local
            if (Array.isArray(data) && data.length > 0) {
                configuracionGlobal = data[0];
            } else if (data && typeof data === 'object') {
                configuracionGlobal = data;
            } else {
                await cargarConfiguracionGlobal();
            }
            
            console.log('✅ Configuración actualizada:', configuracionGlobal);
            alert('✅ Configuración guardada correctamente');
            
            return configuracionGlobal;
            
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Error: ' + error.message);
            return null;
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
    },
    
    guardarHorariosPorDia: async function(barberoId, horariosPorDia) {
        try {
            console.log(`💾 Guardando horarios por día para barbero ${barberoId}:`, horariosPorDia);
            
            const checkResponse = await fetch(
                `${window.SUPABASE_URL}/rest/v1/horarios_barberos?barbero_id=eq.${barberoId}&select=id,horas,dias`,
                {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                    }
                }
            );
            
            const existe = await checkResponse.json();
            
            let response;
            let url;
            let method;
            let body;
            
            const todasLasHoras = new Set();
            Object.values(horariosPorDia).forEach(horasArray => {
                horasArray.forEach(hora => todasLasHoras.add(hora));
            });
            const horasArray = Array.from(todasLasHoras).sort((a, b) => a - b);
            
            const diasQueTrabajan = Object.keys(horariosPorDia).filter(dia => horariosPorDia[dia].length > 0);
            
            if (existe && existe.length > 0) {
                console.log('🔄 Actualizando registro existente ID:', existe[0].id);
                url = `${window.SUPABASE_URL}/rest/v1/horarios_barberos?id=eq.${existe[0].id}`;
                method = 'PATCH';
                body = JSON.stringify({
                    horarios_por_dia: horariosPorDia,
                    horas: horasArray,
                    dias: diasQueTrabajan
                });
            } else {
                console.log('➕ Insertando nuevo registro');
                url = `${window.SUPABASE_URL}/rest/v1/horarios_barberos`;
                method = 'POST';
                body = JSON.stringify({
                    barbero_id: barberoId,
                    horarios_por_dia: horariosPorDia,
                    horas: horasArray,
                    dias: diasQueTrabajan
                });
            }
            
            response = await fetch(url, {
                method: method,
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: body
            });
            
            if (!response.ok) {
                const error = await response.text();
                console.error('Error guardando horarios:', error);
                alert('Error al guardar horarios: ' + error);
                return null;
            }
            
            const data = await response.json();
            console.log('✅ Horarios guardados exitosamente:', data);
            
            horariosBarberos[barberoId] = {
                horariosPorDia: horariosPorDia,
                horas: horasArray,
                dias: diasQueTrabajan
            };
            
            if (window.dispatchEvent) {
                window.dispatchEvent(new Event('horariosActualizados'));
            }
            
            alert('✅ Horarios guardados correctamente');
            return Array.isArray(data) ? data[0] : data;
            
        } catch (error) {
            console.error('Error en guardarHorariosPorDia:', error);
            alert('Error al guardar horarios: ' + error.message);
            return null;
        }
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
            if (data && data.length > 0) {
                return {
                    horas: data[0].horas || [],
                    dias: data[0].dias || [],
                    horariosPorDia: data[0].horarios_por_dia || {}
                };
            }
            return { horas: [], dias: [], horariosPorDia: {} };
        } catch (error) {
            return { horas: [], dias: [], horariosPorDia: {} };
        }
    },
    
    guardarHorariosBarbero: async function(barberoId, horarios) {
        if (horarios.horariosPorDia) {
            return this.guardarHorariosPorDia(barberoId, horarios.horariosPorDia);
        }
        
        try {
            console.log(`💾 Guardando horarios para barbero ${barberoId} (formato antiguo):`, horarios);
            
            const checkResponse = await fetch(
                `${window.SUPABASE_URL}/rest/v1/horarios_barberos?barbero_id=eq.${barberoId}&select=id`,
                {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`
                    }
                }
            );
            
            const existe = await checkResponse.json();
            
            let response;
            let url;
            let method;
            let body;
            
            if (existe && existe.length > 0) {
                console.log('🔄 Actualizando registro existente ID:', existe[0].id);
                url = `${window.SUPABASE_URL}/rest/v1/horarios_barberos?id=eq.${existe[0].id}`;
                method = 'PATCH';
                body = JSON.stringify({
                    horas: horarios.horas || [],
                    dias: horarios.dias || []
                });
            } else {
                console.log('➕ Insertando nuevo registro');
                url = `${window.SUPABASE_URL}/rest/v1/horarios_barberos`;
                method = 'POST';
                body = JSON.stringify({
                    barbero_id: barberoId,
                    horas: horarios.horas || [],
                    dias: horarios.dias || []
                });
            }
            
            response = await fetch(url, {
                method: method,
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: body
            });
            
            if (!response.ok) {
                const error = await response.text();
                console.error('Error guardando horarios:', error);
                alert('Error al guardar horarios: ' + error);
                return null;
            }
            
            const data = await response.json();
            console.log('✅ Horarios guardados exitosamente:', data);
            
            horariosBarberos[barberoId] = {
                horas: horarios.horas || [],
                dias: horarios.dias || []
            };
            
            if (window.dispatchEvent) {
                window.dispatchEvent(new Event('horariosActualizados'));
            }
            
            alert('✅ Horarios guardados correctamente');
            return Array.isArray(data) ? data[0] : data;
            
        } catch (error) {
            console.error('Error en guardarHorariosBarbero:', error);
            alert('Error al guardar horarios: ' + error.message);
            return null;
        }
    },
    
    horasToIndices: function(horasLegibles) {
        return horasLegibles.map(hora => horaToIndice(hora));
    },
    
    indicesToHoras: function(indices) {
        return indices.map(indice => indiceToHoraLegible(indice));
    }
};

// Cargar configuración al inicio
setTimeout(async () => {
    await cargarConfiguracionGlobal();
    await cargarHorariosBarberos();
}, 1000);

console.log('✅ salonConfig inicializado');

} // ← Cierre del if/else