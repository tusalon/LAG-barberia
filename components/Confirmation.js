// components/Confirmation.js - Para LAG.barberia con generación de archivo ICS

function Confirmation({ booking, onReset }) {
    React.useEffect(() => {
        // Generar el contenido del archivo ICS
        const icsContent = generarICS(booking);
        
        // Crear un Blob con el contenido ICS
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        
        // Crear un enlace para descargar el archivo
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `turno-LAG-${booking.fecha}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpiar la URL creada
        URL.revokeObjectURL(link.href);
        
        // Mensaje para WhatsApp con instrucciones
        const phone = "53357234";
        const text = `📅 *TURNO CONFIRMADO - LAG.barberia*%0A%0A` +
                    `👤 *Cliente:* ${booking.cliente_nombre}%0A` +
                    `📱 *WhatsApp:* ${booking.cliente_whatsapp}%0A` +
                    `💈 *Servicio:* ${booking.servicio} (${booking.duracion} min)%0A` +
                    `📆 *Fecha:* ${booking.fecha}%0A` +
                    `⏰ *Hora:* ${formatTo12Hour(booking.hora_inicio)}%0A%0A` +
                    `✅ *Se ha descargado un archivo .ics*%0A` +
                    `📲 *Para agregarlo a tu calendario:*%0A` +
                    `• *iPhone:* Abrí el archivo → "Agregar a Calendario"%0A` +
                    `• *Android:* Abrí el archivo → "Importar a Google Calendar"%0A` +
                    `• *PC:* Hacé doble clic en el archivo%0A%0A` +
                    `⏰ *Recordatorios automáticos:*%0A` +
                    `• 1 día antes del turno%0A` +
                    `• 1 hora antes del turno%0A%0A` +
                    `¡Gracias por elegir LAG.barberia! ✂️`;
        
        const encodedText = encodeURIComponent(text);
        
        // Abrir WhatsApp con el mensaje
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isIOS) {
            window.location.href = `whatsapp://send?phone=${phone}&text=${encodedText}`;
            setTimeout(() => {
                window.location.href = `https://wa.me/${phone}?text=${encodedText}`;
            }, 500);
        } else {
            window.location.href = `https://wa.me/${phone}?text=${encodedText}`;
        }
    }, [booking]);

    // Función para generar archivo ICS con recordatorios
    const generarICS = (booking) => {
        // Crear fechas en formato correcto para ICS
        const fechaInicio = new Date(booking.fecha + 'T' + booking.hora_inicio + ':00');
        const fechaFin = new Date(booking.fecha + 'T' + booking.hora_fin + ':00');
        
        // Formatear fechas para ICS (YYYYMMDDTHHMMSSZ)
        const formatICSDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}${month}${day}T${hours}${minutes}${seconds}`;
        };
        
        // Obtener nombre del barbero o usar valor por defecto
        const barberoNombre = booking.barbero_nombre || booking.trabajador_nombre || 'LAG.barberia';
        
        // Crear contenido ICS con dos recordatorios (1 día antes y 1 hora antes)
        return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LAG.barberia//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}-${Math.random().toString(36).substring(2)}@LAG.barberia
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(fechaInicio)}
DTEND:${formatICSDate(fechaFin)}
SUMMARY:${booking.servicio} - LAG.barberia
DESCRIPTION:Reserva con ${barberoNombre}
LOCATION:LAG.barberia
STATUS:CONFIRMED
SEQUENCE:0
X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-ADDRESS=LAG.barberia:geo:0,0
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:🔔 Recordatorio: Tu turno es mañana en LAG.barberia
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:⏰ Recordatorio: Tu turno es en 1 hora en LAG.barberia
END:VALARM
END:VEVENT
END:VCALENDAR`;
    };

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <div className="icon-check text-4xl text-white"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Turno Reservado!</h2>
            <p className="text-gray-500 mb-4 max-w-xs mx-auto">Tu cita ha sido agendada correctamente</p>
            
            {/* Notificación de descarga del calendario */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-sm mx-auto">
                <div className="flex items-start gap-3">
                    <div className="text-amber-500 text-xl">📅</div>
                    <div className="text-left">
                        <p className="font-semibold text-amber-800">Recordatorio automático</p>
                        <p className="text-sm text-amber-600">
                            Se ha descargado un archivo para agregar este turno a tu calendario.
                            Recibirás notificaciones 1 día antes y 1 hora antes.
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-2xl shadow-sm border border-amber-600 w-full max-w-sm mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                <div className="space-y-4 text-left">
                    <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Nombre</div>
                        <div className="font-medium text-amber-400 text-lg">{booking.cliente_nombre}</div>
                    </div>
                    
                    <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">WhatsApp</div>
                        <div className="font-medium text-amber-400">{booking.cliente_whatsapp}</div>
                    </div>
                    
                    <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Servicio</div>
                        <div className="font-medium text-amber-400">{booking.servicio}</div>
                        <div className="text-sm text-gray-400">{booking.duracion} min</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Fecha</div>
                            <div className="font-medium text-amber-400">{booking.fecha}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Hora</div>
                            <div className="font-medium text-amber-400">{formatTo12Hour(booking.hora_inicio)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                <div className="text-sm text-gray-400 bg-gray-800 p-3 rounded-lg flex items-center justify-center gap-2 border border-amber-700">
                   <div className="icon-smartphone text-amber-500"></div>
                   Contacto: +53 53357234
                </div>
                
                <button 
                    onClick={onReset}
                    className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition-colors"
                >
                    Nueva Reserva
                </button>
            </div>
        </div>
    );
}