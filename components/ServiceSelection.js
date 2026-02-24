// components/ServiceSelection.js - CON PRECIO ÚNICO

function ServiceSelection({ onSelect, selectedService }) {
    const [services, setServices] = React.useState([]);
    const [cargando, setCargando] = React.useState(true);

    React.useEffect(() => {
        cargarServicios();
        
        const handleActualizacion = () => cargarServicios();
        window.addEventListener('serviciosActualizados', handleActualizacion);
        
        return () => {
            window.removeEventListener('serviciosActualizados', handleActualizacion);
        };
    }, []);

    const cargarServicios = async () => {
        setCargando(true);
        try {
            console.log('📋 Cargando servicios desde window.salonServicios...');
            if (window.salonServicios) {
                const serviciosActivos = await window.salonServicios.getAll(true);
                console.log('✅ Servicios obtenidos:', serviciosActivos);
                setServices(serviciosActivos || []);
            } else {
                console.error('❌ window.salonServicios no está disponible');
                setServices([]);
            }
        } catch (error) {
            console.error('Error cargando servicios:', error);
            setServices([]);
        } finally {
            setCargando(false);
        }
    };

    if (cargando) {
        return (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <i className="icon-scissors text-amber-500"></i>
                    1. Elegí tu servicio
                </h2>
                <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-b-2 border-amber-600 rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-4">Cargando servicios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <i className="icon-scissors text-amber-500"></i>
                1. Elegí tu servicio
                {selectedService && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2">
                        ✓ Servicio seleccionado
                    </span>
                )}
            </h2>
            
            {services.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-500">No hay servicios disponibles</p>
                    <p className="text-xs text-gray-400 mt-2">El administrador debe cargar servicios primero</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {services.map(service => (
                        <button
                            key={service.id}
                            onClick={() => onSelect(service)}
                            className={`
                                p-4 rounded-xl border text-left transition-all duration-200 
                                ${selectedService?.id === service.id 
                                    ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500 shadow-md scale-[1.02]' 
                                    : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-sm hover:scale-[1.01]'}
                                transform transition-all
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <span className="font-medium text-gray-900 text-lg block">
                                        {service.nombre}
                                    </span>
                                    {service.descripcion && (
                                        <p className="text-sm text-gray-500 mt-1">{service.descripcion}</p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-1 ml-4">
                                    <span className="text-amber-600 font-bold text-lg">
                                        ${service.precio}
                                    </span>
                                    <span className="flex items-center text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                        <i className="icon-clock text-xs mr-1"></i>
                                        {service.duracion} min
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}