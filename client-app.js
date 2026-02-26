// client-app.js - Aplicación principal para clientes de LAG.barberia

function ClientApp() {
    // Estados principales
    const [step, setStep] = React.useState('welcome');
    const [cliente, setCliente] = React.useState(null);
    const [selectedService, setSelectedService] = React.useState(null);
    const [selectedWorker, setSelectedWorker] = React.useState(null);
    const [selectedDate, setSelectedDate] = React.useState('');
    const [selectedTime, setSelectedTime] = React.useState('');
    const [bookingConfirmed, setBookingConfirmed] = React.useState(null);
    const [userRol, setUserRol] = React.useState('cliente');

    React.useEffect(() => {
        // Verificar si hay sesión de admin o barbero
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
        
        // Verificar si hay cliente en localStorage (sesión persistente)
        const savedCliente = localStorage.getItem('clienteAuth');
        if (savedCliente && !adminAuth && !barberoAuth) {
            try {
                const clienteData = JSON.parse(savedCliente);
                setCliente(clienteData);
                setStep('service');
            } catch (e) {}
        }
    }, []);

    const handleAccessGranted = (nombre, whatsapp) => {
        const clienteData = { nombre, whatsapp };
        setCliente(clienteData);
        localStorage.setItem('clienteAuth', JSON.stringify(clienteData));
        setStep('service');
    };

    const handleLogout = () => {
        localStorage.removeItem('clienteAuth');
        setCliente(null);
        setSelectedService(null);
        setSelectedWorker(null);
        setSelectedDate('');
        setSelectedTime('');
        setStep('welcome');
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
        setStep('mybookings');
    };

    const renderStep = () => {
        switch(step) {
            case 'welcome':
                return <WelcomeScreen onStart={() => setStep('auth')} />;
            
            case 'auth':
                return <ClientAuthScreen onAccessGranted={handleAccessGranted} />;
            
            case 'mybookings':
                return (
                    <MyBookings 
                        cliente={cliente} 
                        onVolver={() => setStep('service')}
                    />
                );
            
            case 'service':
                return (
                    <div className="min-h-screen bg-gray-50">
                        <Header 
                            cliente={cliente} 
                            onLogout={handleLogout}
                            onMisReservas={goToMyBookings}
                            userRol={userRol}
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
                                        setStep('confirmation');
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
                        <Header cliente={cliente} onLogout={handleLogout} userRol={userRol} />
                        <Confirmation booking={bookingConfirmed} onReset={resetBooking} />
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
