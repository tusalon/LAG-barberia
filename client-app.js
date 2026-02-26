// client-app.js - Aplicación de clientes con flujo completo

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

    // Detectar si hay sesión de admin/barbero al iniciar
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
                setStep('welcome');
                setHistory(['auth', 'welcome']);
            } catch (e) {}
        }
    }, []);

    // Manejo del botón físico "atrás"
    React.useEffect(() => {
        const handlePopState = (event) => {
            event.preventDefault();
            goBack();
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [history]);

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

    const handleAccessGranted = (nombre, whatsapp) => {
        const clienteData = { nombre, whatsapp };
        setCliente(clienteData);
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
                            <ServiceSelection 
                                onSelect={setSelectedService} 
                                selectedService={selectedService}
                            />
                            
                            {selectedService && (
                                <WorkerSelector 
                                    onSelect={setSelectedWorker} 
                                    selectedWorker={selectedWorker}
                                />
                            )}
                            
                            {selectedWorker && (
                                <Calendar 
                                    onDateSelect={setSelectedDate} 
                                    selectedDate={selectedDate}
                                    worker={selectedWorker}
                                />
                            )}
                            
                            {selectedDate && (
                                <TimeSlots 
                                    service={selectedService}
                                    date={selectedDate}
                                    worker={selectedWorker}
                                    onTimeSelect={setSelectedTime}
                                    selectedTime={selectedTime}
                                />
                            )}
                            
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