// app.js - Versión con Mis Reservas

function App() {
    const [showWelcome, setShowWelcome] = React.useState(true);
    const [clienteAutorizado, setClienteAutorizado] = React.useState(null);
    const [userRol, setUserRol] = React.useState('cliente');
    const [mostrarMisReservas, setMostrarMisReservas] = React.useState(false); // 🔥 NUEVO
    
    const [bookingData, setBookingData] = React.useState({
        service: null,
        worker: null,
        date: null,
        time: null,
        confirmedBooking: null
    });
    const [showForm, setShowForm] = React.useState(false);

    React.useEffect(() => {
        const savedCliente = localStorage.getItem('cliente_autorizado');
        if (savedCliente) {
            try {
                const cliente = JSON.parse(savedCliente);
                if (window.verificarAccesoCliente && window.verificarAccesoCliente(cliente.whatsapp)) {
                    setClienteAutorizado(cliente);
                    obtenerRol(cliente.whatsapp);
                } else {
                    localStorage.removeItem('cliente_autorizado');
                }
            } catch (e) {
                localStorage.removeItem('cliente_autorizado');
            }
        }
    }, []);

    const obtenerRol = async (whatsapp) => {
        try {
            const rolInfo = await window.obtenerRolUsuario(whatsapp);
            console.log('🎯 Rol obtenido:', rolInfo);
            setUserRol(rolInfo.rol);
        } catch (error) {
            console.error('Error obteniendo rol:', error);
        }
    };

    const scrollToSection = (sectionId) => {
        setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
                const yOffset = -80;
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 100);
    };

    const handleAccessGranted = async (nombre, whatsapp) => {
        const cliente = { nombre, whatsapp };
        setClienteAutorizado(cliente);
        localStorage.setItem('cliente_autorizado', JSON.stringify(cliente));
        
        if (window.obtenerRolUsuario) {
            const rolInfo = await window.obtenerRolUsuario(whatsapp);
            setUserRol(rolInfo.rol);
        }
        
        setShowWelcome(false);
    };

    const handleServiceSelect = (service) => {
        setBookingData(prev => ({ 
            ...prev, 
            service, 
            worker: null,
            date: null,
            time: null
        }));
        scrollToSection('worker-section');
    };

    const handleWorkerSelect = (worker) => {
        setBookingData(prev => ({ 
            ...prev, 
            worker, 
            date: null,
            time: null
        }));
        scrollToSection('calendar-section');
    };

    const handleDateSelect = (date) => {
        setBookingData(prev => ({ 
            ...prev, 
            date, 
            time: null
        }));
        scrollToSection('timeslots-section');
    };

    const handleTimeSelect = (time) => {
        setBookingData(prev => ({ ...prev, time }));
        setShowForm(true);
    };

    const handleFormSubmit = (finalBooking) => {
        setShowForm(false);
        setBookingData(prev => ({ ...prev, confirmedBooking: finalBooking }));
    };

    const resetBooking = () => {
        setBookingData({
            service: null,
            worker: null,
            date: null,
            time: null,
            confirmedBooking: null
        });
        setShowForm(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = () => {
        localStorage.removeItem('cliente_autorizado');
        setClienteAutorizado(null);
        setUserRol('cliente');
        setShowWelcome(true);
    };

    if (!clienteAutorizado) {
        return <ClientAuthScreen onAccessGranted={handleAccessGranted} />;
    }

    // 🔥 MOSTRAR PANTALLA DE MIS RESERVAS
    if (mostrarMisReservas) {
        return (
            <MyBookings
                cliente={clienteAutorizado}
                onVolver={() => setMostrarMisReservas(false)}
            />
        );
    }

    if (showWelcome) {
        return (
            <div data-name="app-container">
                <WelcomeScreen onStart={() => setShowWelcome(false)} />
                <WhatsAppButton />
            </div>
        );
    }

    if (bookingData.confirmedBooking) {
        return (
            <div className="min-h-screen bg-[#faf8f7] flex flex-col" data-name="app-container">
                <Header 
                    cliente={clienteAutorizado} 
                    onLogout={handleLogout}
                    userRol={userRol}
                />
                <main className="flex-grow p-4">
                    <div className="max-w-xl mx-auto">
                        <Confirmation booking={bookingData.confirmedBooking} onReset={resetBooking} />
                    </div>
                </main>
                <WhatsAppButton />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf8f7] flex flex-col pb-20" data-name="app-container">
            <Header 
                cliente={clienteAutorizado} 
                onLogout={handleLogout}
                userRol={userRol}
            />
            
            <main className="flex-grow p-4 space-y-8 max-w-4xl mx-auto w-full">
                {/* 🔥 HEADER MEJORADO CON MIS RESERVAS */}
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {clienteAutorizado.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <span className="text-sm text-amber-600 block">Bienvenido,</span>
                            <span className="font-bold text-amber-800 text-lg">{clienteAutorizado.nombre}</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        {/* 🔥 BOTÓN MIS RESERVAS */}
                        <button
                            onClick={() => setMostrarMisReservas(true)}
                            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition transform hover:scale-105 shadow-sm"
                        >
                            <i className="icon-calendar"></i>
                            Mis Reservas
                        </button>
                        
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition border border-gray-200"
                            title="Cerrar sesión"
                        >
                            <i className="icon-log-out"></i>
                            <span className="hidden sm:inline">Salir</span>
                        </button>
                    </div>
                </div>

                <div id="service-section">
                    <ServiceSelection 
                        selectedService={bookingData.service} 
                        onSelect={handleServiceSelect} 
                    />
                </div>

                {bookingData.service && (
                    <div id="worker-selector">
                        <WorkerSelector 
                            selectedWorker={bookingData.worker} 
                            onSelect={handleWorkerSelect} 
                        />
                    </div>
                )}

                {bookingData.service && bookingData.worker && (
                    <div id="calendar-section">
                        <Calendar 
                            selectedDate={bookingData.date} 
                            onDateSelect={handleDateSelect}
                            worker={bookingData.worker}
                        />
                    </div>
                )}

                {bookingData.service && bookingData.worker && bookingData.date && (
                    <div id="timeslots-section">
                        <TimeSlots 
                            service={bookingData.service} 
                            date={bookingData.date}
                            worker={bookingData.worker}
                            selectedTime={bookingData.time}
                            onTimeSelect={handleTimeSelect}
                        />
                    </div>
                )}
            </main>

            {showForm && (
                <BookingForm 
                    service={bookingData.service}
                    worker={bookingData.worker}
                    date={bookingData.date}
                    time={bookingData.time}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowForm(false)}
                    cliente={clienteAutorizado}
                />
            )}
            
            {(bookingData.service || bookingData.date) && (
                <div className="fixed bottom-24 right-6 z-40">
                    <button 
                        onClick={resetBooking}
                        className="bg-white text-gray-600 shadow-lg border border-gray-200 rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                        <i className="icon-rotate-ccw text-xs"></i>
                        Reiniciar
                    </button>
                </div>
            )}

            <WhatsAppButton />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);