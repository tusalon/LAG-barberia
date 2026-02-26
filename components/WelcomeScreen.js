// components/WelcomeScreen.js - Con imagen de fondo y botón atrás

function WelcomeScreen({ onStart, onGoBack, cliente, userRol }) {
    const [imagenCargada, setImagenCargada] = React.useState(false);

    React.useEffect(() => {
        const img = new Image();
        img.src = '/LAG-barberia/images/LAG.barberia.jpg';
        img.onload = () => setImagenCargada(true);
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col relative overflow-hidden animate-fade-in">
            {onGoBack && (
                <button
                    onClick={onGoBack}
                    className="absolute top-4 left-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors border border-white/20"
                    title="Volver"
                >
                    <i className="icon-arrow-left text-white text-xl"></i>
                </button>
            )}

            <div className="absolute inset-0 z-0">
                {!imagenCargada && (
                    <div className="w-full h-full bg-gradient-to-br from-amber-900 to-gray-900 animate-pulse"></div>
                )}
                <img 
                    src="/LAG-barberia/images/LAG.barberia.jpg"
                    alt="Barbería LAG.barberia" 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${imagenCargada ? 'opacity-100' : 'opacity-0'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>

            <div className="relative z-10 flex flex-col justify-end h-full min-h-screen p-8 pb-20 sm:justify-center sm:items-center sm:text-center sm:p-12 sm:pb-12">
                <div className="animate-fade-in space-y-4 max-w-2xl">
                    
                    <div className="mb-4">
                        <h2 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 drop-shadow-2xl tracking-tight leading-tight">
                            Nivel que
                            <br />
                            <span className="text-6xl sm:text-8xl">se nota</span>
                        </h2>
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                        Bienvenido a <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600 text-5xl sm:text-6xl">
                           LAG.barberia
                        </span>
                    </h1>
                    
                    {cliente && (
                        <p className="text-amber-400 text-lg">
                            👤 {cliente.nombre}
                        </p>
                    )}
                    
                    <p className="text-gray-200 text-lg sm:text-xl max-w-lg mx-auto leading-relaxed drop-shadow">
                        NIVEL QUE SE NOTA.
                    </p>

                    <div className="pt-6">
                        <button 
                            onClick={onStart}
                            className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-lg font-bold py-4 px-10 rounded-full shadow-2xl shadow-amber-600/50 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center gap-2 border border-amber-400/30"
                        >
                            Reservar Turno
                            <i className="icon-arrow-right text-xl"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/30 backdrop-blur-sm border-t border-white/10 p-4 hidden sm:block">
                <div className="max-w-4xl mx-auto flex justify-around text-white/90 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <i className="icon-scissors text-amber-400"></i>
                        Cortes Profesionales
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="icon-star text-amber-400"></i>
                        Productos Premium
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="icon-coffee text-amber-400"></i>
                        Ambiente Exclusivo
                    </div>
                </div>
            </div>
        </div>
    );
}