// utils/auth-clients.js - VERSIÓN COMPLETA CORREGIDA (CON WHATSAPP BUSINESS)

console.log('🚀 auth-clients.js CARGADO (versión Supabase)');

// ============================================
// FUNCIONES CON SUPABASE
// ============================================

// Verificar si un cliente está autorizado
window.verificarAccesoCliente = async function(whatsapp) {
    try {
        console.log('🔍 Verificando acceso para:', whatsapp);
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/clientes_autorizados?whatsapp=eq.${whatsapp}&select=*`,
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
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('Error verificando acceso:', error);
        return null;
    }
};

// Verificar si un número está autorizado (true/false)
window.isClienteAutorizado = async function(whatsapp) {
    const cliente = await window.verificarAccesoCliente(whatsapp);
    return !!cliente;
};

// FUNCIÓN: Obtener el estado de la solicitud si existe
window.obtenerEstadoSolicitud = async function(whatsapp) {
    try {
        console.log('🔍 Obteniendo estado de solicitud para:', whatsapp);
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/cliente_solicitudes?whatsapp=eq.${whatsapp}&select=estado,id`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            console.error('Error en respuesta:', await response.text());
            return null;
        }
        
        const data = await response.json();
        console.log('📋 Estado obtenido:', data);
        
        if (data.length > 0) {
            return {
                existe: true,
                estado: data[0].estado,
                id: data[0].id
            };
        }
        return { existe: false };
    } catch (error) {
        console.error('Error obteniendo estado:', error);
        return null;
    }
};

// FUNCIÓN PRINCIPAL: Agregar cliente pendiente
window.agregarClientePendiente = async function(nombre, whatsapp) {
    console.log('➕ Agregando cliente pendiente:', { nombre, whatsapp });
    
    try {
        const autorizado = await window.verificarAccesoCliente(whatsapp);
        if (autorizado) {
            console.log('❌ Cliente ya está autorizado');
            alert('Ya tenés acceso al sistema. Puede ingresar directamente.');
            return false;
        }
        
        const estadoSolicitud = await window.obtenerEstadoSolicitud(whatsapp);
        console.log('📋 Estado de solicitud:', estadoSolicitud);
        
        if (estadoSolicitud && estadoSolicitud.existe) {
            
            if (estadoSolicitud.estado === 'pendiente') {
                console.log('❌ Cliente ya tiene solicitud pendiente');
                alert('Ya tenés una solicitud pendiente. El dueño te contactará pronto.');
                return false;
            }
            
            if (estadoSolicitud.estado === 'aprobado') {
                console.log('❌ Cliente ya fue aprobado (inconsistencia)');
                alert('Ya tenés acceso al sistema. Contactá al dueño si tenés problemas.');
                return false;
            }
            
            if (estadoSolicitud.estado === 'rechazado') {
                console.log('🔄 Cliente estaba rechazado, eliminando solicitud anterior...');
                
                await fetch(
                    `${window.SUPABASE_URL}/rest/v1/cliente_solicitudes?id=eq.${estadoSolicitud.id}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'apikey': window.SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                console.log('✅ Solicitud rechazada eliminada');
            }
        }
        
        console.log('🆕 Creando nueva solicitud...');
        
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/cliente_solicitudes`,
            {
                method: 'POST',
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    nombre: nombre,
                    whatsapp: whatsapp,
                    estado: 'pendiente',
                    dispositivo_info: navigator.userAgent
                })
            }
        );
        
        if (!response.ok) {
            const error = await response.text();
            console.error('Error al crear solicitud:', error);
            
            if (response.status === 409) {
                alert('Ya existe una solicitud para este número. Por favor esperá la respuesta del dueño.');
            } else {
                alert('Error al enviar la solicitud. Intentá de nuevo.');
            }
            return false;
        }
        
        const newSolicitud = await response.json();
        console.log('✅ Solicitud creada:', newSolicitud);
        
        // Notificar al admin usando el helper
        const adminPhone = "53357234";
        const text = `🆕 NUEVA SOLICITUD\n\n👤 ${nombre}\n📱 +${whatsapp}`;
        
        if (window.enviarWhatsAppUniversal) {
            window.enviarWhatsAppUniversal(adminPhone, text);
        } else {
            const encodedText = encodeURIComponent(text);
            window.open(`https://api.whatsapp.com/send?phone=${adminPhone}&text=${encodedText}`, '_blank');
        }
        
        return true;
    } catch (error) {
        console.error('Error en agregarClientePendiente:', error);
        alert('Error al procesar la solicitud. Intentá más tarde.');
        return false;
    }
};

// Verificar si tiene solicitud PENDIENTE
window.isClientePendiente = async function(whatsapp) {
    try {
        console.log('🔍 Verificando pendiente para:', whatsapp);
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/cliente_solicitudes?whatsapp=eq.${whatsapp}&estado=eq.pendiente&select=*`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) return false;
        
        const data = await response.json();
        console.log('📋 Resultado pendiente:', data);
        return data.length > 0;
    } catch (error) {
        console.error('Error verificando pendiente:', error);
        return false;
    }
};

// Obtener todas las solicitudes pendientes
window.getClientesPendientes = async function() {
    try {
        console.log('📋 Obteniendo solicitudes pendientes...');
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/cliente_solicitudes?estado=eq.pendiente&order=fecha_solicitud.desc`,
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
            return [];
        }
        
        const data = await response.json();
        console.log('✅ Pendientes obtenidos:', data);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error obteniendo pendientes:', error);
        return [];
    }
};

// Obtener todos los clientes autorizados
window.getClientesAutorizados = async function() {
    try {
        console.log('📋 Obteniendo clientes autorizados...');
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/clientes_autorizados?order=fecha_aprobacion.desc`,
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
            return [];
        }
        
        const data = await response.json();
        console.log('✅ Autorizados obtenidos:', data);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error obteniendo autorizados:', error);
        return [];
    }
};

// 🔥 FUNCIÓN: Aprobar cliente (CON WHATSAPP BUSINESS)
window.aprobarCliente = async function(whatsapp) {
    console.log('✅ Aprobando cliente:', whatsapp);
    
    try {
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/cliente_solicitudes?whatsapp=eq.${whatsapp}&estado=eq.pendiente&select=*`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) return null;
        
        const solicitudes = await response.json();
        if (solicitudes.length === 0) return null;
        
        const solicitud = solicitudes[0];
        
        const insertResponse = await fetch(
            `${window.SUPABASE_URL}/rest/v1/clientes_autorizados`,
            {
                method: 'POST',
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    nombre: solicitud.nombre,
                    whatsapp: solicitud.whatsapp
                })
            }
        );
        
        if (!insertResponse.ok) {
            if (insertResponse.status !== 409) {
                console.error('Error al insertar en autorizados:', await insertResponse.text());
                return null;
            } else {
                console.log('ℹ️ Cliente ya existía en autorizados');
            }
        }
        
        const deleteResponse = await fetch(
            `${window.SUPABASE_URL}/rest/v1/cliente_solicitudes?id=eq.${solicitud.id}`,
            {
                method: 'DELETE',
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!deleteResponse.ok) {
            console.error('Error al eliminar solicitud:', await deleteResponse.text());
        } else {
            console.log('✅ Solicitud eliminada correctamente');
        }
        
        const getResponse = await fetch(
            `${window.SUPABASE_URL}/rest/v1/clientes_autorizados?whatsapp=eq.${whatsapp}&select=*`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const autorizado = await getResponse.json();
        const clienteAprobado = autorizado[0] || null;
        
        console.log('✅ Cliente aprobado exitosamente:', clienteAprobado);
        
        // 🔥 ENVIAR WHATSAPP CON BUSINESS
        if (clienteAprobado) {
            try {
                const telefonoLimpio = clienteAprobado.whatsapp.replace(/\D/g, '');
                
                // ✅ USAR LA FUNCIÓN ESPECÍFICA PARA CLIENTES APROBADOS
                if (window.notificarClienteAprobado) {
                    window.notificarClienteAprobado(telefonoLimpio, clienteAprobado.nombre);
                } else {
                    // Fallback
                    const mensaje = `✅ ¡Hola ${clienteAprobado.nombre}! Tu acceso a LAG.barberia ha sido APROBADO. Ya puede reservar turnos desde la app.`;
                    const encodedText = encodeURIComponent(mensaje);
                    window.open(`https://api.whatsapp.com/send?phone=${telefonoLimpio}&text=${encodedText}`, '_blank');
                }
                
                console.log('📤 Mensaje de bienvenida enviado a:', telefonoLimpio);
                
                // Notificar al admin
                const adminPhone = "53357234";
                const notificacionAdmin = `✅ Cliente ${clienteAprobado.nombre} (+${clienteAprobado.whatsapp}) aprobado y notificado por WhatsApp.`;
                
                if (window.enviarWhatsAppUniversal) {
                    window.enviarWhatsAppUniversal(adminPhone, notificacionAdmin);
                } else {
                    const encodedAdmin = encodeURIComponent(notificacionAdmin);
                    window.open(`https://api.whatsapp.com/send?phone=${adminPhone}&text=${encodedAdmin}`, '_blank');
                }
                
            } catch (error) {
                console.error('Error enviando WhatsApp de bienvenida:', error);
            }
        }
        
        return clienteAprobado;
        
    } catch (error) {
        console.error('Error aprobando cliente:', error);
        return null;
    }
};

// FUNCIÓN: Rechazar cliente
window.rechazarCliente = async function(whatsapp) {
    console.log('❌ Rechazando cliente:', whatsapp);
    
    try {
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/cliente_solicitudes?whatsapp=eq.${whatsapp}&estado=eq.pendiente&select=id`,
            {
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) return false;
        
        const solicitudes = await response.json();
        if (solicitudes.length === 0) return false;
        
        const solicitud = solicitudes[0];
        
        const deleteResponse = await fetch(
            `${window.SUPABASE_URL}/rest/v1/cliente_solicitudes?id=eq.${solicitud.id}`,
            {
                method: 'DELETE',
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!deleteResponse.ok) {
            console.error('Error al eliminar solicitud:', await deleteResponse.text());
            return false;
        }
        
        console.log('✅ Solicitud rechazada eliminada correctamente');
        return true;
        
    } catch (error) {
        console.error('Error rechazando cliente:', error);
        return false;
    }
};

// Eliminar cliente autorizado
window.eliminarClienteAutorizado = async function(whatsapp) {
    console.log('🗑️ Eliminando cliente autorizado:', whatsapp);
    
    try {
        const response = await fetch(
            `${window.SUPABASE_URL}/rest/v1/clientes_autorizados?whatsapp=eq.${whatsapp}`,
            {
                method: 'DELETE',
                headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.ok;
    } catch (error) {
        console.error('Error eliminando autorizado:', error);
        return false;
    }
};

console.log('✅ auth-clientes inicializado (modo Supabase)');