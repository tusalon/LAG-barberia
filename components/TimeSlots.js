// components/TimeSlots.js - Versión para LAG.barberia (CON HORARIOS POR DÍA Y ANTELACIÓN)

function TimeSlots({ service, date, worker, onTimeSelect, selectedTime }) {
    const [slots, setSlots] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [horariosPorDia, setHorariosPorDia] = React.useState({});
    const [diaTrabaja, setDiaTrabaja] = React.useState(true);
    const [verificacionCompleta, setVerificacionCompleta] = React.useState(false);
    const [maxAntelacionDias, setMaxAntelacionDias] = React.useState(30);

    // ✅ FUNCIÓN DEFINIDA CORRECTAMENTE
    const indiceToHoraLegible = (indice) => {
        const horas = Math.floor(indice / 2);
        const minutos = indice % 2 === 0 ? '00' : '30';
        return `${horas.toString().padStart(2, '0')}:${minutos}`;
    };

    // 🔥 Cargar configuración de antelación máxima
    React.useEffect(() => {
        const cargarConfiguracion = async () => {
            try {
                if (window.salonConfig) {
                    const config = await window.salonConfig.get();
                    console.log('⚙️ Configuración cargada en TimeSlots:', config);
                    if (config && config.max_antelacion_dias) {
                        setMaxAntelacionDias(config.max_antelacion_dias);
                    }
                }
            } catch (error) {
                console.error('Error cargando configuración:', error);
            }
        };
        
        cargarConfiguracion();
    }, []);

    const formatDateLocal = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day).toLocaleDateString();
    };

    const getCurrentLocalDate = () => {
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = (hoy.getMonth() + 1).toString().padStart(2, '0');
        const day = hoy.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    React.useEffect(() => {
        if (!worker) return;
        
        const cargarHorarios = async () => {
            setVerificacionCompleta(false);
            try {
                console.log(`📅 Cargando horarios por día de ${worker.nombre}...`);
                const horarios = await window.salonConfig.getHorariosPorDia(worker.id);
                console.log(`✅ Horarios por día de ${worker.nombre}:`, horarios);
                setHorariosPorDia(horarios);
                
                const tieneHorarios = Object.keys(horarios).length > 0;
                if (!tieneHorarios) {
                    console.log('⚠️ No hay horarios configurados para este barbero');
                }
            } catch (error) {
                console.error('Error cargando horarios:', error);
                setHorariosPorDia({});
            }
        };
        
        cargarHorarios();
    }, [worker]);

    React.useEffect(() => {
        if (!worker || !date) {
            setVerificacionCompleta(false);
            return;
        }

        console.log('🔍 Verificando disponibilidad para:', {
            worker: worker.nombre,
            fecha: date,
            horariosPorDia
        });

        const [año, mes, día] = date.split('-').map(Number);
        const fechaLocal = new Date(año, mes - 1, día);
        
        const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaSemana = diasSemana[fechaLocal.getDay()];
        
        const horariosDelDia = horariosPorDia[diaSemana] || [];
        const trabaja = horariosDelDia.length > 0;
        
        console.log(`🎯 ¿${worker.nombre} trabaja el ${diaSemana}?`, trabaja);
        if (!trabaja && horariosDelDia.length === 0) {
            console.log(`⚠️ No hay horarios configurados para ${diaSemana}`);
        }
        
        setDiaTrabaja(trabaja);
        setVerificacionCompleta(true);
        
    }, [worker, horariosPorDia, date]);

    React.useEffect(() => {
        if (!service || !date || !worker || !verificacionCompleta) return;
        
        if (!diaTrabaja) {
            setSlots([]);
            return;
        }

        const loadSlots = async () => {
            setLoading(true);
            setError(null);
            try {
                // 🔥 VALIDAR ANTELACIÓN MÁXIMA
                const hoy = new Date();
                const fechaSeleccionada = new Date(date + 'T00:00:00');
                const diffTime = fechaSeleccionada - hoy;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays > maxAntelacionDias) {
                    console.log(`🚫 Fecha ${date} supera antelación máxima de ${maxAntelacionDias} días`);
                    setError(`Solo se puede reservar con hasta ${maxAntelacionDias} días de antelación`);
                    setSlots([]);
                    setLoading(false);
                    return;
                }
                
                const [año, mes, día] = date.split('-').map(Number);
                const fechaLocal = new Date(año, mes - 1, día);
                const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
                const diaSemana = diasSemana[fechaLocal.getDay()];
                
                const indicesDelDia = horariosPorDia[diaSemana] || [];
                
                if (indicesDelDia.length === 0) {
                    console.log(`⚠️ No hay horas configuradas para ${diaSemana}`);
                    setSlots([]);
                    setLoading(false);
                    return;
                }
                
                // ✅ USAR LA FUNCIÓN DEFINIDA ARRIBA
                const baseSlots = indicesDelDia.map(indice => indiceToHoraLegible(indice));
                
                console.log(`📋 Slots base para ${diaSemana}:`, baseSlots);
                
                const todayStr = getCurrentLocalDate();
                const esHoy = date === todayStr;
                
                const ahora = new Date();
                const horaActual = ahora.getHours();
                const minutosActuales = ahora.getMinutes();
                const totalMinutosActual = horaActual * 60 + minutosActuales;
                const minAllowedMinutes = totalMinutosActual + 120;
                
                console.log('🕐 Hora actual:', `${horaActual}:${minutosActuales}`);
                console.log('⏱️ Hora mínima permitida (actual + 2h):', 
                    `${Math.floor(minAllowedMinutes / 60)}:${minAllowedMinutes % 60}`);
                console.log('📅 Fecha seleccionada:', date, 'es hoy?', esHoy);
                
                const bookings = await getBookingsByDateAndWorker(date, worker.id);
                
                let availableSlots = baseSlots.filter(slotStartStr => {
                    const slotStart = timeToMinutes(slotStartStr);
                    const slotEnd = slotStart + service.duracion;

                    if (esHoy && slotStart < minAllowedMinutes) {
                        console.log(`⏰ Slot ${slotStartStr} es menor a hora mínima - EXCLUIDO`);
                        return false;
                    }

                    const hasConflict = bookings.some(booking => {
                        const bookingStart = timeToMinutes(booking.hora_inicio);
                        const bookingEnd = timeToMinutes(booking.hora_fin);
                        return (slotStart < bookingEnd) && (slotEnd > bookingStart);
                    });

                    if (!hasConflict) {
                        console.log(`✅ Slot ${slotStartStr} disponible`);
                        return true;
                    } else {
                        console.log(`❌ Slot ${slotStartStr} tiene conflicto - EXCLUIDO`);
                        return false;
                    }
                });
                
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
    }, [service, date, worker, horariosPorDia, diaTrabaja, verificacionCompleta, maxAntelacionDias]);

    if (!service || !date || !worker) return null;

    if (!verificacionCompleta) {
        return (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <i className="icon-clock text-amber-500"></i>
                    4. Elegí un horario con {worker.nombre}
                </h2>
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            </div>
        );
    }

    if (!diaTrabaja) {
        const [año, mes, día] = date.split('-').map(Number);
        const fechaLocal = new Date(año, mes - 1, día);
        const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaSemana = diasSemana[fechaLocal.getDay()];
        const diaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
        
        return (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <i className="icon-clock text-amber-500"></i>
                    4. Elegí un horario con {worker.nombre}
                </h2>
                <div className="text-center p-8 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="icon-calendar-off text-4xl text-yellow-400 mb-3 mx-auto"></div>
                    <p className="text-gray-700 font-medium">
                        {worker.nombre} no trabaja los {diaCapitalizado}s
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Elegí otro día de la semana</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <i className="icon-clock text-amber-500"></i>
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
                    <p className="text-sm text-gray-500 mt-1">Probá con otra fecha</p>
                </div>
            ) : (
                <>
                    <div className="text-sm bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-2 text-amber-700">
                            <i className="icon-clock text-amber-500"></i>
                            <span className="font-medium">
                                Horarios disponibles de {worker.nombre} para {formatDateLocal(date)}:
                            </span>
                        </div>
                    </div>
                    
                    {date === getCurrentLocalDate() && (
                        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg flex items-center gap-2 border border-amber-200">
                            <i className="icon-clock text-amber-500"></i>
                            <span>
                                ⏰ Solo se muestran horarios con al menos 2 horas de anticipación 
                                (hora actual + 2h)
                            </span>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                        {slots.map(time24h => {
                            const time12h = formatTo12Hour(time24h);
                            const isSelected = selectedTime === time24h;
                            const esMediaHora = time24h.includes(':30');
                            
                            return (
                                <button
                                    key={time24h}
                                    onClick={() => onTimeSelect(time24h)}
                                    className={`
                                        py-3 px-2 rounded-lg text-base font-semibold transition-all transform flex flex-col items-center
                                        ${isSelected
                                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg scale-105 ring-2 ring-amber-300'
                                            : 'bg-white text-gray-700 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 hover:scale-105 hover:shadow-md'}
                                    `}
                                >
                                    <span className="text-sm">{esMediaHora ? '⏱️' : '⌛'}</span>
                                    <span>{time12h}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-3 text-center">
                        ⏰ Horarios cada 30 minutos
                    </p>
                </>
            )}
        </div>
    );
}