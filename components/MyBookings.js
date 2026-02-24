// components/MyBookings.js - Pantalla de reservas del cliente (CON VALIDACIÓN DE 1 HORA)

function MyBookings({ cliente, onVolver }) {
    const [bookings, setBookings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [cancelando, setCancelando] = React.useState(false);
    const [filtro, setFiltro] = React.useState('activas'); // 'activas', 'canceladas', 'todas'
    const [mensajeError, setMensajeError] = React.useState('');

    React.useEffect(() => {
        cargarReservas();
    }, []);

    const cargarReservas = async () => {
        setLoading(true);
        setMensajeError('');
        try {
            // Obtener reservas del cliente por su WhatsApp
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/reservas?cliente_whatsapp=eq.${cliente.whatsapp}&order=fecha.desc,hora_inicio.desc`,
                {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Error al cargar reservas');
            }
            
            const data = await response.json();
            console.log('📋 Reservas del cliente:', data);
            setBookings(Array.isArray(data) ? data : []);
            
        } catch (error) {
            console.error('Error cargando reservas:', error);
            setMensajeError('Error al cargar tus reservas');
        } finally {
            setLoading(false);
        }
    };

    // 🔥 FUNCIÓN PARA VERIFICAR SI SE PUEDE CANCELAR (1 HORA ANTES)
    const puedeCancelar = (fecha, horaInicio) => {
        try {
            const ahora = new Date();
            
            // Crear fecha del turno combinando fecha y hora
            const [year, month, day] = fecha.split('-').map(Number);
            const [hours, minutes] = horaInicio.split(':').map(Number);
            
            const fechaTurno = new Date(year, month - 1, day, hours, minutes, 0);
            
            // Calcular diferencia en milisegundos y convertir a minutos
            const diffMs = fechaTurno - ahora;
            const diffMinutos = Math.floor(diffMs / (1000 * 60));
            
            console.log('🕐 Verificando cancelación:', {
                ahora: ahora.toLocaleString(),
                turno: fechaTurno.toLocaleString(),
                diffMinutos,
                puede: diffMinutos > 60
            });
            
            // ✅ PUEDE CANCELAR SOLO SI FALTAN MÁS DE 60 MINUTOS
            return diffMinutos > 60;
            
        } catch (error) {
            console.error('Error verificando cancelación:', error);
            return false; // Por seguridad, si hay error no permitir cancelar
        }
    };

    // 🔥 FUNCIÓN PARA OBTENER MENSAJE SEGÚN EL TIEMPO RESTANTE
    const getMensajeTiempoRestante = (fecha, horaInicio) => {
        try {
            const ahora = new Date();
            const [year, month, day] = fecha.split('-').map(Number);
            const [hours, minutes] = horaInicio.split(':').map(Number);
            
            const fechaTurno = new Date(year, month - 1, day, hours, minutes, 0);
            
            const diffMs = fechaTurno - ahora;
            const diffMinutos = Math.floor(diffMs / (1000 * 60));
            const diffHoras = Math.floor(diffMinutos / 60);
            const minutosRestantes = diffMinutos % 60;
            
            if (diffMinutos <= 0) {
                return "⏰ El turno ya pasó";
            } else if (diffMinutos <= 60) {
                return `⚠️ Faltan menos de ${diffMinutos} minutos - No podés cancelar`;
            } else if (diffHoras > 0) {
                return `🕐 Faltan ${diffHoras}h ${minutosRestantes}m - Podés cancelar`;
            } else {
                return `🕐 Faltan ${diffMinutos} minutos - Podés cancelar`;
            }
        } catch (error) {
            return "";
        }
    };

    const handleCancelarReserva = async (id, bookingData) => {
        // 🔥 VERIFICAR SI PUEDE CANCELAR
        if (!puedeCancelar(bookingData.fecha, bookingData.hora_inicio)) {
            const mensaje = `❌ No podés cancelar este turno porque faltan menos de 1 hora.
            
📅 Tu turno es el ${bookingData.fecha} a las ${formatTo12Hour(bookingData.hora_inicio)}

⏰ Solo se permiten cancelaciones con al menos 1 hora de anticipación.

Si no podés asistir, contactanos por WhatsApp al +53 53357234`;
            
            alert(mensaje);
            return;
        }
        
        if (!confirm(`¿Estás seguro que querés cancelar tu turno del ${bookingData.fecha} a las ${formatTo12Hour(bookingData.hora_inicio)}?`)) {
            return;
        }
        
        setCancelando(true);
        try {
            // Cancelar la reserva en Supabase
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/reservas?id=eq.${id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ estado: 'Cancelado' })
                }
            );
            
            if (!response.ok) {
                throw new Error('Error al cancelar');
            }
            
            // Notificar al dueño por WhatsApp
            const mensajeParaDueño = 
`❌ *CANCELACIÓN DE CLIENTE - LAG.barberia*

👤 *Cliente:* ${bookingData.cliente_nombre}
📱 *WhatsApp:* ${bookingData.cliente_whatsapp}
📅 *Fecha:* ${bookingData.fecha}
⏰ *Hora:* ${formatTo12Hour(bookingData.hora_inicio)}
💈 *Servicio:* ${bookingData.servicio}
👨‍🎨 *Barbero:* ${bookingData.barbero_nombre || bookingData.trabajador_nombre || 'No asignado'}

El cliente canceló su turno desde la app.`;

            const telefonoDueño = "53357234";
            const encodedText = encodeURIComponent(mensajeParaDueño);
            window.open(`https://wa.me/${telefonoDueño}?text=${encodedText}`, '_blank');
            
            alert('✅ Turno cancelado correctamente');
            
            // Recargar reservas
            await cargarReservas();
            
        } catch (error) {
            console.error('Error cancelando reserva:', error);
            alert('Error al cancelar el turno');
        } finally {
            setCancelando(false);
        }
    };

    // Filtrar reservas según el estado seleccionado
    const reservasFiltradas = bookings.filter(booking => {
        if (filtro === 'activas') return booking.estado !== 'Cancelado';
        if (filtro === 'canceladas') return booking.estado === 'Cancelado';
        return true; // 'todas'
    });

    const activasCount = bookings.filter(b => b.estado !== 'Cancelado').length;
    const canceladasCount = bookings.filter(b => b.estado === 'Cancelado').length;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
                    <button
                        onClick={onVolver}
                        className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition"
                    >
                        <i className="icon-arrow-left text-xl"></i>
                        <span className="font-medium">Volver</span>
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Mis Reservas</h1>
                    <div className="w-20"></div>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-3xl mx-auto px-4 py-6">
                
                {/* Info del cliente */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                            {cliente.nombre.charAt(0)}
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">{cliente.nombre}</p>
                            <p className="text-sm text-gray-500">{cliente.whatsapp}</p>
                        </div>
                    </div>
                </div>

                {/* Mensaje de error si hay */}
                {mensajeError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {mensajeError}
                    </div>
                )}

                {/* Filtros */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFiltro('activas')}
                        className={`
                            px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap
                            ${filtro === 'activas' 
                                ? 'bg-green-600 text-white shadow-md' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                        `}
                    >
                        Activas ({activasCount})
                    </button>
                    <button
                        onClick={() => setFiltro('canceladas')}
                        className={`
                            px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap
                            ${filtro === 'canceladas' 
                                ? 'bg-red-600 text-white shadow-md' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                        `}
                    >
                        Canceladas ({canceladasCount})
                    </button>
                    <button
                        onClick={() => setFiltro('todas')}
                        className={`
                            px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap
                            ${filtro === 'todas' 
                                ? 'bg-amber-600 text-white shadow-md' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                        `}
                    >
                        Todas ({bookings.length})
                    </button>
                </div>

                {/* Listado de reservas */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                        <p className="text-gray-500 mt-4">Cargando tus reservas...</p>
                    </div>
                ) : reservasFiltradas.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <div className="text-6xl mb-4">📅</div>
                        <p className="text-gray-500 mb-2">No tenés reservas {filtro !== 'todas' ? filtro : ''}</p>
                        <button
                            onClick={onVolver}
                            className="text-amber-600 font-medium hover:underline"
                        >
                            Reservar un turno
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reservasFiltradas.map(booking => {
                            const puedeCancelarBooking = booking.estado !== 'Cancelado' && 
                                                         puedeCancelar(booking.fecha, booking.hora_inicio);
                            const tiempoRestante = getMensajeTiempoRestante(booking.fecha, booking.hora_inicio);
                            
                            return (
                                <div
                                    key={booking.id}
                                    className={`
                                        bg-white rounded-xl shadow-sm border-l-4 overflow-hidden
                                        ${booking.estado === 'Cancelado' 
                                            ? 'border-l-red-500 opacity-70' 
                                            : 'border-l-amber-500'}
                                    `}
                                >
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="text-sm text-gray-500">{booking.fecha}</span>
                                                <h3 className="font-bold text-lg">{booking.servicio}</h3>
                                            </div>
                                            <span className={`
                                                px-3 py-1 rounded-full text-xs font-semibold
                                                ${booking.estado === 'Reservado' ? 'bg-green-100 text-green-700' :
                                                  booking.estado === 'Confirmado' ? 'bg-blue-100 text-blue-700' :
                                                  'bg-red-100 text-red-700'}
                                            `}>
                                                {booking.estado}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <i className="icon-clock text-amber-500"></i>
                                                <span>{formatTo12Hour(booking.hora_inicio)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <i className="icon-scissors text-amber-500"></i>
                                                <span>{booking.duracion} min</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600 col-span-2">
                                                <i className="icon-user text-amber-500"></i>
                                                <span>Barbero: {booking.barbero_nombre || booking.trabajador_nombre || 'No asignado'}</span>
                                            </div>
                                        </div>
                                        
                                        {/* 🔥 MOSTRAR TIEMPO RESTANTE PARA RESERVAS ACTIVAS */}
                                        {booking.estado !== 'Cancelado' && (
                                            <div className={`
                                                text-xs p-2 rounded-lg mb-3 flex items-center gap-2
                                                ${puedeCancelarBooking 
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}
                                            `}>
                                                <i className={puedeCancelarBooking ? 'icon-info' : 'icon-alert-triangle'}></i>
                                                <span>{tiempoRestante}</span>
                                            </div>
                                        )}
                                        
                                        {booking.estado !== 'Cancelado' && (
                                            <button
                                                onClick={() => handleCancelarReserva(booking.id, booking)}
                                                disabled={cancelando || !puedeCancelarBooking}
                                                className={`
                                                    w-full py-2 rounded-lg font-medium transition flex items-center justify-center gap-2
                                                    ${puedeCancelarBooking
                                                        ? 'bg-red-50 hover:bg-red-100 text-red-600'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                `}
                                                title={!puedeCancelarBooking ? "Solo se puede cancelar con al menos 1 hora de anticipación" : ""}
                                            >
                                                {cancelando ? (
                                                    <>
                                                        <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                                                        Cancelando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="icon-x-circle"></i>
                                                        {puedeCancelarBooking 
                                                            ? 'Cancelar turno' 
                                                            : 'No se puede cancelar (menos de 1h)'}
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}