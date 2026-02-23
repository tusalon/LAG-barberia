// components/ClientAuthScreen.js - VERSIÓN COMPLETA PARA LAG.barberia (CON LOGO COMO ICONO Y SIN EMOJIS)

function ClientAuthScreen({ onAccessGranted }) {
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

    // FUNCIÓN PARA VERIFICAR SI YA EXISTE SOLICITUD
    const clienteYaTieneSolicitud = async (whatsapp) => {
        try {
            console.log('🔍 Verificando si ya existe solicitud para:', whatsapp);
            const response = await fetch(
                `${window.SUPABASE_URL}/rest/v1/cliente_solicitudes?whatsapp=eq.${whatsapp}&select=estado`,
                {
                    headers: {
                        'apikey': window.SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.ok) return false;
            
            const data = await response.json();
            console.log('📋 Resultado búsqueda:', data);
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
            console.log('🔍 Verificando número:', numeroCompleto);
            
            // PASO 1: Verificar si es el DUEÑO
            if (numeroLimpio === '53357234') {
                console.log('👑 ES EL DUEÑO DE LAG.barberia');
                setEsDuenno(true);
                setEsBarbero(false);
                setBarberoInfo(null);
                setClienteAutorizado(null);
                setError('👑 Acceso como dueño detectado');
                setVerificando(false);
                return;
            }
            
            // PASO 2: Verificar si es barbero
            if (window.verificarBarberoPorTelefono) {
                console.log('👨‍🎨 Verificando si es barbero...');
                const barbero = await window.verificarBarberoPorTelefono(numeroLimpio);
                console.log('📋 Resultado barbero:', barbero);
                
                if (barbero) {
                    console.log('✅ ES BARBERO:', barbero.nombre);
                    setEsBarbero(true);
                    setBarberoInfo(barbero);
                    setEsDuenno(false);
                    setClienteAutorizado(null);
                    setError('👨‍🎨 Acceso como barbero detectado');
                    setVerificando(false);
                    return;
                }
            }
            
            // PASO 3: Verificar si ya existe solicitud (cualquier estado)
            const yaExiste = await clienteYaTieneSolicitud(numeroCompleto);
            if (yaExiste) {
                console.log('❌ Cliente ya tiene una solicitud registrada');
                const pendiente = await window.isClientePendiente?.(numeroCompleto);
                if (pendiente) {
                    setError('Ya tenés una solicitud pendiente. El dueño te contactará pronto.');
                } else {
                    setError('Este número ya fue registrado anteriormente. Si no tenés acceso, contactá al dueño al +53 53357234.');
                }
                setVerificando(false);
                return;
            }
            
            // PASO 4: Verificar como cliente autorizado
            console.log('👤 No es dueño ni barbero, verificando como cliente...');
            setEsDuenno(false);
            setEsBarbero(false);
            setBarberoInfo(null);
            
            const existe = await window.verificarAccesoCliente(numeroCompleto);
            console.log('📋 Resultado autorizado cliente:', existe);
            
            if (existe) {
                setClienteAutorizado(existe);
                setYaTieneSolicitud(false);
                setEstadoRechazado(false);
                setError('');
            } else {
                setClienteAutorizado(null);
                
                if (window.obtenerEstadoSolicitud) {
                    const estado = await window.obtenerEstadoSolicitud(numeroCompleto);
                    console.log('📋 Estado de solicitud cliente:', estado);
                    
                    if (estado && estado.existe) {
                        if (estado.estado === 'pendiente') {
                            setYaTieneSolicitud(true);
                            setEstadoRechazado(false);
                            setError('Ya tenés una solicitud pendiente. El dueño te contactará pronto.');
                        } 
                        else if (estado.estado === 'rechazado') {
                            setYaTieneSolicitud(false);
                            setEstadoRechazado(true);
                            setError('Tu solicitud anterior fue rechazada. Podés volver a intentarlo.');
                        }
                        else {
                            setYaTieneSolicitud(true);
                            setEstadoRechazado(false);
                            setError('Este número ya fue registrado. Contactá al dueño.');
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
            setError('El dueño y los barberos deben usar el botón de acceso especial.');
            return;
        }
        
        setVerificando(true);
        
        const numeroLimpio = whatsapp.replace(/\D/g, '');
        const numeroCompleto = `53${numeroLimpio}`;
        
        try {
            const autorizado = await window.verificarAccesoCliente(numeroCompleto);
            
            if (autorizado) {
                console.log('✅ Acceso directo para cliente:', autorizado);
                onAccessGranted(autorizado.nombre, numeroCompleto);
                return;
            }
            
            const yaExiste = await clienteYaTieneSolicitud(numeroCompleto);
            if (yaExiste) {
                const pendiente = await window.isClientePendiente?.(numeroCompleto);
                if (pendiente) {
                    setError('Ya tenés una solicitud pendiente. El dueño te contactará pronto.');
                } else {
                    setError('Este número ya fue registrado anteriormente. Si no tenés acceso, contactá al dueño.');
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

    const handleAccesoDuenno = () => {
        console.log('👑 Accediendo como dueño de LAG.barberia');
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminUser', 'Dueño');
        localStorage.setItem('adminLoginTime', Date.now());
        window.location.href = 'admin.html';
    };

    const handleAccesoBarbero = () => {
        if (barberoInfo) {
            console.log('👨‍🎨 Accediendo como barbero:', barberoInfo);
            localStorage.setItem('barberoAuth', JSON.stringify({
                id: barberoInfo.id,
                nombre: barberoInfo.nombre,
                telefono: barberoInfo.telefono,
                nivel: barberoInfo.nivel || 1
            }));
            window.location.href = 'admin.html';
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
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-gray-900 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
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
                        El dueño revisará tu solicitud y te contactará por WhatsApp para confirmar tu acceso.
                    </p>
                </div>
                
                <div className="text-sm text-gray-500">
                    <p>Mientras tanto, podés contactarnos:</p>
                    <a href="https://wa.me/5353357234" target="_blank" className="text-amber-500 font-medium inline-flex items-center gap-1 mt-2">
                        <div className="icon-message-circle"></div>
                        +53 53357234
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-gray-900 flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    {/* 🔥 LOGO COMO ICONO (CUADRADO CON GRADIENTE) */}
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl shadow-xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                            <i className="icon-scissors text-4xl text-white"></i>
                        </div>
                    </div>
                    
                    {/* Eslogan */}
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
                                Tu nombre completo (solo para clientes)
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
                                required={!esDuenno && !esBarbero}
                            />
                            {(esDuenno || esBarbero) && (
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <i className="icon-info text-xs"></i>
                                    El personal no necesita nombre
                                </p>
                            )}
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

                        {/* BANNER PARA DUEÑO - SIN EMOJIS */}
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
                                            Tenés acceso completo al sistema de administración.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BANNER PARA BARBERO - SIN EMOJIS */}
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
                                            Bienvenido a tu panel de trabajo.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BANNER PARA CLIENTE AUTORIZADO - SIN EMOJIS */}
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

                        {/* ERRORES SOLO PARA CLIENTES */}
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

                        {/* BOTONES DE ACCIÓN - SIN EMOJIS */}
                        <div className="space-y-3 pt-2">
                            {/* BOTÓN PARA DUEÑO */}
                            {esDuenno && !verificando && (
                                <button
                                    type="button"
                                    onClick={handleAccesoDuenno}
                                    className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white py-4 rounded-xl font-bold hover:from-amber-700 hover:to-yellow-700 transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg text-lg"
                                >
                                    <span className="text-xl">⚡</span>
                                    Ingresar como Dueño
                                </button>
                            )}

                            {/* BOTÓN PARA BARBERO */}
                            {esBarbero && barberoInfo && !verificando && (
                                <button
                                    type="button"
                                    onClick={handleAccesoBarbero}
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

                            {/* BOTÓN PARA SOLICITAR ACCESO */}
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