// components/WelcomeScreen.js - Para LAG.barberia con imagen local

function WelcomeScreen({ onStart }) {
    const [imagenCargada, setImagenCargada] = React.useState(false);

    React.useEffect(() => {
        const img = new Image();
        img.src = '../images/LAG.barberia.jpg';
        img.onload = () => setImagenCargada(true);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col relative overflow-hidden animate-fade-in">
            {/* Background Image con overlay de carga */}
            <div className="absolute inset-0 z-0">
                {!imagenCargada && (
                    <div className="w-full h-full bg-gradient-to-b from-amber-900 to-gray-900 animate-pulse"></div>
                )}
                <img 
                    src="../images/LAG.barberia.jpg"
                    alt="Barbería LAG.barberia" 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${imagenCargada ? 'opacity-100' : 'opacity-0'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end h-full min-h-screen p-8 pb-20 sm:justify-center sm:items-center sm:text-center sm:p-12 sm:pb-12">
                <div className="animate-fade-in space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600/20 backdrop-blur-md border border-amber-500/30 text-amber-200 text-sm font-medium mb-2">
                        <div className="icon-scissors text-xs"></div>
                        <span>Estilo y tradición</span>
                    </div>
                    
                    <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight">
                        Bienvenido a <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">
                           LAG.barberia
                        </span>
                    </h1>
                    
                    <p className="text-gray-300 text-lg sm:text-xl max-w-lg mx-auto leading-relaxed">
                        Descubrí el arte del grooming profesional. Cortes de cabello, arreglo de barba y tratamientos capilares diseñados especialmente para vos.
                    </p>

                    <div className="pt-6">
                        <button 
                            onClick={onStart}
                            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white text-lg font-bold py-4 px-10 rounded-full shadow-lg shadow-amber-600/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Reservar Turno
                            <div className="icon-arrow-right"></div>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/30 backdrop-blur-sm border-t border-white/10 p-4 hidden sm:block">
                <div className="max-w-4xl mx-auto flex justify-around text-white/90 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <div className="icon-scissors text-amber-400"></div>
                        Cortes Profesionales
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="icon-star text-amber-400"></div>
                        Productos Premium
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="icon-coffee text-amber-400"></div>
                        Ambiente Exclusivo
                    </div>
                </div>
            </div>
        </div>
    );
}