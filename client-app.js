// client-app.js - Aplicación de clientes con flujo completo y scroll automático

function ClientApp() {
    const [step, setStep] = React.useState('auth');
    const [cliente, setCliente] = React.useState(null);
    const [selectedService, setSelectedService] = React.useState(null);
    const [selectedWorker, setSelectedWorker] = React.useState(null);
    const [selectedDate, setSelectedDate] = React.useState('');
    const [selectedTime, setSelectedTime] = React.useState('');
    const [bookingConfirmed, setBookingConfirmed] = React.useState(null);
    const [userRol, setUserRol] = React.useState('cliente');
    const [history, setHistory] = React.useState(['auth']);

    // ============================================
    // DETECTAR SESIÓN AL INICIAR
    // ============================================
    React.useEffect(() => {
        const adminAuth = localStorage.getItem('adminAuth') === 'true';
        const barberoAuth = localStorage.getItem('barberoAuth');
        
        if (adminAuth) {
            setUserRol('admin');
        } else if (barberoAuth) {
            setUserRol('barbero');
            try {
                const barbero = JSON.parse(barberoAuth);
                setCliente({
                    nombre: barbero.nombre,
                    whatsapp: barbero.telefono
                });
            } catch (e) {}
        }
        
        const savedCliente = localStorage.getItem('clienteAuth');
        if (savedCliente && !adminAuth && !barberoAuth) {
            try {
                const clienteData = JSON.parse(savedCliente);
                setCliente(clienteData);
                setUserRol('cliente');
                setStep('welcome');
                setHistory(['auth', 'welcome']);
            } catch (e) {}
        }
    }, []);

    // ============================================
    // MANEJO DEL BOTÓN FÍSICO "ATRÁS"
    // ============================================
    React.useEffect(() => {
        const handlePopState = (event) => {
            event.preventDefault();
            goBack();
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [history]);

    // ============================================
    // FUNCIONES DE NAVEGACIÓN
    // ============================================
    const navigateTo = (newStep) => {
        setHistory(prev => [...prev, newStep]);
        setStep(newStep);
    };

    const goBack = () => {
        if (history.length <= 1) {
            if (confirm('¿Salir de la aplicación?')) {
                window.close();
            }
            return;
        }

        const newHistory = [...history];
        newHistory.pop();
        const previousStep = newHistory[newHistory.length - 1];
        setHistory(newHistory);
        setStep(previousStep);
    };

    // ============================================
    // FUNCIONES DE SCROLL AUTOMÁTICO
    // ============================================
    React.useEffect(() => {
        if (selectedService) {
            setTimeout(() => {
                document.getElementById('worker-section')?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 300);
        }
    }, [selectedService]);

    React.useEffect(() => {
        if (selectedWorker) {
            setTimeout(() => {
                document.getElementById('calendar-section')?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 300);
        }
    }, [selectedWorker]);

    React.useEffect(() => {
        if (selectedDate) {
            setTimeout(() => {
                document.getElementById('time-section')?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 300);
        }
    }, [selectedDate]);

    // ============================================
    // MANEJO DE ACCESO
    // ============================================
    const handleAccessGranted = (nombre, whatsapp) => {
        const clienteData = { nombre, whatsapp };
        setCliente(clienteData);
        setUserRol('cliente');
        localStorage.setItem('clienteAuth', JSON.stringify(clienteData));
        navigateTo('welcome');
    };

    const handleStartBooking = () => {
        navigateTo('service');
    };

    const handleLogout = () => {
        localStorage.removeItem('clienteAuth');
        setCliente(null);
        setSelectedService(null);
        setSelectedWorker(null);
        setSelectedDate('');
        setSelectedTime('');
        setUserRol('cliente');
        setHistory(['auth']);
        setStep('auth');
    };

    const resetBooking = () => {
        setSelectedService(null);
        setSelectedWorker(null);
        setSelectedDate('');
        setSelectedTime('');
        setStep('service');
        setBookingConfirmed(null);
    };

    const goToMyBookings = () => {
        navigateTo('mybookings');
    };

    const handleVolverDeMyBookings = () => {
        goBack();
    };

    // ============================================
    // RENDERIZADO DE PANTALLAS
    // ============================================
    const renderStep = () => {
        switch(step) {
            case 'auth':
                return (
                    <ClientAuthScreen 
                        onAccessGranted={handleAccessGranted}
                        onGoBack={history.length > 1 ? goBack : null}
                    />
                );
            
            case 'welcome':
                return (
                    <WelcomeScreen 
                        onStart={handleStartBooking}
                        onGoBack={goBack}
                        cliente={cliente}
                        userRol={userRol}
                    />
                );
            
            case 'mybookings':
                return (
                    <MyBookings 
                        cliente={cliente} 
                        onVolver={handleVolverDeMyBookings}
                    />
                );
            
            case 'service':
                return (
                    <div className="min-h-screen bg-gray-50">
                        <Header 
                            cliente={cliente} 
                            onLogout={handleLogout}
                            onMisReservas={goToMyBookings}
                            onGoBack={goBack}
                            userRol={userRol}
                            showBackButton={true}
                        />
                        
                        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                            {/* SECCIÓN 1: SERVICIOS */}
                            <ServiceSelection 
                                onSelect={setSelectedService} 
                                selectedService={selectedService}
                            />
                            
                            {/* SECCIÓN 2: BARBEROS (con id para scroll) */}
                            {selectedService && (
                                <div id="worker-section">
                                    <WorkerSelector 
                                        onSelect={setSelectedWorker} 
                                        selectedWorker={selectedWorker}
                                    />
                                </div>
                            )}
                            
                            {/* SECCIÓN 3: CALENDARIO (con id para scroll) */}
                            {selectedWorker && (
                                <div id="calendar-section">
                                    <Calendar 
                                        onDateSelect={setSelectedDate} 
                                        selectedDate={selectedDate}
                                        worker={selectedWorker}
                                    />
                                </div>
                            )}
                            
                            {/* SECCIÓN 4: HORARIOS (con id para scroll) */}
                            {selectedDate && (
                                <div id="time-section">
                                    <TimeSlots 
                                        service={selectedService}
                                        date={selectedDate}
                                        worker={selectedWorker}
                                        onTimeSelect={setSelectedTime}
                                        selectedTime={selectedTime}
                                    />
                                </div>
                            )}
                            
                            {/* SECCIÓN 5: CONFIRMACIÓN (cuando se selecciona hora) */}
                            {selectedTime && (
                                <BookingForm
                                    service={selectedService}
                                    worker={selectedWorker}
                                    date={selectedDate}
                                    time={selectedTime}
                                    cliente={cliente}
                                    onSubmit={(booking) => {
                                        setBookingConfirmed(booking);
                                        navigateTo('confirmation');
                                    }}
                                    onCancel={() => setSelectedTime('')}
                                />
                            )}
                        </div>
                        
                        <WhatsAppButton />
                    </div>
                );
            
            case 'confirmation':
                return (
                    <div className="min-h-screen bg-gray-50">
                        <Header 
                            cliente={cliente} 
                            onLogout={handleLogout}
                            onGoBack={goBack}
                            userRol={userRol}
                            showBackButton={true}
                        />
                        <Confirmation 
                            booking={bookingConfirmed} 
                            onReset={resetBooking}
                        />
                    </div>
                );
            
            default:
                return null;
        }
    };

    return renderStep();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ClientApp />);