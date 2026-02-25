// components/Header.js - Para LAG.barberia (solo muestra botón a dueño/barberos)

function Header({ cliente, onLogout, userRol }) {
    const [mostrarOpcionesAdmin, setMostrarOpcionesAdmin] = React.useState(false);
    
    const goToAdmin = () => {
        const isAdmin = localStorage.getItem('adminAuth') === 'true';
        const barberoAuth = localStorage.getItem('barberoAuth');
        
        if (isAdmin || barberoAuth) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'admin-login.html';
        }
    };

    // 🔥 Verificar si tiene acceso al panel (dueño o barbero)
    const tieneAcceso = userRol === 'admin' || userRol === 'barbero';

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white">
                        <i className="icon-scissors text-lg"></i>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">LAG.barberia</h1>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Nombre del cliente */}
                    {cliente && (
                        <div className="hidden sm:flex items-center gap-1 text-sm text-gray-600">
                            <i className="icon-user-check text-green-500"></i>
                            <span className="font-medium">{cliente.nombre}</span>
                        </div>
                    )}
                    
                    {/* 🔥 BOTÓN DE ADMIN - SOLO SI TIENE ACCESO (dueño o barbero) */}
                    {tieneAcceso && (
                        <div className="relative">
                            <button
                                onClick={goToAdmin}
                                className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-3 py-2 rounded-full transition-all transform hover:scale-105 shadow-md border border-amber-400"
                                title={userRol === 'admin' ? 'Panel de Administración' : 'Mi Panel de Trabajo'}
                                onMouseEnter={() => setMostrarOpcionesAdmin(true)}
                                onMouseLeave={() => setMostrarOpcionesAdmin(false)}
                            >
                                <i className={userRol === 'admin' ? 'icon-shield-check' : 'icon-briefcase'}></i>
                                <span className="text-sm font-medium hidden sm:inline">
                                    {userRol === 'admin' ? 'Admin' : 'Mi Panel'}
                                </span>
                                
                                {/* Indicador de sesión activa */}
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            </button>
                            
                            {/* Tooltip informativo */}
                            {mostrarOpcionesAdmin && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-amber-700 p-2 text-xs text-gray-300 z-50">
                                    {userRol === 'admin' ? (
                                        <div className="space-y-1">
                                            <p className="font-semibold text-amber-400">👑 Acceso como dueño</p>
                                            <p className="text-gray-400">Puede gestionar todo el sistema</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <p className="font-semibold text-amber-400">✂️ Acceso como barbero</p>
                                            <p className="text-gray-400">Bienvenido, {cliente?.nombre}</p>
                                            <p className="text-gray-500 text-xs">Puede ver tus reservas</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Botón de logout para cliente (siempre visible) */}
                    {cliente && onLogout && (
                        <button
                            onClick={onLogout}
                            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors group relative"
                            title="Cerrar sesión"
                        >
                            <i className="icon-log-out text-gray-500 group-hover:text-red-600"></i>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}