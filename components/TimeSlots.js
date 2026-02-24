// components/TimeSlots.js - Versión para LAG.barberia (CORREGIDO)

function TimeSlots({ service, date, worker, onTimeSelect, selectedTime }) {
    const [slots, setSlots] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [horariosBarbero, setHorariosBarbero] = React.useState(null);
    const [diaTrabaja, setDiaTrabaja] = React.useState(true);
    const [verificacionCompleta, setVerificacionCompleta] = React.useState(false);

    // 🔥 Función para formatear fecha local correctamente
    const formatDateLocal = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day).toLocaleDateString();
    };

    React.useEffect(() => {
        if (!worker) return;
        
        const cargarHorarios = async () => {
            setVerificacionCompleta(false);
            try {
                console.log(`📅 Cargando horarios de ${worker.nombre}...`);
                const horarios = await window.salonConfig.getHorariosBarbero(worker.id);
                console.log(`✅ Horarios de ${worker.nombre}:`, horarios);
                setHorariosBarbero(horarios);
            } catch (error) {
                console.error('Error cargando horarios:', error);
                setHorariosBarbero({ horas: [], dias: [] });
            }
        };
        
        cargarHorarios();
    }, [worker]);

    React.useEffect(() => {
        if (!worker || !horariosBarbero || !date) {
            setVerificacionCompleta(false);
            return;
        }

        console.log('🔍 Verificando disponibilidad para:', {
            worker: worker.nombre,
            fecha: date,
            horarios: horariosBarbero
        });

        const [año, mes, día] = date.split('-').map(Number);
        const fechaLocal = new Date(año, mes - 1, día);
        
        const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaSemana = diasSemana[fechaLocal.getDay()];
        
        if (!horariosBarbero.dias || horariosBarbero.dias.length === 0) {
            console.log('⚠️ No hay configuración de días, se asumen todos disponibles');
            setDiaTrabaja(true);
            setVerificacionCompleta(true);
            return;
        }
        
        const trabaja = horariosBarbero.dias.includes(diaSemana);
        console.log(`🎯 ¿${worker.nombre} trabaja el ${diaSemana}?`, trabaja);
        
        setDiaTrabaja(trabaja);
        setVerificacionCompleta(true);
        
    }, [worker, horariosBarbero, date]);

    React.useEffect(() => {
        if (!service || !date || !worker || !horariosBarbero || !verificacionCompleta) return;
        
        if (!diaTrabaja) {
            setSlots([]);
            return;
        }

        const loadSlots = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!horariosBarbero.horas || horariosBarbero.horas.length === 0) {
                    console.log('⚠️ No hay horas configuradas para este barbero');
                    setSlots([]);
                    setLoading(false);
                    return;
                }
                
                const baseSlots = horariosBarbero.horas.map(h => 
                    `${h.toString().padStart(2, '0')}:00`
                );
                
                const todayStr = getCurrentLocalDate();
                const isToday = date === todayStr;
                
                const bookings = await getBookingsByDateAndWorker(date, worker.id);
                
                let availableSlots = baseSlots.filter(slotStartStr => {
                    const slotStart = timeToMinutes(slotStartStr);
                    const slotEnd = slotStart + service.duracion;

                    const hasConflict = bookings.some(booking => {
                        const bookingStart = timeToMinutes(booking.hora_inicio);
                        const bookingEnd = timeToMinutes(booking.hora_fin);
                        return (slotStart < bookingEnd) && (slotEnd > bookingStart);
                    });

                    return !hasConflict;
                });
                
                if (isToday) {
                    availableSlots = availableSlots.filter(time => !isTimePassedToday(time));
                }
                
                availableSlots.sort();
                console.log(`✅ Slots disponibles para ${worker.nombre} el ${date}:`, availableSlots);
                setSlots(availableSlots);
            } catch (err) {
                console.error(err);
                setError("Error al cargar horarios");
            } finally {
                setLoading(false);
            }
        };

        loadSlots();
    }, [service, date, worker, horariosBarbero, diaTrabaja, verificacionCompleta]);

    if (!service || !date || !worker) return null;

    if (!verificacionCompleta) {
        return (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <div className="icon-clock text-amber-500"></div>
                    4. Elegí un horario con {worker.nombre}
                </h2>
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            </div>
        );
    }

    if (!diaTrabaja) {
        return (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <div className="icon-clock text-amber-500"></div>
                    4. Elegí un horario con {worker.nombre}
                </h2>
                <div className="text-center p-8 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="icon-calendar-off text-4xl text-yellow-400 mb-3 mx-auto"></div>
                    <p className="text-gray-700 font-medium">
                        {worker.nombre} no trabaja este día
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Elegí otro día de la semana</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="icon-clock text-amber-500"></div>
                4. Elegí un horario con {worker.nombre}
                {selectedTime && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2">
                        ✓ Horario seleccionado
                    </span>
                )}
            </h2>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
            ) : slots.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="icon-calendar-x text-4xl text-gray-400 mb-3 mx-auto"></div>
                    <p className="text-gray-700 font-medium">
                        No hay horarios disponibles para {worker.nombre} el {formatDateLocal(date)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Probá con otra fecha o verificá la configuración de horas</p>
                </div>
            ) : (
                <>
                    <div className="text-sm bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-2 text-amber-700">
                            <div className="icon-clock text-amber-500"></div>
                            <span className="font-medium">
                                Horarios disponibles de {worker.nombre} para {formatDateLocal(date)}:
                            </span>
                        </div>
                    </div>
                    
                    {date === getCurrentLocalDate() && (
                        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg flex items-center gap-2 border border-amber-200">
                            <div className="icon-clock text-amber-500"></div>
                            <span>Solo se muestran horarios que aún no pasaron</span>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                        {slots.map(time24h => {
                            const time12h = formatTo12Hour(time24h);
                            const isSelected = selectedTime === time24h;
                            
                            return (
                                <button
                                    key={time24h}
                                    onClick={() => onTimeSelect(time24h)}
                                    className={`
                                        py-3 px-2 rounded-lg text-base font-semibold transition-all transform
                                        ${isSelected
                                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg scale-105 ring-2 ring-amber-300'
                                            : 'bg-white text-gray-700 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 hover:scale-105 hover:shadow-md'}
                                    `}
                                >
                                    {time12h}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}