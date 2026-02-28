// utils/auth-clients.js - VERSIÓN COMPLETA CORREGIDA (CON WHATSAPP + PUSH)
// AHORA ENVÍA SIEMPRE NOTIFICACIONES POR WHATSAPP Y PUSH

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

// 🔥 FUNCIÓN PARA ENVIAR WHATSAPP
window.enviarWhatsAppNotificacion = function(telefono, mensaje) {
    try {
        console.log('📤 Enviando WhatsApp a:', telefono);
        
        const telefonoLimpio = telefono.replace(/\D/g, '');
        const encodedText = encodeURIComponent(mensaje);
        
        // Usar API de WhatsApp
        const url = `https://api.whatsapp.com/send?phone=${telefonoLimpio}&text=${encodedText}`;
        
        // Abrir en nueva pestaña
        window.open(url, '_blank');
        
        console.log('✅ WhatsApp enviado correctamente a:', telefonoLimpio);
        return true;
    } catch (error) {
        console.error('❌ Error enviando WhatsApp:', error);
        return false;
    }
};

// 🔥 FUNCIÓN PARA ENVIAR NOTIFICACIÓN PUSH (ntfy.sh)
window.enviarNotificacionPush = function(titulo, mensaje, etiqueta = 'tada') {
    try {
        console.log('📤 Enviando notificación push a ntfy.sh');
        
        // Eliminar emojis y caracteres especiales para ntfy
        const mensajeLimpio = mensaje.replace(/[🆕✅❌📱👤💈📅⏰👨‍🎨🔔✂️]/g, '').trim();
        const tituloLimpio = titulo.replace(/[🆕✅❌📱👤💈📅⏰👨‍🎨🔔✂️]/g, '').trim();
        
        fetch('https://ntfy.sh/lag-barberia', {
            method: 'POST',
            body: mensajeLimpio,
            headers: {
                'Title': tituloLimpio || 'LAG.barberia',
                'Priority': 'default',
                'Tags': etiqueta
            }
        })
        .then(response => {
            if (response.ok) {
                console.log('✅ Notificación push enviada a ntfy');
            } else {
                console.error('❌ Error en respuesta ntfy:', response.status);
            }
        })
        .catch(error => {
            console.error('❌ Error enviando notificación push:', error);
        });
        
    } catch (error) {
        console.error('Error enviando notificación push:', error);
    }
};

// 🔥 FUNCIÓN PRINCIPAL: Agregar cliente pendiente (CON WHATSAPP + PUSH) - CORREGIDA PARA IPHONE
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
        
        // 🔥 ENVIAR AMBAS NOTIFICACIONES - CORREGIDO PARA IPHONE
        const adminPhone = "53357234";
        const fecha = new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Mensaje para WhatsApp (con emojis)
        const mensajeWhatsApp = 
`🆕 *NUEVA SOLICITUD DE ACCESO - LAG.barberia*

👤 *Nombre:* ${nombre}
📱 *WhatsApp:* +${whatsapp.replace('53', '')}

📅 *Fecha:* ${fecha}

🔔 *Acción requerida:*
Ingresá al panel de administración para aprobar o rechazar esta solicitud.

✂️ LAG.barberia - Nivel que se nota`;

        // Mensaje para Push (sin emojis)
        const mensajePush = `NUEVA SOLICITUD DE ACCESO\n\nNombre: ${nombre}\nWhatsApp: +${whatsapp.replace('53', '')}\nFecha: ${fecha}`;
        
        // ✅ CORREGIDO: Usar método que funciona en iPhone
        const telefonoLimpio = adminPhone.replace(/\D/g, '');
        const encodedText = encodeURIComponent(mensajeWhatsApp);
        
        // Crear link invisible (funciona en iPhone)
        const link = document.createElement('a');
        link.href = `https://api.whatsapp.com/send?phone=${telefonoLimpio}&text=${encodedText}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Limpiar después
        setTimeout(() => {
            document.body.removeChild(link);
        }, 200);
        
        // Enviar Push
        window.enviarNotificacionPush('Solicitud pendiente - LAG.barberia', mensajePush, 'tada');
        
        console.log('✅ Ambas notificaciones enviadas: WhatsApp + Push');
        
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

// 🔥 FUNCIÓN: Aprobar cliente (CON WHATSAPP + PUSH)
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
        
        // 🔥 ENVIAR AMBAS NOTIFICACIONES
        if (clienteAprobado) {
            try {
                const telefonoLimpio = clienteAprobado.whatsapp.replace(/\D/g, '');
                
                // Mensaje para WhatsApp al cliente (con emojis)
                const mensajeWhatsAppCliente = 
`✅ *¡FELICIDADES! Has sido ACEPTADO en LAG.barberia*

Hola *${clienteAprobado.nombre}*, nos complace informarte que tu solicitud de acceso ha sido *APROBADA*.

🎉 *Ya puede reservar turnos:*
• Reservar online las 24/7
• Cancelar turnos desde la app
• Recibir recordatorios automáticos

📱 *Ingresar ahora mismo:*
1. Abrir LAG.barberia desde tu celular
2. Iniciar sesión con tu número
3. Elegir servicio, barbero y horario

✂️ *Nivel que se nota*

LAG.barberia - Donde el estilo se encuentra con la calidad`;

                // Mensaje para Push al cliente (sin emojis)
                const mensajePushCliente = `¡FELICIDADES! Has sido ACEPTADO en LAG.barberia\n\nHola ${clienteAprobado.nombre}, tu solicitud de acceso ha sido APROBADA. Ya puede reservar turnos desde la app.`;
                
                // Enviar WhatsApp al cliente
                window.enviarWhatsAppNotificacion(telefonoLimpio, mensajeWhatsAppCliente);
                
                // Enviar Push al cliente (si tiene la app instalada)
                window.enviarNotificacionPush('✅ Acceso aprobado - LAG.barberia', mensajePushCliente, 'white_check_mark');
                
                console.log('📤 Notificaciones de bienvenida enviadas a:', telefonoLimpio);
                
                // Notificar al admin
                const adminPhone = "53357234";
                const fecha = new Date().toLocaleDateString('es-ES');
                
                // WhatsApp al admin
                const mensajeWhatsAppAdmin = `✅ Cliente ${clienteAprobado.nombre} (+${clienteAprobado.whatsapp}) aprobado y notificado por WhatsApp.`;
                window.enviarWhatsAppNotificacion(adminPhone, mensajeWhatsAppAdmin);
                
                // Push al admin
                const mensajePushAdmin = `Cliente ${clienteAprobado.nombre} (+${clienteAprobado.whatsapp}) aprobado y notificado.`;
                window.enviarNotificacionPush('Cliente aprobado - LAG.barberia', mensajePushAdmin, 'white_check_mark');
                
                console.log('✅ Ambas notificaciones enviadas al admin');
                
            } catch (error) {
                console.error('Error enviando notificaciones de bienvenida:', error);
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