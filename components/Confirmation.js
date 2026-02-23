// components/Confirmation.js - Para LAG.barberia

function Confirmation({ booking, onReset }) {
    React.useEffect(() => {
        const phone = "53357234";
        const text = `📅 NUEVO TURNO - LAG.barberia\n👤 Cliente: ${booking.cliente_nombre}\n📱 WhatsApp: ${booking.cliente_whatsapp}\n💈 Servicio: ${booking.servicio} (${booking.duracion} min)\n📆 Fecha: ${booking.fecha}\n⏰ Hora: ${formatTo12Hour(booking.hora_inicio)}`;
        const encodedText = encodeURIComponent(text);
        
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

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <div className="icon-check text-4xl text-white"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Turno Reservado!</h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">Tu cita ha sido agendada correctamente y el equipo de LAG.barberia ha sido notificado.</p>
            
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