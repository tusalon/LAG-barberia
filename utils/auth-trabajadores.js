// utils/auth-trabajadores.js - Versión completa con número del dueño actualizado

console.log('👤 auth-trabajadores.js cargado');

// ============================================
// FUNCIONES DE AUTENTICACIÓN PARA TRABAJADORAS
// ============================================

window.loginTrabajadora = async function(telefono, password) {
    try {
        console.log('🔐 Intentando login de trabajadora:', telefono);
        
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/trabajadoras?telefono=eq.${telefono}&password=eq.${password}&activo=eq.true&select=*`,
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
            const trabajadora = data[0];
            return trabajadora;
        }
        return null;
    } catch (error) {
        console.error('Error en loginTrabajadora:', error);
        return null;
    }
};

window.verificarTrabajadoraPorTelefono = async function(telefono) {
    try {
        console.log('🔍 Verificando si es trabajadora (solo teléfono):', telefono);
        
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/trabajadoras?telefono=eq.${telefono}&activo=eq.true&select=id,nombre,telefono`,
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
        console.error('Error verificando trabajadora:', error);
        return null;
    }
};

window.getTrabajadoraAutenticada = function() {
    const auth = localStorage.getItem('trabajadoraAuth');
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
// FUNCIONES PARA OBTENER ROL - DUEÑO ACTUALIZADO
// ============================================

window.obtenerRolUsuario = async function(telefono) {
    try {
        console.log('🔍 Obteniendo rol para:', telefono);
        
        const telefonoLimpio = telefono.replace(/\D/g, '');
        
        // 🔥 CASO 1: Es el dueño? (NUEVO NÚMERO)
        if (telefonoLimpio === '53357234' || telefono === '53357234') {
            console.log('👑 Es el dueño de LAG.barberia');
            return {
                rol: 'admin',
                nombre: 'Dueño'
            };
        }
        
        // Caso 2: Es un barbero?
        const trabajadoraRes = await fetch(
            `${window.SUPABASE_URL}/rest/v1/trabajadoras?telefono=eq.${telefonoLimpio}&activo=eq.true&select=id,nombre`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (trabajadoraRes.ok) {
            const trabajadoras = await trabajadoraRes.json();
            if (trabajadoras && trabajadoras.length > 0) {
                console.log('👨‍🎨 Es barbero:', trabajadoras[0].nombre);
                return {
                    rol: 'trabajadora',
                    id: trabajadoras[0].id,
                    nombre: trabajadoras[0].nombre
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
    return rol.rol === 'admin' || rol.rol === 'trabajadora';
};

window.getReservasPorTrabajadora = async function(trabajadoraId, soloActivas = true) {
    try {
        console.log(`📋 Obteniendo reservas para trabajadora ${trabajadoraId}`);
        let url = `${window.SUPABASE_URL}/rest/v1/benettsalon?trabajador_id=eq.${trabajadoraId}&order=fecha.desc,hora_inicio.asc`;
        
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