// components/ClientAuthScreen.js - VERSIÓN CON IMAGEN DE FONDO Y NOTIFICACIONES CORREGIDAS

function ClientAuthScreen({ onAccessGranted, onGoBack }) {
    const [nombre, setNombre] = React.useState('');
    const [whatsapp, setWhatsapp] = React.useState('');
    const [solicitudEnviada, setSolicitudEnviada] = React.useState(false);
    const [error, setError] = React.useState('');
    const [clienteAutorizado, setClienteAutorizado] = React.useState(null);
    const [verificando, setVerificando] = React.useState(false);
    const [yaTieneSolicitud, setYaTieneSolicitud] = React.useState(false);
    const [estadoRechazado, setEstadoRechazado] = React.useState(false);
    const [esBarbero, setEsBarbero] = React.useState(false);
    const [barberoInfo, setBarberoInfo] = React.useState(null);
    const [esDuenno, setEsDuenno] = React.useState(false);
    const [imagenCargada, setImagenCargada] = React.useState(false);

    // Cargar imagen de fondo
    React.useEffect(() => {
        const img = new Image();
        img.src = '/LAG-barberia/images/LAG.barberia.jpg';
        img.onload = () => {
            console.log('✅ Imagen cargada correctamente');
            setImagenCargada(true);
        };
        img.onerror = () => {
            console.error('❌ Error cargando imagen');
            setImagenCargada(true);
        };
    }, []);

    const clienteYaTieneSolicitud = async (whatsapp) => {
        try {
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/cliente_solicitudes?whatsapp=eq.${whatsapp}&select=estado`,
                {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                    }
                }
            );
            if (!response.ok) return false;
            const data = await response.json();
            return data.length > 0;
        } catch (error) {
            console.error('Error verificando solicitud:', error);
            return false;
        }
    };

    const verificarNumero = async (numero) => {
        if (numero.length < 8) {
            setClienteAutorizado(null);
            setYaTieneSolicitud(false);
            setEstadoRechazado(false);
            setEsBarbero(false);
            setBarberoInfo(null);
            setEsDuenno(false);
            setError('');
            return;
        }
        
        setVerificando(true);
        
        const numeroLimpio = numero.replace(/\D/g, '');
        const numeroCompleto = `53${numeroLimpio}`;
        
        try {
            if (numeroLimpio === '53357234') {
                setEsDuenno(true);
                setEsBarbero(false);
                setBarberoInfo(null);
                setClienteAutorizado(null);
                setError('👑 Acceso como dueño detectado');
                setVerificando(false);
                return;
            }
            
            if (window.verificarBarberoPorTelefono) {
                const barbero = await window.verificarBarberoPorTelefono(numeroLimpio);
                if (barbero) {
                    setEsBarbero(true);
                    setBarberoInfo(barbero);
                    setEsDuenno(false);
                    setClienteAutorizado(null);
                    setError('👨‍🎨 Acceso como barbero detectado');
                    setVerificando(false);
                    return;
                }
            }
            
            const yaExiste = await clienteYaTieneSolicitud(numeroCompleto);
            if (yaExiste) {
                const pendiente = await window.isClientePendiente?.(numeroCompleto);
                if (pendiente) {
                    setError('Ya tenés una solicitud pendiente. El dueño te contactará pronto.');
                } else {
                    setError('Este número ya fue registrado anteriormente.');
                }
                setVerificando(false);
                return;
            }
            
            setEsDuenno(false);
            setEsBarbero(false);
            setBarberoInfo(null);
            
            const existe = await window.verificarAccesoCliente(numeroCompleto);
            
            if (existe) {
                setClienteAutorizado(existe);
                setYaTieneSolicitud(false);
                setEstadoRechazado(false);
                setError('');
            } else {
                setClienteAutorizado(null);
                
                if (window.obtenerEstadoSolicitud) {
                    const estado = await window.obtenerEstadoSolicitud(numeroCompleto);
                    
                    if (estado && estado.existe) {
                        if (estado.estado === 'pendiente') {
                            setYaTieneSolicitud(true);
                            setEstadoRechazado(false);
                            setError('Ya tenés una solicitud pendiente.');
                        } 
                        else if (estado.estado === 'rechazado') {
                            setYaTieneSolicitud(false);
                            setEstadoRechazado(true);
                            setError('Tu solicitud anterior fue rechazada.');
                        }
                        else {
                            setYaTieneSolicitud(true);
                            setEstadoRechazado(false);
                            setError('Este número ya fue registrado.');
                        }
                    } else {
                        setYaTieneSolicitud(false);
                        setEstadoRechazado(false);
                        setError('');
                    }
                }
            }
        } catch (err) {
            console.error('Error verificando:', err);
        } finally {
            setVerificando(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!nombre.trim() || !whatsapp.trim()) {
            setError('Completá todos los campos');
            return;
        }
        
        if (esDuenno || esBarbero) {
            return;
        }
        
        setVerificando(true);
        
        const numeroLimpio = whatsapp.replace(/\D/g, '');
        const numeroCompleto = `53${numeroLimpio}`;
        
        try {
            const autorizado = await window.verificarAccesoCliente(numeroCompleto);
            
            if (autorizado) {
                onAccessGranted(autorizado.nombre, numeroCompleto);
                return;
            }
            
            const yaExiste = await clienteYaTieneSolicitud(numeroCompleto);
            if (yaExiste) {
                const pendiente = await window.isClientePendiente?.(numeroCompleto);
                if (pendiente) {
                    setError('Ya tenés una solicitud pendiente.');
                } else {
                    setError('Este número ya fue registrado anteriormente.');
                }
                setVerificando(false);
                return;
            }
            
            const agregado = await window.agregarClientePendiente(nombre, numeroCompleto);
            
            if (agregado) {
                setSolicitudEnviada(true);
                setError('');
                
                // 🔥 ENVIAR NOTIFICACIÓN AL DUEÑO POR NTFY (VERSIÓN CORREGIDA)
                try {
                    // Eliminar caracteres especiales y emojis del mensaje
                    const mensajeLimpio = `NUEVA SOLICITUD DE ACCESO\n\nNombre: ${nombre}\nWhatsApp: +${whatsapp}`;
                    
                    // Título sin emojis
                    const tituloLimpio = 'Solicitud pendiente - LAG.barberia';
                    
                    fetch('https://ntfy.sh/lag-barberia', {
                        method: 'POST',
                        body: mensajeLimpio,
                        headers: {
                            'Title': tituloLimpio,
                            'Priority': 'default',
                            'Tags': 'tada'
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            console.log('✅ Notificación enviada a ntfy');
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
            }
        } catch (err) {
            console.error('Error en submit:', err);
            setError('Error en el sistema. Intentá más tarde.');
        } finally {
            setVerificando(false);
        }
    };

    const handleAccesoDirecto = () => {
        if (clienteAutorizado) {
            const numeroLimpio = whatsapp.replace(/\D/g, '');
            const numeroCompleto = `53${numeroLimpio}`;
            onAccessGranted(clienteAutorizado.nombre, numeroCompleto);
        }
    };

    if (solicitudEnviada) {
        return (
            <div className="min-h-screen bg-white flex flex-col relative overflow-hidden animate-fade-in">
                {/* Imagen de fondo */}
                <div className="absolute inset-0 z-0">
                    {!imagenCargada && (
                        <div className="w-full h-full bg-gradient-to-br from-amber-900 to-gray-900 animate-pulse"></div>
                    )}
                    <img 
                        src="/LAG-barberia/images/LAG.barberia.jpg"
                        alt="Barbería LAG.barberia" 
                        className={`w-full h-full object-cover transition-opacity duration-500 ${imagenCargada ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/70 to-transparent"></div>
                </div>

                {/* Botón volver */}
                {onGoBack && (
                    <button
                        onClick={onGoBack}
                        className="absolute top-4 left-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors border border-white/20"
                        title="Volver"
                    >
                        <i className="icon-arrow-left text-white text-xl"></i>
                    </button>
                )}
                
                {/* Contenido */}
                <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
                    <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl">
                        <div className="icon-check text-5xl text-white"></div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-3 text-center">¡Solicitud Enviada!</h2>
                    
                    <div className="bg-black/60 backdrop-blur-md p-6 rounded-2xl shadow-2xl max-w-md mb-6 border border-amber-500/30 w-full">
                        <p className="text-gray-200 mb-4 text-center">
                            Gracias por querer ser parte de <span className="font-bold text-amber-400">LAG.barberia</span>
                        </p>
                        
                        <div className="bg-black/40 p-4 rounded-xl text-left space-y-2 mb-4 border border-amber-500/20">
                            <p className="text-sm text-gray-300">
                                <span className="font-semibold text-amber-400">📱 Tu número:</span> +{whatsapp}
                            </p>
                            <p className="text-sm text-gray-300">
                                <span className="font-semibold text-amber-400">👤 Nombre:</span> {nombre}
                            </p>
                        </div>
                        
                        <p className="text-gray-300 text-sm text-center">
                            El dueño revisará tu solicitud y te contactará por WhatsApp.
                        </p>
                    </div>
                    
                    <div className="text-sm text-gray-400 text-center">
                        <p>Mientras tanto, puede contactarnos:</p>
                        <a 
                            href="https://api.whatsapp.com/send?phone=53357234&text=Hola%20LAG.barberia%2C%20consulté%20mi%20solicitud%20de%20acceso" 
                            target="_blank" 
                            className="text-amber-400 font-medium inline-flex items-center gap-1 mt-2 hover:text-amber-300 transition-colors"
                        >
                            <div className="icon-message-circle"></div>
                            +53 53357234
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col relative overflow-hidden animate-fade-in">
            {/* Imagen de fondo */}
            <div className="absolute inset-0 z-0">
                {!imagenCargada && (
                    <div className="w-full h-full bg-gradient-to-br from-amber-900 to-gray-900 animate-pulse"></div>
                )}
                <img 
                    src="/LAG-barberia/images/LAG.barberia.jpg"
                    alt="Barbería LAG.barberia" 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${imagenCargada ? 'opacity-100' : 'opacity-0'}`}
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/70 to-transparent"></div>
            </div>

            {/* Botón volver */}
            {onGoBack && (
                <button
                    onClick={onGoBack}
                    className="absolute top-4 left-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors border border-white/20"
                    title="Volver"
                >
                    <i className="icon-arrow-left text-white text-xl"></i>
                </button>
            )}
            
            {/* Contenido */}
            <div className="relative z-10 flex flex-col justify-end min-h-screen p-6 pb-12">
                <div className="max-w-md w-full mx-auto">
                    {/* Título oculto (solo para estructura) */}
                    <div className="text-center mb-4 opacity-0 h-0">
                        <h1 className="text-4xl font-bold text-white">LAG.barberia</h1>
                        <p className="text-gray-200 text-lg">Acceso para clientes y barberos</p>
                    </div>

                    {/* Tabla de acceso */}
                    <div className="bg-black/60 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-amber-500/30">
                        <h2 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                            <i className="icon-user-plus"></i>
                            Ingresá con tu número
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Tu nombre completo
                                </label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        esDuenno || esBarbero 
                                            ? 'bg-gray-800/50 border-gray-600 text-gray-400 cursor-not-allowed' 
                                            : 'bg-gray-800/50 border-gray-600 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 backdrop-blur-sm'
                                    } outline-none transition`}
                                    placeholder="Ej: Juan Pérez"
                                    disabled={esDuenno || esBarbero}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Tu WhatsApp
                                </label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-600 bg-gray-800/50 text-gray-400 text-sm backdrop-blur-sm">
                                        +53
                                    </span>
                                    <input
                                        type="tel"
                                        value={whatsapp}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            setWhatsapp(value);
                                            verificarNumero(value);
                                        }}
                                        className="w-full px-4 py-3 rounded-r-lg border border-gray-600 bg-gray-800/50 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition backdrop-blur-sm"
                                        placeholder="Ej: 51234567"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Ingresá tu número de WhatsApp (8 dígitos después del +53)</p>
                            </div>

                            {verificando && (
                                <div className="text-amber-400 text-sm bg-black/40 backdrop-blur-sm p-2 rounded-lg flex items-center gap-2 border border-amber-500/30">
                                    <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full"></div>
                                    Verificando...
                                </div>
                            )}

                            {esDuenno && !verificando && (
                                <div className="bg-gradient-to-r from-amber-900/80 to-amber-800/80 backdrop-blur-sm border-2 border-amber-500 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                            D
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-amber-300 font-bold text-xl">
                                                ¡Bienvenido Dueño!
                                            </p>
                                            <p className="text-amber-400 text-sm">
                                                Hacé clic en el botón de abajo para acceder al panel.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {esBarbero && barberoInfo && !verificando && (
                                <div className="bg-gradient-to-r from-amber-900/80 to-amber-800/80 backdrop-blur-sm border-2 border-amber-500 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                            B
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-amber-300 font-bold text-xl">
                                                ¡Hola {barberoInfo.nombre}!
                                            </p>
                                            <p className="text-amber-400 text-sm">
                                                Hacé clic en el botón de abajo para acceder a tu panel.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {clienteAutorizado && !verificando && !esDuenno && !esBarbero && (
                                <div className="bg-gradient-to-r from-green-900/80 to-green-800/80 backdrop-blur-sm border-2 border-green-500 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                            C
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-green-300 font-bold text-xl">
                                                ¡Hola {clienteAutorizado.nombre}!
                                            </p>
                                            <p className="text-green-400 text-sm">
                                                Ya tenés acceso para reservar turnos.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && !esDuenno && !esBarbero && (
                                <div className={`text-sm p-3 rounded-lg flex items-start gap-2 backdrop-blur-sm ${
                                    estadoRechazado 
                                        ? 'bg-yellow-900/80 text-yellow-300 border border-yellow-700' 
                                        : 'bg-red-900/80 text-red-300 border border-red-700'
                                }`}>
                                    <i className={`${estadoRechazado ? 'icon-alert-circle' : 'icon-triangle-alert'} mt-0.5`}></i>
                                    {error}
                                </div>
                            )}

                            <div className="space-y-3 pt-2">
                                {esDuenno && !verificando && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            localStorage.setItem('adminAuth', 'true');
                                            localStorage.setItem('adminUser', 'Dueño');
                                            localStorage.setItem('adminLoginTime', Date.now());
                                            window.location.href = 'admin.html';
                                        }}
                                        className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white py-4 rounded-xl font-bold hover:from-amber-700 hover:to-yellow-700 transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg text-lg"
                                    >
                                        <span className="text-xl">⚡</span>
                                        Ingresar como Dueño
                                    </button>
                                )}

                                {esBarbero && barberoInfo && !verificando && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            localStorage.setItem('barberoAuth', JSON.stringify({
                                                id: barberoInfo.id,
                                                nombre: barberoInfo.nombre,
                                                telefono: barberoInfo.telefono,
                                                nivel: barberoInfo.nivel || 1
                                            }));
                                            window.location.href = 'admin.html';
                                        }}
                                        className="w-full bg-gradient-to-r from-amber-700 to-amber-800 text-white py-4 rounded-xl font-bold hover:from-amber-800 hover:to-amber-900 transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg text-lg"
                                    >
                                        <span className="text-xl">✂️</span>
                                        Ingresar como Barbero
                                    </button>
                                )}

                                {clienteAutorizado && !verificando && !esDuenno && !esBarbero && (
                                    <button
                                        type="button"
                                        onClick={handleAccesoDirecto}
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg text-lg"
                                    >
                                        <span className="text-xl">📱</span>
                                        Ingresar como Cliente
                                    </button>
                                )}

                                {!clienteAutorizado && !esDuenno && !esBarbero && !verificando && (
                                    <button
                                        type="submit"
                                        disabled={verificando || (yaTieneSolicitud && !estadoRechazado)}
                                        className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-4 rounded-xl font-bold hover:from-amber-700 hover:to-amber-800 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg text-lg"
                                    >
                                        <span className="text-xl">📱</span>
                                        {verificando ? 'Verificando...' : 'Solicitar Acceso como Cliente'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}