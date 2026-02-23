// utils/auth-barberos.js - Autenticación para barberos de LAG.barberia

console.log('👤 auth-barberos.js cargado');

// ============================================
// FUNCIONES DE AUTENTICACIÓN PARA BARBEROS
// ============================================

window.loginBarbero = async function(telefono, password) {
    try {
        console.log('🔐 Intentando login de barbero:', telefono);
        
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/barberos?telefono=eq.${telefono}&password=eq.${password}&activo=eq.true&select=*`,
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
        console.log('📋 Resultado login:', data);
        
        if (data && data.length > 0) {
            const barbero = data[0];
            return barbero;
        }
        return null;
    } catch (error) {
        console.error('Error en loginBarbero:', error);
        return null;
    }
};

window.verificarBarberoPorTelefono = async function(telefono) {
    try {
        console.log('🔍 Verificando si es barbero (solo teléfono):', telefono);
        
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/barberos?telefono=eq.${telefono}&activo=eq.true&select=id,nombre,telefono,nivel`,
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
        console.log('📋 Resultado verificación:', data);
        
        if (data && data.length > 0) {
            return data[0];
        }
        return null;
    } catch (error) {
        console.error('Error verificando barbero:', error);
        return null;
    }
};

window.getBarberoAutenticado = function() {
    const auth = localStorage.getItem('barberoAuth');
    if (auth) {
        try {
            return JSON.parse(auth);
        } catch (e) {
            return null;
        }
    }
    return null;
};

// ============================================
// FUNCIONES PARA OBTENER ROL
// ============================================

window.obtenerRolUsuario = async function(telefono) {
    try {
        console.log('🔍 Obteniendo rol para:', telefono);
        
        const telefonoLimpio = telefono.replace(/\D/g, '');
        
        if (telefonoLimpio === '53357234' || telefono === '53357234') {
            console.log('👑 Es el dueño de LAG.barberia');
            return {
                rol: 'admin',
                nombre: 'Dueño'
            };
        }
        
        const barberoRes = await fetch(
            `${window.SUPABASE_URL}/rest/v1/barberos?telefono=eq.${telefonoLimpio}&activo=eq.true&select=id,nombre,nivel`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (barberoRes.ok) {
            const barberos = await barberoRes.json();
            if (barberos && barberos.length > 0) {
                console.log('👨‍🎨 Es barbero:', barberos[0].nombre);
                return {
                    rol: 'barbero',
                    id: barberos[0].id,
                    nombre: barberos[0].nombre,
                    nivel: barberos[0].nivel || 1
                };
            }
        }
        
        return {
            rol: 'cliente',
            nombre: null
        };
        
    } catch (error) {
        console.error('Error obteniendo rol:', error);
        return { rol: 'cliente' };
    }
};

window.tieneAccesoPanel = async function(telefono) {
    const rol = await window.obtenerRolUsuario(telefono);
    return rol.rol === 'admin' || rol.rol === 'barbero';
};

window.getReservasPorBarbero = async function(barberoId, soloActivas = true) {
    try {
        console.log(`📋 Obteniendo reservas para barbero ${barberoId}`);
        let url = `${window.SUPABASE_URL}/rest/v1/reservas?barbero_id=eq.${barberoId}&order=fecha.desc,hora_inicio.asc`;
        
        if (soloActivas) {
            url += '&estado=neq.Cancelado';
        }
        
        const response = await fetch(
            url,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) return [];
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error obteniendo reservas:', error);
        return [];
    }
};