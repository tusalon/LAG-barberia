// components/admin/ConfigPanel.js - VERSIÓN CON DEBUG EXTREMO

function ConfigPanel({ barberoId, modoRestringido }) {
    const [barberos, setBarberos] = React.useState([]);
    const [barberoSeleccionado, setBarberoSeleccionado] = React.useState(null);
    const [mostrarEditorPorDia, setMostrarEditorPorDia] = React.useState(false);
    const [configGlobal, setConfigGlobal] = React.useState({
        duracion_turnos: 60,
        intervalo_entre_turnos: 0,
        modo_24h: false,
        max_antelacion_dias: 30
    });
    const [cargando, setCargando] = React.useState(true);
    const [errorCarga, setErrorCarga] = React.useState(null);

    const opcionesDuracion = [
        { value: 30, label: '30 min', icon: '⏱️' },
        { value: 45, label: '45 min', icon: '⏰' },
        { value: 60, label: '60 min', icon: '⌛' },
        { value: 75, label: '75 min', icon: '⏳' },
        { value: 90, label: '90 min', icon: '🕐' },
        { value: 120, label: '120 min', icon: '🕑' }
    ];

    const opcionesAntelacion = [
        { value: 3, label: '3 días', icon: '🔜' },
        { value: 4, label: '4 días', icon: '📅' },
        { value: 5, label: '5 días', icon: '📆' },
        { value: 6, label: '6 días', icon: '🗓️' },
        { value: 7, label: '7 días', icon: '📆' },
        { value: 15, label: '15 días', icon: '📅' },
        { value: 30, label: '30 días', icon: '📅' },
        { value: 60, label: '60 días', icon: '📆' }
    ];

    React.useEffect(() => {
        console.log('🔍 [ConfigPanel] Montado - modoRestringido:', modoRestringido, 'barberoId:', barberoId);
        cargarDatos();
    }, []);

    React.useEffect(() => {
        if (modoRestringido && barberoId) {
            console.log('🔍 [ConfigPanel] Modo restringido, seleccionando barbero:', barberoId);
            setBarberoSeleccionado(barberoId);
        }
    }, [modoRestringido, barberoId]);

    const cargarDatos = async () => {
        console.log('🔄 [ConfigPanel] Iniciando carga de datos');
        setCargando(true);
        setErrorCarga(null);
        
        try {
            // PASO 1: Verificar si window.salonBarberos existe
            console.log('🔍 [ConfigPanel] Verificando window.salonBarberos:', {
                existe: !!window.salonBarberos,
                tipo: typeof window.salonBarberos,
                objeto: window.salonBarberos
            });
            
            if (!window.salonBarberos) {
                console.error('❌ [ConfigPanel] window.salonBarberos NO existe');
                setErrorCarga('Error: sistema de barberos no disponible');
                setBarberos([]);
                setCargando(false);
                return;
            }
            
            // PASO 2: Intentar cargar barberos
            console.log('📋 [ConfigPanel] Llamando a window.salonBarberos.getAll(true)...');
            const listaBarberos = await window.salonBarberos.getAll(true);
            console.log('✅ [ConfigPanel] Resultado de getAll:', {
                existe: !!listaBarberos,
                esArray: Array.isArray(listaBarberos),
                longitud: listaBarberos?.length,
                datos: listaBarberos
            });
            
            if (listaBarberos && Array.isArray(listaBarberos)) {
                console.log(`✅ [ConfigPanel] Se cargaron ${listaBarberos.length} barberos`);
                setBarberos(listaBarberos);
                
                // PASO 3: Seleccionar primer barbero si es admin
                if (!modoRestringido && listaBarberos.length > 0) {
                    const primerBarbero = listaBarberos[0];
                    console.log('🎯 [ConfigPanel] Seleccionando primer barbero:', {
                        id: primerBarbero.id,
                        nombre: primerBarbero.nombre
                    });
                    setBarberoSeleccionado(primerBarbero.id);
                }
            } else {
                console.warn('⚠️ [ConfigPanel] No se obtuvieron barberos o no es array');
                setBarberos([]);
            }
            
            // PASO 4: Cargar configuración global si es admin
            if (!modoRestringido && window.salonConfig) {
                console.log('🌐 [ConfigPanel] Cargando configuración global...');
                const config = await window.salonConfig.get();
                console.log('📋 [ConfigPanel] Configuración global:', config);
                setConfigGlobal(config || {
                    duracion_turnos: 60,
                    intervalo_entre_turnos: 0,
                    modo_24h: false,
                    max_antelacion_dias: 30
                });
            }
            
        } catch (error) {
            console.error('❌ [ConfigPanel] Error en cargarDatos:', error);
            setErrorCarga(error.message);
            setBarberos([]);
        } finally {
            console.log('✅ [ConfigPanel] Carga finalizada');
            setCargando(false);
        }
    };

    // Función para recargar manualmente
    const handleRecargar = () => {
        console.log('🔄 [ConfigPanel] Recargando manualmente...');
        cargarDatos();
    };

    const abrirEditorPorDia = () => {
        if (!barberoSeleccionado) {
            alert('Seleccioná un barbero primero');
            return;
        }
        console.log('📅 [ConfigPanel] Abriendo editor para barbero:', barberoSeleccionado);
        setMostrarEditorPorDia(true);
    };

    const handleGuardarConfigGlobal = async () => {
        if (modoRestringido) return;
        
        try {
            console.log('💾 [ConfigPanel] Guardando config global:', configGlobal);
            await window.salonConfig.guardar(configGlobal);
            alert('✅ Configuración global guardada');
        } catch (error) {
            console.error('❌ [ConfigPanel] Error guardando:', error);
            alert('Error al guardar configuración global');
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
            
            {/* 🔥 PANEL DE DEBUG - Solo visible para admin */}
            {!modoRestringido && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">🔍 Estado de depuración</h3>
                    <div className="space-y-1 text-sm">
                        <p><span className="font-medium">window.salonBarberos:</span> {window.salonBarberos ? '✅ Existe' : '❌ No existe'}</p>
                        <p><span className="font-medium">Barberos en estado:</span> {barberos.length}</p>
                        <p><span className="font-medium">Barbero seleccionado:</span> {barberoSeleccionado || 'ninguno'}</p>
                        {errorCarga && (
                            <p className="text-red-600"><span className="font-medium">Error:</span> {errorCarga}</p>
                        )}
                        <button
                            onClick={handleRecargar}
                            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                        >
                            🔄 Recargar datos
                        </button>
                    </div>
                </div>
            )}
            
            {!modoRestringido && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
                    <h3 className="font-semibold text-lg mb-4">⚙️ Configuración General</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {/* Duración por defecto */}
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
                                            duracion_turnos: opcion.value
                                        })}
                                        className={`
                                            py-2 px-1 rounded-lg text-xs font-medium transition-all flex flex-col items-center
                                            ${configGlobal.duracion_turnos === opcion.value
                                                ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-300'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:border-amber-400 hover:bg-amber-50'}
                                        `}
                                    >
                                        <span className="text-lg mb-1">{opcion.icon}</span>
                                        <span>{opcion.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Intervalo entre turnos */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Intervalo entre turnos (min)
                            </label>
                            <input
                                type="number"
                                value={configGlobal.intervalo_entre_turnos || 0}
                                onChange={(e) => setConfigGlobal({
                                    ...configGlobal, 
                                    intervalo_entre_turnos: parseInt(e.target.value) || 0
                                })}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                min="0"
                                step="5"
                            />
                        </div>
                    </div>
                    
                    {/* ANTELACIÓN MÁXIMA */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Antelación máxima para reservar
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                            {opcionesAntelacion.map(opcion => (
                                <button
                                    key={opcion.value}
                                    type="button"
                                    onClick={() => setConfigGlobal({
                                        ...configGlobal, 
                                        max_antelacion_dias: opcion.value
                                    })}
                                    className={`
                                        py-2 px-1 rounded-lg text-xs font-medium transition-all flex flex-col items-center
                                        ${configGlobal.max_antelacion_dias === opcion.value
                                            ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-300'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:border-amber-400 hover:bg-amber-50'}
                                    `}
                                >
                                    <span className="text-lg mb-1">{opcion.icon}</span>
                                    <span>{opcion.label}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Los clientes solo podrán reservar con hasta esta cantidad de días de antelación
                        </p>
                    </div>
                    
                    {/* Modo 24h */}
                    <div className="mb-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={configGlobal.modo_24h || false}
                                onChange={(e) => setConfigGlobal({
                                    ...configGlobal, 
                                    modo_24h: e.target.checked
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
                    <div className="flex gap-2">
                        <select
                            value={barberoSeleccionado || ''}
                            onChange={(e) => {
                                const valor = e.target.value;
                                console.log('🎯 [ConfigPanel] Seleccionando barbero:', valor);
                                setBarberoSeleccionado(valor ? parseInt(valor) : null);
                            }}
                            className="flex-1 border rounded-lg px-3 py-2"
                        >
                            <option value="">Seleccione un barbero</option>
                            {barberos.map(b => (
                                <option key={b.id} value={b.id}>
                                    {b.nombre} {b.activo ? '' : '(inactivo)'}
                                </option>
                            ))}
                        </select>
                        
                        <button
                            onClick={abrirEditorPorDia}
                            disabled={!barberoSeleccionado}
                            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Configurar horarios
                        </button>
                    </div>
                    
                    {barberos.length === 0 && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 font-medium">❌ No hay barberos cargados</p>
                            <p className="text-sm text-red-600 mt-1">
                                Ve a la pestaña "Barberos" y crea al menos un barbero activo.
                            </p>
                        </div>
                    )}
                </div>
            )}
            
            {modoRestringido && barberoId && (
                <div className="mb-4">
                    <button
                        onClick={abrirEditorPorDia}
                        className="w-full bg-amber-600 text-white px-4 py-3 rounded-lg hover:bg-amber-700 font-medium"
                    >
                        Configurar mis horarios por día
                    </button>
                    
                    <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                            <i className="icon-info"></i>
                            <span>Podés configurar diferentes horarios para cada día de la semana</span>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal para editor por día */}
            {mostrarEditorPorDia && barberoSeleccionado && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <HorariosPorDiaPanel
                            barberoId={barberoSeleccionado}
                            barberoNombre={barberos.find(b => b.id === barberoSeleccionado)?.nombre || 'Barbero'}
                            onGuardar={(horarios) => {
                                console.log('✅ [ConfigPanel] Horarios guardados');
                                setMostrarEditorPorDia(false);
                            }}
                            onCancelar={() => setMostrarEditorPorDia(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}