// utils/whatsapp-helper.js - Helper universal para WhatsApp (funciona con Business)

console.log('📱 whatsapp-helper.js cargado');

// Detectar si es dispositivo móvil
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Detectar si es Android (para usar intent://)
const isAndroid = () => {
    return /Android/i.test(navigator.userAgent);
};

// Detectar si es iOS
const isIOS = () => {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

// Función principal que SIEMPRE funciona con Business
window.enviarWhatsAppBusiness = function(telefono, mensaje, esBusiness = true) {
    const telefonoLimpio = telefono.replace(/\D/g, '');
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    console.log('📤 Enviando WhatsApp a:', telefonoLimpio);
    console.log('📱 Dispositivo:', isMobile() ? 'Móvil' : 'Desktop');
    console.log('📱 Android:', isAndroid());
    console.log('📱 iOS:', isIOS());
    
    // SIEMPRE intentar con el formato específico para Business primero
    if (esBusiness) {
        if (isAndroid()) {
            // ✅ ANDROID: Usar intent:// (funciona con Business)
            const intentUrl = `intent://send/${telefonoLimpio}?text=${mensajeCodificado}#Intent;package=com.whatsapp.w4b;scheme=whatsapp;end;`;
            
            // Crear un iframe oculto para intentar
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = intentUrl;
            document.body.appendChild(iframe);
            
            // Si no abre en 800ms, probar con el método universal
            setTimeout(() => {
                document.body.removeChild(iframe);
                window.location.href = `https://api.whatsapp.com/send?phone=${telefonoLimpio}&text=${mensajeCodificado}`;
            }, 800);
            
            return;
        }
        
        if (isIOS()) {
            // ✅ iOS: Usar whatsapp:// (funciona con ambas apps)
            const businessUrl = `whatsapp://send?phone=${telefonoLimpio}&text=${mensajeCodificado}`;
            
            // Intentar abrir
            window.location.href = businessUrl;
            
            // Si no abre en 1 segundo, probar con API
            setTimeout(() => {
                window.location.href = `https://api.whatsapp.com/send?phone=${telefonoLimpio}&text=${mensajeCodificado}`;
            }, 1000);
            
            return;
        }
    }
    
    // Para desktop o como fallback
    if (!isMobile()) {
        // Desktop: usar WhatsApp Web
        window.open(`https://web.whatsapp.com/send?phone=${telefonoLimpio}&text=${mensajeCodificado}`, '_blank');
    } else {
        // Último recurso en móvil
        window.location.href = `https://api.whatsapp.com/send?phone=${telefonoLimpio}&text=${mensajeCodificado}`;
    }
};

// Versión simplificada para usar en toda la app
window.enviarWhatsAppUniversal = function(telefono, mensaje) {
    const telefonoLimpio = telefono.replace(/\D/g, '');
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    if (isMobile()) {
        // ✅ EN MÓVIL: Intentar con la app primero
        
        // Guardar el timestamp actual para detectar si la app se abrió
        const startTime = Date.now();
        
        // Detectar si la página se oculta (la app se abrió)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.log('✅ App de WhatsApp se abrió correctamente');
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                clearTimeout(timeout);
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Intentar con el método que funciona para Business
        if (isAndroid()) {
            // Android: intent:// (funciona con Business)
            const intentUrl = `intent://send/${telefonoLimpio}?text=${mensajeCodificado}#Intent;package=com.whatsapp.w4b;scheme=whatsapp;end;`;
            
            // Crear link y hacer click
            const link = document.createElement('a');
            link.href = intentUrl;
            link.click();
            
        } else {
            // iOS: whatsapp://
            window.location.href = `whatsapp://send?phone=${telefonoLimpio}&text=${mensajeCodificado}`;
        }
        
        // Timeout: si no abrió en 1.5 segundos, usar API
        const timeout = setTimeout(() => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            console.log('⚠️ App no respondió, usando API');
            window.location.href = `https://api.whatsapp.com/send?phone=${telefonoLimpio}&text=${mensajeCodificado}`;
        }, 1500);
        
    } else {
        // Desktop: WhatsApp Web
        window.open(`https://web.whatsapp.com/send?phone=${telefonoLimpio}&text=${mensajeCodificado}`, '_blank');
    }
};

// Función para notificar al cliente aprobado (usa el método Business)
window.notificarClienteAprobado = function(telefono, nombre) {
    const mensaje = 
`✅ *¡FELICIDADES! Has sido ACEPTADO en LAG.barberia*

Hola *${nombre}*, nos complace informarte que tu solicitud de acceso ha sido *APROBADA*.

🎉 *Ya podés reservar turnos:*
• Reservá online las 24/7
• Cancelá turnos desde la app
• Recibí recordatorios automáticos

📱 *Ingresá ahora mismo:*
1. Abrí LAG.barberia desde tu celular
2. Iniciá sesión con tu número
3. Elegí servicio, barbero y horario

✂️ *Nivel que se nota*

LAG.barberia - Donde el estilo se encuentra con la calidad`;

    window.enviarWhatsAppBusiness(telefono, mensaje, true);
};

// Función para cancelación de turnos
window.notificarCancelacion = function(telefono, nombre, fecha, hora, servicio, barbero) {
    const mensaje = 
`❌ *CANCELACIÓN DE TURNO - LAG.barberia*

Hola *${nombre}*, lamentamos informarte que tu turno ha sido cancelado.

📅 *Fecha:* ${fecha}
⏰ *Hora:* ${hora}
💈 *Servicio:* ${servicio}
👨‍🎨 *Barbero:* ${barbero}

🔔 *Motivo:* Cancelación por administración

📱 *¿Querés reprogramar?*
Podés hacerlo desde la app

Disculpá las molestias. Esperamos verte pronto en LAG.barberia ✂️

LAG.barberia - Nivel que se nota`;

    window.enviarWhatsAppUniversal(telefono, mensaje);
};

console.log('✅ whatsapp-helper.js listo para usar');