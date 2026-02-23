// utils/config.js - Configuración para LAG.barberia

console.log('⚙️ config.js cargado (modo Supabase)');

let configuracionGlobal = {
    duracionTurnos: 60,
    intervaloEntreTurnos: 0,
    modo24h: false
};

let horariosBarberos = {};
let ultimaActualizacion = 0;
const CACHE_DURATION = 5 * 60 * 1000;

async function cargarConfiguracionGlobal() {
    try {
        console.log('🌐 Cargando configuración global desde Supabase...');
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/configuracion?select=*`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            return null;
        }
        
        const data = await response.json();
        if (data && data.length > 0) {
            configuracionGlobal = data[0];
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
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            return {};
        }
        
        const data = await response.json();
        
        const horarios = {};
        data.forEach(item => {
            if (!horarios[item.barbero_id]) {
                horarios[item.barbero_id] = {
                    horas: item.horas || [],
                    dias: item.dias || []
                };
            }
        });
        
        horariosBarberos = horarios;
        return horarios;
    } catch (error) {
        console.error('Error cargando horarios:', error);
        return {};
    }
}

window.salonConfig = {
    get: async function() {
        if (Date.now() - ultimaActualizacion < CACHE_DURATION) {
            return { ...configuracionGlobal };
        }
        
        await cargarConfiguracionGlobal();
        ultimaActualizacion = Date.now();
        return { ...configuracionGlobal };
    },
    
    guardar: async function(nuevaConfig) {
        try {
            console.log('💾 Guardando configuración global:', nuevaConfig);
            
            const checkResponse = await fetch(
                `${window.SUPABASE_URL}/rest/v1/configuracion?select=id`,
                {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const existe = await checkResponse.json();
            
            let response;
            if (existe && existe.length > 0) {
                response = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/configuracion?id=eq.${existe[0].id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify(nuevaConfig)
                    }
                );
            } else {
                response = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/configuracion`,
                    {
                        method: 'POST',
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify(nuevaConfig)
                    }
                );
            }
            
            if (!response.ok) {
                const error = await response.text();
                console.error('Error guardando configuración:', error);
                return null;
            }
            
            const data = await response.json();
            configuracionGlobal = Array.isArray(data) ? data[0] : data;
            ultimaActualizacion = Date.now();
            
            return configuracionGlobal;
        } catch (error) {
            console.error('Error en guardar:', error);
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
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.ok) return { horas: [], dias: [] };
            
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    horas: data[0].horas || [],
                    dias: data[0].dias || []
                };
            }
            return { horas: [], dias: [] };
        } catch (error) {
            console.error('Error obteniendo horarios:', error);
            return { horas: [], dias: [] };
        }
    },
    
    guardarHorariosBarbero: async function(barberoId, horarios) {
        try {
            console.log(`💾 Guardando horarios para barbero ${barberoId}:`, horarios);
            
            const checkResponse = await fetch(
                `${window.SUPABASE_URL}/rest/v1/horarios_barberos?barbero_id=eq.${barberoId}&select=id`,
                {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const existe = await checkResponse.json();
            
            let response;
            if (existe && existe.length > 0) {
                response = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/horarios_barberos?id=eq.${existe[0].id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify({
                            horas: horarios.horas || [],
                            dias: horarios.dias || []
                        })
                    }
                );
            } else {
                response = await fetch(
                    `${window.SUPABASE_URL}/rest/v1/horarios_barberos`,
                    {
                        method: 'POST',
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify({
                            barbero_id: barberoId,
                            horas: horarios.horas || [],
                            dias: horarios.dias || []
                        })
                    }
                );
            }
            
            if (!response.ok) {
                const error = await response.text();
                console.error('Error guardando horarios:', error);
                return null;
            }
            
            const data = await response.json();
            
            horariosBarberos[barberoId] = {
                horas: horarios.horas || [],
                dias: horarios.dias || []
            };
            
            if (window.dispatchEvent) {
                window.dispatchEvent(new Event('horariosActualizados'));
            }
            
            return Array.isArray(data) ? data[0] : data;
        } catch (error) {
            console.error('Error en guardarHorariosBarbero:', error);
            return null;
        }
    }
};

setTimeout(async () => {
    await window.salonConfig.get();
    await cargarHorariosBarberos();
}, 1000);

console.log('✅ salonConfig inicializado');