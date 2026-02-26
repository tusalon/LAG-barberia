// components/ClientAuthScreen.js - VERSIÓN COMPLETA CORREGIDA

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
        
        // 🔥 Dueño y barbero ya no deberían llegar aquí porque tienen botones propios
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
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-gray-900 flex flex-col items-center justify-center p-6 text-center animate-fade-in relative">
                {onGoBack && (
                    <button
                        onClick={onGoBack}
                        className="absolute top-4 left-4 z-20 w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-700/70 transition-colors border border-white/20"
                        title="Volver"
                    >
                        <i className="icon-arrow-left text-white text-xl"></i>
                    </button>
                )}
                
                <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <div className="icon-check text-5xl text-white"></div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-3">¡Solicitud Enviada!</h2>
                
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg max-w-md mb-6 border border-amber-600">
                    <p className="text-gray-300 mb-4">
                        Gracias por querer ser parte de <span className="font-bold text-amber-400">LAG.barberia</span>
                    </p>
                    
                    <div className="bg-gray-700 p-4 rounded-xl text-left space-y-2 mb-4">
                        <p className="text-sm text-gray-300">
                            <span className="font-semibold text-amber-400">📱 Tu número:</span> +{whatsapp}
                        </p>
                        <p className="text-sm text-gray-300">
                            <span className="font-semibold text-amber-400">👤 Nombre:</span> {nombre}
                        </p>
                    </div>
                    
                    <p className="text-gray-400 text-sm">
                        El dueño revisará tu solicitud y te contactará por WhatsApp.
                    </p>
                </div>
                
                <div className="text-sm text-gray-500">
                    <p>Mientras tanto, puede contactarnos:</p>
                    <a 
                        href="https://api.whatsapp.com/send?phone=53357234&text=Hola%20LAG.barberia%2C%20consulté%20mi%20solicitud%20de%20acceso" 
                        target="_blank" 
                        className="text-amber-500 font-medium inline-flex items-center gap-1 mt-2"
                    >
                        <div className="icon-message-circle"></div>
                        +53 53357234
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-gray-900 flex flex-col items-center justify-center p-6 animate-fade-in relative">
            {onGoBack && (
                <button
                    onClick={onGoBack}
                    className="absolute top-4 left-4 z-20 w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-700/70 transition-colors border border-white/20"
                    title="Volver"
                >
                    <i className="icon-arrow-left text-white text-xl"></i>
                </button>
            )}
            
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl shadow-xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                            <i className="icon-scissors text-4xl text-white"></i>
                        </div>
                    </div>
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600/30 backdrop-blur-sm border border-amber-500/50 text-amber-300 text-sm font-medium mb-2">
                        <i className="icon-star text-xs"></i>
                        <span>Nivel que se nota</span>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-white">LAG.barberia</h1>
                    <p className="text-gray-400 mt-2">Acceso para clientes y barberos</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-amber-700">
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
                                        ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed' 
                                        : 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
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
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-600 bg-gray-700 text-gray-400 text-sm">
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
                                    className="w-full px-4 py-3 rounded-r-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                                    placeholder="53357234"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Ingresá solo los números después del +53</p>
                        </div>

                        {verificando && (
                            <div className="text-amber-400 text-sm bg-gray-700 p-2 rounded-lg flex items-center gap-2">
                                <div className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full"></div>
                                Verificando...
                            </div>
                        )}

                        {esDuenno && !verificando && (
                            <div className="bg-gradient-to-r from-amber-900 to-amber-800 border-2 border-amber-500 rounded-lg p-4">
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
                            <div className="bg-gradient-to-r from-amber-900 to-amber-800 border-2 border-amber-500 rounded-lg p-4">
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
                            <div className="bg-gradient-to-r from-green-900 to-green-800 border-2 border-green-500 rounded-lg p-4">
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
                            <div className={`text-sm p-3 rounded-lg flex items-start gap-2 ${
                                estadoRechazado 
                                    ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' 
                                    : 'bg-red-900 text-red-300 border border-red-700'
                            }`}>
                                <i className={`${estadoRechazado ? 'icon-alert-circle' : 'icon-triangle-alert'} mt-0.5`}></i>
                                {error}
                            </div>
                        )}

                        <div className="space-y-3 pt-2">
                            {/* 🔥 BOTÓN PARA DUEÑO - type="button" */}
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

                            {/* 🔥 BOTÓN PARA BARBERO - type="button" */}
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

                            {/* BOTÓN PARA CLIENTE AUTORIZADO */}
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

                            {/* BOTÓN PARA SOLICITAR ACCESO (solo clientes no registrados) */}
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
    );
}