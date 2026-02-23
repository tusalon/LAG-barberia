// components/WorkerSelector.js - Versión para LAG.barberia

function WorkerSelector({ onSelect, selectedWorker }) {
    const [barberos, setBarberos] = React.useState([]);
    const [cargando, setCargando] = React.useState(true);

    React.useEffect(() => {
        cargarBarberos();
        
        const handleActualizacion = () => cargarBarberos();
        window.addEventListener('barberosActualizados', handleActualizacion);
        
        return () => {
            window.removeEventListener('barberosActualizados', handleActualizacion);
        };
    }, []);

    const cargarBarberos = async () => {
        setCargando(true);
        try {
            if (window.salonBarberos) {
                const activos = await window.salonBarberos.getAll(true);
                setBarberos(activos || []);
            }
        } catch (error) {
            console.error('Error cargando barberos:', error);
        } finally {
            setCargando(false);
        }
    };

    if (cargando) {
        return (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <div className="icon-users text-amber-500"></div>
                    2. Elegí tu barbero
                </h2>
                <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-b-2 border-amber-600 rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-4">Cargando barberos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="icon-users text-amber-500"></div>
                2. Elegí tu barbero
            </h2>
            
            {barberos.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-500">No hay barberos disponibles</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {barberos.map(worker => (
                        <button
                            key={worker.id}
                            onClick={() => onSelect(worker)}
                            className={`
                                p-4 rounded-xl border-2 text-left transition-all duration-200 transform hover:scale-105
                                ${selectedWorker?.id === worker.id 
                                    ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300 shadow-lg' 
                                    : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-md'}
                            `}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 ${worker.color || 'bg-amber-600'} rounded-full flex items-center justify-center text-3xl mb-3 shadow-md`}>
                                    {worker.avatar || '👨‍🎨'}
                                </div>
                                <span className="font-bold text-gray-800 text-lg block">
                                    {worker.nombre}
                                </span>
                                <span className="text-sm text-gray-500 mt-1">
                                    {worker.especialidad}
                                </span>
                                
                                {selectedWorker?.id === worker.id && (
                                    <div className="mt-2 text-amber-600 text-sm font-semibold flex items-center gap-1">
                                        <div className="icon-check-circle"></div>
                                        Seleccionado
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
            
            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="flex items-center gap-2">
                    <div className="icon-info text-blue-500"></div>
                    <span>Cada barbero tiene su propia agenda. Después de elegir, podrás ver sus horarios disponibles.</span>
                </p>
            </div>
        </div>
    );
}