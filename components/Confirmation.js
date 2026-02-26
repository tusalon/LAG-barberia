// components/Confirmation.js - CON NOTIFICACIÓN NTFY PARA RESERVAS (CORREGIDO)

function Confirmation({ booking, onReset }) {
    if (!booking) {
        console.error('❌ booking no definido');
        return null;
    }

    // 🔥 FUNCIÓN PARA NOTIFICAR AL DUEÑO POR NTFY
    const notificarDuenno = () => {
        try {
            // Obtener fecha con día de la semana
            const fechaConDia = window.formatFechaCompleta ? 
                window.formatFechaCompleta(booking.fecha) : 
                booking.fecha;
            
            // Formatear hora a 12h
            const horaFormateada = formatTo12Hour(booking.hora_inicio);
            
            // Obtener nombre del barbero
            const barbero = booking.barbero_nombre || booking.trabajador_nombre || 'No asignado';
            
            // 🔥 MENSAJE PARA NTFY (sin emojis)
            const mensajeLimpio = 
`NUEVA RESERVA

Cliente: ${booking.cliente_nombre}
WhatsApp: ${booking.cliente_whatsapp}
Servicio: ${booking.servicio} (${booking.duracion} min)
Fecha: ${fechaConDia}
Hora: ${horaFormateada}
Barbero: ${barbero}`;

            // Enviar a ntfy.sh
            fetch('https://ntfy.sh/lag-barberia', {
                method: 'POST',
                body: mensajeLimpio,
                headers: {
                    'Title': 'Nueva reserva - LAG.barberia',
                    'Priority': 'default',
                    'Tags': 'tada'
                }
            })
            .then(response => {
                if (response.ok) {
                    console.log('✅ Notificación de reserva enviada a ntfy');
                } else {
                    console.error('❌ Error en respuesta:', response.status);
                }
            })
            .catch(error => {
                console.error('❌ Error enviando notificación:', error);
            });
            
        } catch (error) {
            console.error('Error enviando notificación:', error);
        }
    };

    // 🔥 ENVIAR NOTIFICACIÓN AUTOMÁTICAMENTE AL CARGAR
    React.useEffect(() => {
        const timer = setTimeout(() => {
            notificarDuenno();
        }, 1500); // 1.5 segundos después de mostrar la confirmación
        
        return () => clearTimeout(timer);
    }, []);

    // Formatear fecha para mostrar
    const fechaConDia = window.formatFechaCompleta ? 
        window.formatFechaCompleta(booking.fecha) : 
        booking.fecha;

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <i className="icon-check text-4xl text-white"></i>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Turno Reservado!</h2>
            <p className="text-gray-500 mb-6 max-w-xs mx-auto">Tu cita ha sido agendada correctamente</p>

            {/* Detalles del turno */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-sm border border-amber-600 w-full max-w-sm mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                <div className="space-y-4 text-left">
                    <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Cliente</div>
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
                    
                    <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Barbero</div>
                        <div className="font-medium text-amber-400">{booking.barbero_nombre || booking.trabajador_nombre || 'No asignado'}</div>
                    </div>
                </div>
            </div>

            {/* Mensaje de confirmación de notificación */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-sm w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                        📱
                    </div>
                    <div className="text-left">
                        <p className="font-medium text-green-800">Dueño notificado</p>
                        <p className="text-xs text-green-600">Se envió una notificación push al dueño</p>
                    </div>
                </div>
            </div>

            {/* Botón para nueva reserva */}
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button 
                    onClick={onReset}
                    className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 text-lg"
                >
                    <span>✂️</span>
                    Reservar otro turno
                </button>
                
                <div className="text-sm text-gray-400 bg-gray-800 p-4 rounded-lg flex items-center justify-center gap-2 border border-amber-700">
                   <i className="icon-smartphone text-amber-500 text-xl"></i>
                   <span>Contacto: +53 53357234</span>
                </div>
            </div>
        </div>
    );
}