// components/admin/BarberosPanel.js - Para LAG.barberia

function BarberosPanel() {
    const [barberos, setBarberos] = React.useState([]);
    const [mostrarForm, setMostrarForm] = React.useState(false);
    const [editando, setEditando] = React.useState(null);
    const [cargando, setCargando] = React.useState(true);

    React.useEffect(() => {
        cargarBarberos();
    }, []);

    const cargarBarberos = async () => {
        setCargando(true);
        try {
            console.log('📋 Cargando barberos...');
            if (window.salonBarberos) {
                const lista = await window.salonBarberos.getAll(false);
                console.log('✅ Barberos obtenidos:', lista);
                setBarberos(lista || []);
            }
        } catch (error) {
            console.error('Error cargando barberos:', error);
        } finally {
            setCargando(false);
        }
    };

    const handleGuardar = async (barbero) => {
        try {
            console.log('💾 Guardando barbero:', barbero);
            if (editando) {
                await window.salonBarberos.actualizar(editando.id, barbero);
            } else {
                await window.salonBarberos.crear(barbero);
            }
            await cargarBarberos();
            setMostrarForm(false);
            setEditando(null);
        } catch (error) {
            console.error('Error guardando barbero:', error);
            alert('Error al guardar el barbero');
        }
    };

    const handleEliminar = async (id) => {
        if (!confirm('¿Eliminar este barbero?')) return;
        try {
            console.log('🗑️ Eliminando barbero:', id);
            await window.salonBarberos.eliminar(id);
            await cargarBarberos();
        } catch (error) {
            console.error('Error eliminando barbero:', error);
            alert('Error al eliminar el barbero');
        }
    };

    const toggleActivo = async (id) => {
        const barbero = barberos.find(b => b.id === id);
        try {
            await window.salonBarberos.actualizar(id, { activo: !barbero.activo });
            await cargarBarberos();
        } catch (error) {
            console.error('Error cambiando estado:', error);
        }
    };

    const getNivelNombre = (nivel) => {
        switch(nivel) {
            case 1: return '🔰 Básico';
            case 2: return '⭐ Intermedio';
            case 3: return '👑 Avanzado';
            default: return '🔰 Básico';
        }
    };

    if (cargando) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Cargando barberos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">👥 Barberos</h2>
                <button
                    onClick={() => {
                        setEditando(null);
                        setMostrarForm(true);
                    }}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
                >
                    + Nuevo Barbero
                </button>
            </div>

            {mostrarForm && (
                <BarberoForm
                    barbero={editando}
                    onGuardar={handleGuardar}
                    onCancelar={() => {
                        setMostrarForm(false);
                        setEditando(null);
                    }}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {barberos.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                        No hay barberos cargados
                    </div>
                ) : (
                    barberos.map(b => (
                        <div key={b.id} className={`border rounded-lg p-4 ${b.activo ? '' : 'opacity-50 bg-gray-50'}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 ${b.color || 'bg-amber-600'} rounded-full flex items-center justify-center text-2xl`}>
                                        {b.avatar || '👨‍🎨'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{b.nombre}</h3>
                                            <button
                                                onClick={() => toggleActivo(b.id)}
                                                className={`text-xs px-2 py-1 rounded-full ${
                                                    b.activo 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-gray-200 text-gray-600'
                                                }`}
                                            >
                                                {b.activo ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-600">{b.especialidad}</p>
                                        
                                        <p className="text-xs mt-1">
                                            <span className={`px-2 py-0.5 rounded-full ${
                                                b.nivel === 1 ? 'bg-gray-100 text-gray-600' :
                                                b.nivel === 2 ? 'bg-blue-100 text-blue-600' :
                                                'bg-purple-100 text-purple-600'
                                            }`}>
                                                {getNivelNombre(b.nivel)}
                                            </span>
                                        </p>
                                        
                                        {b.telefono && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                📱 {b.telefono}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditando(b);
                                            setMostrarForm(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleEliminar(b.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function BarberoForm({ barbero, onGuardar, onCancelar }) {
    const [form, setForm] = React.useState(barbero || {
        nombre: '',
        especialidad: '',
        telefono: '',
        password: '',
        nivel: 1,
        color: 'bg-amber-600',
        avatar: '👨‍🎨'
    });

    const avatares = ['👨‍🎨', '💈', '✂️', '👑', '⭐', '🔰'];
    const colores = [
        { value: 'bg-amber-600', label: 'Ámbar' },
        { value: 'bg-amber-700', label: 'Ámbar Oscuro' },
        { value: 'bg-amber-800', label: 'Marrón' },
        { value: 'bg-gray-600', label: 'Gris' },
        { value: 'bg-blue-600', label: 'Azul' },
        { value: 'bg-green-600', label: 'Verde' }
    ];
    
    const niveles = [
        { value: 1, label: '🔰 Básico - Solo ver reservas', desc: 'Acceso limitado a reservas' },
        { value: 2, label: '⭐ Intermedio - Reservas + Configuración propia + Clientes', desc: 'Puede ver configuración (solo sus horarios) y clientes' },
        { value: 3, label: '👑 Avanzado - Acceso total', desc: 'Puede gestionar todo como el dueño' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        onGuardar(form);
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-4">
                {barbero ? '✏️ Editar Barbero' : '➕ Nuevo Barbero'}
            </h3>
            
            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={(e) => setForm({...form, nombre: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                />
                
                <input
                    type="text"
                    placeholder="Especialidad"
                    value={form.especialidad}
                    onChange={(e) => setForm({...form, especialidad: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                />
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nivel de Acceso
                    </label>
                    <select
                        value={form.nivel}
                        onChange={(e) => setForm({...form, nivel: parseInt(e.target.value)})}
                        className="w-full border rounded-lg px-3 py-2"
                    >
                        {niveles.map(n => (
                            <option key={n.value} value={n.value}>{n.label}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        {niveles.find(n => n.value === form.nivel)?.desc}
                    </p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            +53
                        </span>
                        <input
                            type="tel"
                            value={form.telefono}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                setForm({...form, telefono: value});
                            }}
                            className="w-full px-4 py-2 rounded-r-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                            placeholder="53357234"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">8 dígitos después del +53</p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({...form, password: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="********"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm mb-1">Avatar</label>
                        <select
                            value={form.avatar}
                            onChange={(e) => setForm({...form, avatar: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            {avatares.map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm mb-1">Color</label>
                        <select
                            value={form.color}
                            onChange={(e) => setForm({...form, color: e.target.value})}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            {colores.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={onCancelar} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">Guardar</button>
            </div>
        </form>
    );
}