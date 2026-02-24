// components/Confirmation.js - Para LAG.barberia con descarga automática y botón WhatsApp

function Confirmation({ booking, onReset }) {
    // Descargar archivo ICS automáticamente al cargar la página
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
        
        // Mostrar mensaje en consola
        console.log('📅 Archivo ICS generado y descargado');
    }, [booking]);

    // Función para generar archivo ICS con recordatorios
    const generarICS = (booking) => {
        // Crear fechas en formato correcto para ICS
        const fechaInicio = new Date(booking.fecha + 'T' + booking.hora_inicio + ':00');
        const fechaFin = new Date(booking.fecha + 'T' + booking.hora_fin + ':00');
        
        // Formatear fechas para ICS (YYYYMMDDTHHMMSS)
        const formatICSDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}${month}${day}T${hours}${minutes}${seconds}`;
        };
        
        // Obtener nombre del barbero
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

    // Función para compartir por WhatsApp
    const compartirWhatsApp = () => {
        const mensaje = 
`📅 *TURNO CONFIRMADO - LAG.barberia*

👤 *Cliente:* ${booking.cliente_nombre}
📱 *WhatsApp:* ${booking.cliente_whatsapp}
💈 *Servicio:* ${booking.servicio} (${booking.duracion} min)
📆 *Fecha:* ${booking.fecha}
⏰ *Hora:* ${formatTo12Hour(booking.hora_inicio)}

✅ *Se descargó un archivo .ics*
📲 *Abrilo para agregar el turno a tu calendario*
⏰ *Recibirás recordatorios 1 día antes y 1 hora antes*

¡Gracias por elegir LAG.barberia! ✂️`;

        const encodedText = encodeURIComponent(mensaje);
        const url = `https://wa.me/53357234?text=${encodedText}`;
        window.open(url, '_blank');
    };

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <i className="icon-check text-4xl text-white"></i>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Turno Reservado!</h2>
            <p className="text-gray-500 mb-4 max-w-xs mx-auto">Tu cita ha sido agendada correctamente</p>
            
            {/* Notificación de descarga del calendario */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-sm mx-auto animate-pulse">
                <div className="flex items-start gap-3">
                    <div className="text-amber-500 text-xl">📅</div>
                    <div className="text-left">
                        <p className="font-semibold text-amber-800">¡Archivo descargado!</p>
                        <p className="text-sm text-amber-600">
                            Se descargó un archivo para agregar este turno a tu calendario.
                            <br />
                            <span className="font-medium">Abrilo para recibir recordatorios automáticos.</span>
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Instrucciones según dispositivo */}
            <div className="bg-gray-100 p-4 rounded-lg mb-6 max-w-sm mx-auto text-left text-sm">
                <p className="font-semibold mb-2">📲 ¿Cómo agregarlo a tu calendario?</p>
                <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span><strong>iPhone:</strong> Abrí el archivo descargado → "Agregar a Calendario"</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span><strong>Android:</strong> Abrí el archivo → "Importar a Google Calendar"</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span><strong>PC:</strong> Hacé doble clic en el archivo</span>
                    </li>
                </ul>
            </div>
            
            {/* Botón para compartir por WhatsApp */}
            <button
                onClick={compartirWhatsApp}
                className="mb-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-105"
            >
                <i className="icon-message-circle"></i>
                Compartir detalles por WhatsApp
            </button>
            
            {/* Detalles del turno */}
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
                   <i className="icon-smartphone text-amber-500"></i>
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