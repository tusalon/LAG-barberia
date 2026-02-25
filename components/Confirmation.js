// components/Confirmation.js - LAG.barberia (VERSIÓN ULTRA SIMPLE)

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

    // ✅ Función de formateo SIMPLE y SEGURA
    const formatearFechaICS = (fecha) => {
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        const hora = String(fecha.getHours()).padStart(2, '0');
        const minuto = String(fecha.getMinutes()).padStart(2, '0');
        const segundo = String(fecha.getSeconds()).padStart(2, '0');
        
        // Formato: 20260325T143000
        return `${año}${mes}${dia}T${hora}${minuto}${segundo}`;
    };

    const generarICS = () => {
        try {
            // Crear fechas
            const fechaInicio = new Date(booking.fecha + 'T' + booking.hora_inicio + ':00');
            const fechaFin = new Date(booking.fecha + 'T' + booking.hora_fin + ':00');
            
            const ahora = new Date();
            
            const barbero = booking.barbero_nombre || booking.trabajador_nombre || 'LAG.barberia';
            
            // 🔥 ICS SIMPLE - SIN COMENTARIOS, SIN CARACTERES EXTRAÑOS
            return [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//LAG.barberia//ES',
                'CALSCALE:GREGORIAN',
                'METHOD:PUBLISH',
                'BEGIN:VEVENT',
                'UID:' + Date.now() + '@lagbarberia.com',
                'DTSTAMP:' + formatearFechaICS(ahora),
                'DTSTART:' + formatearFechaICS(fechaInicio),
                'DTEND:' + formatearFechaICS(fechaFin),
                'SUMMARY:' + booking.servicio + ' - LAG.barberia',
                'DESCRIPTION:Con ' + barbero,
                'LOCATION:LAG.barberia',
                'STATUS:CONFIRMED',
                'BEGIN:VALARM',
                'TRIGGER:-P1D',
                'ACTION:DISPLAY',
                'DESCRIPTION:Recordatorio 1 dia antes',
                'END:VALARM',
                'BEGIN:VALARM',
                'TRIGGER:-PT1H15M',
                'ACTION:DISPLAY',
                'DESCRIPTION:Recordatorio 1h 15m antes',
                'END:VALARM',
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\r\n'); // Usar \r\n que es el estándar de Windows
            
        } catch (error) {
            console.error('Error generando ICS:', error);
            return '';
        }
    };

    const descargarICS = () => {
        try {
            const icsContent = generarICS();
            
            console.log('📄 CONTENIDO DEL ICS:');
            console.log(icsContent);
            
            const blob = new Blob([icsContent], { 
                type: 'text/calendar;charset=utf-8' 
            });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'turno-LAG-' + booking.fecha + '.ics';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(link.href);
            
            alert('✅ Archivo descargado. Intentá abrirlo con Google Calendar.');
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error al descargar');
        }
    };

    const compartirWhatsApp = () => {
        const fecha = booking.fecha;
        const hora = formatTo12Hour(booking.hora_inicio);
        const mensaje = `Turno confirmado en LAG.barberia - ${fecha} a las ${hora}`;
        const url = `https://api.whatsapp.com/send?phone=53357234&text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <i className="icon-check text-4xl text-white"></i>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Turno Reservado!</h2>
            <p className="text-gray-500 mb-4">Tu cita ha sido agendada correctamente</p>

            <div className="bg-gray-800 p-6 rounded-xl text-white w-full max-w-sm mb-6 text-left">
                <p className="mb-2"><span className="text-amber-400">Cliente:</span> {booking.cliente_nombre}</p>
                <p className="mb-2"><span className="text-amber-400">Servicio:</span> {booking.servicio}</p>
                <p className="mb-2"><span className="text-amber-400">Fecha:</span> {booking.fecha}</p>
                <p className="mb-2"><span className="text-amber-400">Hora:</span> {formatTo12Hour(booking.hora_inicio)}</p>
                <p><span className="text-amber-400">Barbero:</span> {booking.barbero_nombre || booking.trabajador_nombre}</p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm">
                <button
                    onClick={descargarICS}
                    className="bg-amber-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-amber-700 transition"
                >
                    📥 Descargar archivo de calendario
                </button>

                <button
                    onClick={compartirWhatsApp}
                    className="bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition"
                >
                    📱 Compartir por WhatsApp
                </button>

                <button
                    onClick={onReset}
                    className="bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 transition"
                >
                    ↻ Nueva Reserva
                </button>
            </div>
        </div>
    );
}