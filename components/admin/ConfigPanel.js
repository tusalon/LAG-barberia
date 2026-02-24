// components/admin/ConfigPanel.js - CON HORARIOS CADA 30 MINUTOS (CORREGIDO)

function ConfigPanel({ barberoId, modoRestringido }) {
    const [barberos, setBarberos] = React.useState([]);
    const [barberoSeleccionado, setBarberoSeleccionado] = React.useState(null);
    const [horarios, setHorarios] = React.useState({});
    // 🔥 CORREGIDO: Usar nombres con guión bajo para coincidir con la BD
    const [configGlobal, setConfigGlobal] = React.useState({
        duracion_turnos: 60,
        intervalo_entre_turnos: 0,
        modo_24h: false
    });
    const [cargando, setCargando] = React.useState(true);

    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const diasNombres = {
        lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
        jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo'
    };

    // OPCIONES DE DURACIÓN POR DEFECTO
    const opcionesDuracion = [
        { value: 30, label: '30 min', icon: '⏱️' },
        { value: 45, label: '45 min', icon: '⏰' },
        { value: 60, label: '60 min', icon: '⌛' },
        { value: 75, label: '75 min', icon: '⏳' },
        { value: 90, label: '90 min', icon: '🕐' },
        { value: 120, label: '120 min', icon: '🕑' }
    ];

    // GENERAR HORAS CADA 30 MINUTOS (0:00, 0:30, 1:00, 1:30, etc.)
    const horas = Array.from({ length: 48 }, (_, i) => {
        const hora = Math.floor(i / 2);
        const minutos = i % 2 === 0 ? '00' : '30';
        return {
            value: i,
            horaReal: hora,
            minutos: minutos,
            label: `${hora.toString().padStart(2, '0')}:${minutos}`
        };
    });

    React.useEffect(() => {
        cargarDatos();
    }, []);

    React.useEffect(() => {
        if (modoRestringido && barberoId) {
            setBarberoSeleccionado(barberoId);
        }
    }, [modoRestringido, barberoId]);

    const cargarDatos = async () => {
        setCargando(true);
        try {
            if (window.salonBarberos) {
                const lista = await window.salonBarberos.getAll(true);
                setBarberos(lista || []);
                
                if (!modoRestringido && lista && lista.length > 0) {
                    setBarberoSeleccionado(lista[0].id);
                }
            }
            
            if (!modoRestringido && window.salonConfig) {
                const config = await window.salonConfig.get();
                // 🔥 MAPEAR los nombres si vienen de la BD
                setConfigGlobal(config || {
                    duracion_turnos: 60,
                    intervalo_entre_turnos: 0,
                    modo_24h: false
                });
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setCargando(false);
        }
    };

    React.useEffect(() => {
        if (barberoSeleccionado) {
            cargarHorariosBarbero(barberoSeleccionado);
        }
    }, [barberoSeleccionado]);

    const cargarHorariosBarbero = async (id) => {
        try {
            const horariosBarbero = await window.salonConfig.getHorariosBarbero(id);
            setHorarios(prev => ({
                ...prev,
                [id]: horariosBarbero
            }));
        } catch (error) {
            console.error('Error cargando horarios:', error);
        }
    };

    const toggleDia = (dia) => {
        if (!barberoSeleccionado) return;
        
        const horariosActuales = horarios[barberoSeleccionado] || { horas: [], dias: [] };
        const diasActuales = horariosActuales.dias || [];
        
        const nuevosDias = diasActuales.includes(dia)
            ? diasActuales.filter(d => d !== dia)
            : [...diasActuales, dia];
        
        setHorarios({
            ...horarios,
            [barberoSeleccionado]: {
                ...horariosActuales,
                dias: nuevosDias
            }
        });
    };

    // FUNCIÓN PARA TRABAJAR CON ÍNDICES DE 30 MIN
    const toggleHora = (indice) => {
        if (!barberoSeleccionado) return;
        
        const horariosActuales = horarios[barberoSeleccionado] || { horas: [], dias: [] };
        const horasActuales = horariosActuales.horas || [];
        
        const nuevasHoras = horasActuales.includes(indice)
            ? horasActuales.filter(h => h !== indice)
            : [...horasActuales, indice].sort((a, b) => a - b);
        
        setHorarios({
            ...horarios,
            [barberoSeleccionado]: {
                ...horariosActuales,
                horas: nuevasHoras
            }
        });
    };

    const handleGuardarConfigGlobal = async () => {
        if (modoRestringido) return;
        
        try {
            // 🔥 Pasar directamente configGlobal (ya tiene los nombres correctos)
            await window.salonConfig.guardar(configGlobal);
            alert('✅ Configuración global guardada');
        } catch (error) {
            alert('Error al guardar configuración global');
        }
    };

    const handleGuardarHorariosBarbero = async () => {
        if (!barberoSeleccionado) return;
        
        try {
            const horariosAGuardar = horarios[barberoSeleccionado] || { horas: [], dias: [] };
            await window.salonConfig.guardarHorariosBarbero(
                barberoSeleccionado, 
                horariosAGuardar
            );
            alert('✅ Horarios guardados para el barbero');
        } catch (error) {
            alert('Error al guardar horarios');
        }
    };

    if (cargando) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Cargando configuración...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-xl font-bold mb-6">
                {modoRestringido ? '⚙️ Mi Configuración' : '⚙️ Configuración de la Barbería'}
            </h2>
            
            {!modoRestringido && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
                    <h3 className="font-semibold text-lg mb-4">⚙️ Configuración General</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duración por defecto (min)
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                                {opcionesDuracion.map(opcion => (
                                    <button
                                        key={opcion.value}
                                        type="button"
                                        onClick={() => setConfigGlobal({
                                            ...configGlobal, 
                                            duracion_turnos: opcion.value  // 🔥 CORREGIDO
                                        })}
                                        className={`
                                            py-2 px-1 rounded-lg text-xs font-medium transition-all flex flex-col items-center
                                            ${configGlobal.duracion_turnos === opcion.value  // 🔥 CORREGIDO
                                                ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-300'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:border-amber-400 hover:bg-amber-50'
                                            }
                                        `}
                                    >
                                        <span className="text-lg mb-1">{opcion.icon}</span>
                                        <span>{opcion.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Intervalo entre turnos (min)
                            </label>
                            <input
                                type="number"
                                value={configGlobal.intervalo_entre_turnos || 0}  // 🔥 CORREGIDO
                                onChange={(e) => setConfigGlobal({
                                    ...configGlobal, 
                                    intervalo_entre_turnos: parseInt(e.target.value) || 0  // 🔥 CORREGIDO
                                })}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                min="0"
                                step="5"
                            />
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={configGlobal.modo_24h || false}  // 🔥 CORREGIDO
                                onChange={(e) => setConfigGlobal({
                                    ...configGlobal, 
                                    modo_24h: e.target.checked  // 🔥 CORREGIDO
                                })}
                                className="w-5 h-5 text-amber-600"
                            />
                            <span className="text-sm text-gray-700">Modo 24 horas</span>
                        </label>
                    </div>
                    
                    <button
                        onClick={handleGuardarConfigGlobal}
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition text-sm"
                    >
                        Guardar Configuración Global
                    </button>
                </div>
            )}
            
            {!modoRestringido && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seleccionar Barbero
                    </label>
                    <select
                        value={barberoSeleccionado || ''}
                        onChange={(e) => setBarberoSeleccionado(parseInt(e.target.value))}
                        className="w-full border rounded-lg px-3 py-2"
                    >
                        <option value="">Seleccione un barbero</option>
                        {barberos.map(b => (
                            <option key={b.id} value={b.id}>{b.nombre}</option>
                        ))}
                    </select>
                </div>
            )}
            
            {modoRestringido && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                        <i className="icon-info"></i>
                        <span>Estás configurando tus propios horarios de trabajo</span>
                    </div>
                </div>
            )}
            
            {barberoSeleccionado && (
                <div className="space-y-6">
                    <h3 className="font-semibold text-lg">
                        📅 Horarios de {
                            modoRestringido 
                                ? 'mi trabajo'
                                : barberos.find(b => b.id === barberoSeleccionado)?.nombre
                        }
                    </h3>
                    
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-700">Días laborales</h4>
                        <div className="flex flex-wrap gap-2">
                            {dias.map(dia => {
                                const activo = horarios[barberoSeleccionado]?.dias?.includes(dia) || false;
                                return (
                                    <button
                                        key={dia}
                                        onClick={() => toggleDia(dia)}
                                        className={`
                                            px-3 py-2 rounded-lg text-sm font-medium transition
                                            ${activo 
                                                ? 'bg-amber-600 text-white shadow-md' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                                        `}
                                    >
                                        {diasNombres[dia]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* HORAS CADA 30 MINUTOS */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-700">Horas disponibles (cada 30 min)</h4>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                            {horas.map(hora => {
                                const activa = horarios[barberoSeleccionado]?.horas?.includes(hora.value) || false;
                                return (
                                    <button
                                        key={hora.value}
                                        onClick={() => toggleHora(hora.value)}
                                        className={`
                                            px-2 py-1 text-xs font-medium rounded transition-all
                                            ${activa 
                                                ? 'bg-amber-600 text-white shadow-md hover:bg-amber-700' 
                                                : 'bg-white border border-gray-300 text-gray-700 hover:border-amber-400 hover:bg-amber-50'}
                                        `}
                                    >
                                        {hora.label}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            ⏰ Horarios disponibles cada 30 minutos (9:00, 9:30, 10:00, etc.)
                        </p>
                    </div>
                    
                    <button
                        onClick={handleGuardarHorariosBarbero}
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
                    >
                        Guardar {modoRestringido ? 'Mis Horarios' : `Horarios de ${barberos.find(b => b.id === barberoSeleccionado)?.nombre}`}
                    </button>
                </div>
            )}
        </div>
    );
}