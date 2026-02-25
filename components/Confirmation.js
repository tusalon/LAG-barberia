// components/Confirmation.js - LAG.barberia (SOLO NOTIFICACIÓN WHATSAPP)

function Confirmation({ booking, onReset }) {
    if (!booking) {
        console.error('❌ booking no definido');
        return null;
    }

    // 🔥 Función para notificar al dueño por WhatsApp
    const notificarDuenno = () => {
        try {
            // Obtener fecha con día de la semana
            const fechaConDia = window.formatFechaCompleta ? 
                window.formatFechaCompleta(booking.fecha) : 
                booking.fecha;
            
            // Formatear hora a 12h
            const horaFormateada = formatTo12Hour(booking.hora_inicio);
            
            // 🔥 MENSAJE PARA EL DUEÑO
            const mensaje = 
`📅 *NUEVO TURNO RESERVADO - LAG.barberia*

👤 *Cliente:* ${booking.cliente_nombre}
📱 *WhatsApp:* ${booking.cliente_whatsapp}
💈 *Servicio:* ${booking.servicio} (${booking.duracion} min)
📆 *Fecha:* ${fechaConDia}
⏰ *Hora:* ${horaFormateada}
👨‍🎨 *Barbero:* ${booking.barbero_nombre || booking.trabajador_nombre}

¡Gracias por elegir LAG.barberia! 
Nivel que se Nota. ✂️`;

            const telefonoDueño = "53357234";
            const encodedText = encodeURIComponent(mensaje);
            
            // Abrir WhatsApp con el mensaje
            window.open(`https://api.whatsapp.com/send?phone=${telefonoDueño}&text=${encodedText}`, '_blank');
            
            console.log('📤 Notificación enviada al dueño');
            
        } catch (error) {
            console.error('Error enviando notificación:', error);
        }
    };

    // Enviar notificación automáticamente al cargar la confirmación
    React.useEffect(() => {
        // Pequeño retraso para asegurar que todo esté cargado
        const timer = setTimeout(() => {
            notificarDuenno();
        }, 1000);
        
        return () => clearTimeout(timer);
    }, []); // Solo se ejecuta una vez al montar el componente

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
                        <div className="font-medium text-amber-400">{booking.barbero_nombre || booking.trabajador_nombre}</div>
                    </div>
                </div>
            </div>

            {/* Mensaje de notificación */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 max-w-sm w-full">
                <p className="text-green-700 text-sm flex items-center gap-2">
                    <span>📱</span>
                    <span>Se notificó al dueño por WhatsApp</span>
                </p>
            </div>

            {/* Botón para nueva reserva */}
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button 
                    onClick={onReset}
                    className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                >
                    <span>✂️</span>
                    Nueva Reserva
                </button>
                
                <div className="text-sm text-gray-400 bg-gray-800 p-3 rounded-lg flex items-center justify-center gap-2 border border-amber-700">
                   <i className="icon-smartphone text-amber-500"></i>
                   Contacto: +53 53357234
                </div>
            </div>
        </div>
    );
}