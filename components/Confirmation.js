// components/Confirmation.js - LAG.barberia (ICS 100% compatible)

function Confirmation({ booking, onReset }) {
    if (!booking) {
        console.error('❌ booking no definido');
        return null;
    }

    React.useEffect(() => {
        const timer = setTimeout(() => {
            descargarICS();
        }, 500);

        return () => clearTimeout(timer);
    }, [booking]);

    // ✅ Formateo UTC obligatorio para compatibilidad total
    const formatICSDateUTC = (date) => {
        const pad = (n) => String(n).padStart(2, '0');

        return (
            date.getUTCFullYear() +
            pad(date.getUTCMonth() + 1) +
            pad(date.getUTCDate()) + 'T' +
            pad(date.getUTCHours()) +
            pad(date.getUTCMinutes()) +
            pad(date.getUTCSeconds()) + 'Z'
        );
    };

    const generarICS = (booking) => {
        try {
            const fechaInicio = new Date(`${booking.fecha}T${booking.hora_inicio}:00`);
            const fechaFin = new Date(`${booking.fecha}T${booking.hora_fin}:00`);

            const barberoNombre =
                booking.barbero_nombre ||
                booking.trabajador_nombre ||
                'LAG.barberia';

            const fechaConDia = window.formatFechaCompleta
                ? window.formatFechaCompleta(booking.fecha)
                : booking.fecha;

            const uid = `${Date.now()}-${Math.random().toString(36).substring(2)}@lagbarberia.com`;

            return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LAG.barberia//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDateUTC(new Date())}
DTSTART:${formatICSDateUTC(fechaInicio)}
DTEND:${formatICSDateUTC(fechaFin)}
SUMMARY:${booking.servicio} - LAG.barberia
DESCRIPTION:Reserva con ${barberoNombre} - ${fechaConDia}
LOCATION:LAG.barberia
STATUS:CONFIRMED
SEQUENCE:0

BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:📅 Recordatorio: Tu turno es MAÑANA (${fechaConDia})
END:VALARM

BEGIN:VALARM
TRIGGER:-PT1H15M
ACTION:DISPLAY
DESCRIPTION:⏰ Recordatorio: Tu turno es en 1 hora y 15 minutos (${fechaConDia})
END:VALARM

END:VEVENT
END:VCALENDAR`;
        } catch (error) {
            console.error('Error generando ICS:', error);
            return '';
        }
    };

    const descargarICS = () => {
        try {
            const icsContent = generarICS(booking);

            const blob = new Blob([icsContent], {
                type: 'text/calendar;charset=utf-8'
            });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `turno-LAG-${booking.fecha}.ics`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(link.href);

            alert('✅ Archivo .ics descargado. Abrilo para agregar el turno al calendario.');
        } catch (error) {
            console.error('Error descargando ICS:', error);
            alert('❌ No se pudo descargar el archivo.');
        }
    };

    const compartirWhatsApp = () => {
        try {
            const fechaConDia = window.formatFechaCompleta
                ? window.formatFechaCompleta(booking.fecha)
                : booking.fecha;

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

¡Gracias por elegir LAG.barberia! ✂️`;

            const encodedText = encodeURIComponent(mensaje);

            window.open(
                `https://api.whatsapp.com/send?phone=53357234&text=${encodedText}`,
                '_blank'
            );
        } catch (error) {
            console.error('Error WhatsApp:', error);
        }
    };

    const fechaConDia = window.formatFechaCompleta
        ? window.formatFechaCompleta(booking.fecha)
        : booking.fecha;

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <i className="icon-check text-4xl text-white"></i>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Turno Reservado!</h2>
            <p className="text-gray-500 mb-4 max-w-xs mx-auto">Tu cita ha sido agendada correctamente</p>

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
                            <div className="font-medium text-amber-400 text-sm">{fechaConDia}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Hora</div>
                            <div className="font-medium text-amber-400">{formatTo12Hour(booking.hora_inicio)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm">
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

                <button
                    onClick={onReset}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-medium transition-all"
                >
                    Nueva Reserva
                </button>
            </div>
        </div>
    );
}