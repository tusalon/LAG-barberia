// components/WhatsAppButton.js - Para LAG.barberia (VERSIÓN API)

function WhatsAppButton() {
    return (
        <a 
            href="https://api.whatsapp.com/send?phone=53357234&text=Hola%20LAG.barberia%2C%20quiero%20consultar%20sobre%20turnos" 
            target="_blank" 
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-[#20bd5a] transition-all transform hover:scale-110 group"
            title="Chat en WhatsApp"
        >
            <div className="icon-message-circle text-3xl"></div>
            <span className="absolute right-full mr-3 bg-gray-800 text-amber-400 px-3 py-1 rounded-lg text-sm font-medium shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-amber-600">
                ¡Agendá tu turno!
            </span>
        </a>
    );
}