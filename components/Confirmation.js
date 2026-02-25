// components/Confirmation.js - Para LAG.barberia (CON DÍA DE LA SEMANA)

function Confirmation({ booking, onReset }) {
    if (!booking) {
        console.error('❌ Error: booking no está definido');
        return null;
    }

    React.useEffect(() => {
        console.log('📅 Generando archivo ICS para:', booking);
        
        const timer = setTimeout(() => {
            descargarICS();
        }, 500);
        
        return () => clearTimeout(timer);
    }, [booking]);

    const descargarICS = () => {
        try {
            const icsContent = generarICS(booking);
            
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `turno-LAG-${booking.fecha}.ics`;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(link.href);
            
            console.log('📅 Archivo ICS generado y descargado');
            
            alert('✅ Se descargó un archivo .ics. Abrilo para agregar el turno a tu calendario.');
            
        } catch (error) {
            console.error('Error al descargar archivo ICS:', error);
            alert('⚠️ No se pudo descargar el archivo automáticamente. Usá el botón "Descargar archivo de calendario"');
        }
    };

    const generarICS = (booking) => {
        try {
            const fechaInicio = new Date(booking.fecha + 'T' + booking.hora_inicio + ':00');
            const fechaFin = new Date(booking.fecha + 'T' + booking.hora_fin + ':00');
            
            const formatICSDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}${month}${day}T${hours}${minutes}${seconds}`;
            };
            
            const barberoNombre = booking.barbero_nombre || booking.trabajador_nombre || 'LAG.barberia';
            
            // 🔥 FECHA CON DÍA PARA EL TÍTULO Y RECORDATORIOS
            const fechaConDia = window.formatFechaCompleta ? 
                window.formatFechaCompleta(booking.fecha) : 
                booking.fecha;
            
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
DESCRIPTION:Reserva con ${barberoNombre} - ${fechaConDia}
LOCATION:LAG.barberia
STATUS:CONFIRMED
SEQUENCE:0

BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:📅 Recordatorio: Tu turno en LAG.barberia es MAÑANA (${fechaConDia})
END:VALARM

BEGIN:VALARM
TRIGGER:-PT1H15M
ACTION:DISPLAY
DESCRIPTION:⏰ Recordatorio: Tu turno en LAG.barberia es en 1 hora y 15 minutos (${fechaConDia})
END:VALARM

END:VEVENT
END:VCALENDAR`;
        } catch (error) {
            console.error('Error generando ICS:', error);
            return '';
        }
    };

    // 🔥 Función para compartir por WhatsApp con fecha completa
    const compartirWhatsApp = () => {
        try {
            // 🔥 FECHA CON DÍA DE LA SEMANA
            const fechaConDia = window.formatFechaCompleta ? 
                window.formatFechaCompleta(booking.fecha) : 
                booking.fecha;
            
            const mensaje = 
`📅 *TURNO CONFIRMADO - LAG.barberia*

👤 *Cliente:* ${booking.cliente_nombre}
📱 *WhatsApp:* ${booking.cliente_whatsapp}
💈 *Servicio:* ${booking.servicio} (${booking.duracion} min)
📆 *Fecha:* ${fechaConDia}
⏰ *Hora:* ${formatTo12Hour(booking.hora_inicio)}

✅ *Para recibir recordatorios automáticos:*
1️⃣ Abrí el archivo .ics que se descargó
2️⃣ Elegí "Agregar a Calendario"
3️⃣ Recibirás notificaciones:
   • 1 día antes del turno
   • 1 hora y 15 minutos antes del turno

📲 *Si no ves el archivo descargado, usá el botón "Descargar archivo" abajo*

¡Gracias por elegir LAG.barberia! ✂️`;

            const encodedText = encodeURIComponent(mensaje);
            
            // Usar el helper universal si existe
            if (window.enviarWhatsAppUniversal) {
                window.enviarWhatsAppUniversal("53357234", mensaje);
            } else {
                window.open(`https://api.whatsapp.com/send?phone=53357234&text=${encodedText}`, '_blank');
            }
        } catch (error) {
            console.error('Error al compartir:', error);
            alert('Error al abrir WhatsApp');
        }
    };

    // 🔥 FECHA CON DÍA PARA MOSTRAR EN LOS DETALLES
    const fechaConDia = window.formatFechaCompleta ? 
        window.formatFechaCompleta(booking.fecha) : 
        booking.fecha;

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <i className="icon-check text-4xl text-white"></i>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Turno Reservado!</h2>
            <p className="text-gray-500 mb-4 max-w-xs mx-auto">Tu cita ha sido agendada correctamente</p>
            
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 mb-6 max-w-sm mx-auto">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white text-xl">
                        📥
                    </div>
                    <h3 className="font-bold text-amber-800 text-lg">Archivo descargado</h3>
                </div>
                
                <p className="text-amber-700 text-sm mb-3">
                    Se ha descargado un archivo llamado: <br />
                    <span className="font-mono bg-amber-100 px-2 py-1 rounded text-xs">
                        turno-LAG-{booking.fecha}.ics
                    </span>
                </p>
                
                <div className="bg-white rounded-lg p-3 text-left space-y-2">
                    <p className="font-semibold text-gray-700 text-sm">📲 ¿Cómo agregarlo a tu calendario?</p>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-gray-100 p-2 rounded text-center">
                            <div className="text-xl mb-1">🍎</div>
                            <p className="font-medium">iPhone</p>
                            <p className="text-gray-500">Abrí el archivo → "Agregar a Calendario"</p>
                        </div>
                        <div className="bg-gray-100 p-2 rounded text-center">
                            <div className="text-xl mb-1">📱</div>
                            <p className="font-medium">Android</p>
                            <p className="text-gray-500">Abrí el archivo → "Importar a Google Calendar"</p>
                        </div>
                        <div className="bg-gray-100 p-2 rounded text-center">
                            <div className="text-xl mb-1">💻</div>
                            <p className="font-medium">PC</p>
                            <p className="text-gray-500">Doble clic en el archivo</p>
                        </div>
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-gray-200">
                        <p className="text-xs text-amber-700 font-medium">
                            ⏰ Recibirás alertas:
                        </p>
                        <div className="flex justify-center gap-4 mt-1 text-xs">
                            <span className="bg-amber-100 px-2 py-1 rounded-full">📅 1 día antes</span>
                            <span className="bg-amber-100 px-2 py-1 rounded-full">⏱️ 1h 15min antes</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full max-w-sm mb-6">
                <button
                    onClick={descargarICS}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-105"
                >
                    <i className="icon-download"></i>
                    Descargar archivo de calendario
                </button>
                
                <button
                    onClick={compartirWhatsApp}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-105"
                >
                    <i className="icon-message-circle"></i>
                    Compartir por WhatsApp
                </button>
            </div>
            
            {/* Detalles del turno con fecha completa */}
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
                            {/* 🔥 FECHA COMPLETA CON DÍA DE LA SEMANA */}
                            <div className="font-medium text-amber-400 text-sm">{fechaConDia}</div>
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