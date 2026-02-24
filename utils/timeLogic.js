// utils/timeLogic.js - Versión con límite de 2 horas

// Helper to convert "HH:mm" to minutes since midnight
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Helper to convert minutes since midnight to "HH:mm" (formato 24h para BD)
function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Convertir hora 24h a formato 12h con AM/PM
function formatTo12Hour(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    let hour12 = hours % 12;
    hour12 = hour12 === 0 ? 12 : hour12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Obtener fecha actual en formato local YYYY-MM-DD
function getCurrentLocalDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 🔥 NUEVA FUNCIÓN: Obtener la hora mínima permitida (actual + 2 horas)
function getMinAllowedTime() {
    const now = new Date();
    // Sumar 2 horas
    now.setHours(now.getHours() + 2);
    
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Redondear hacia arriba al próximo múltiplo de 30 minutos
    let totalMinutes = hours * 60 + minutes;
    // Redondear hacia arriba al próximo bloque de 30 minutos
    totalMinutes = Math.ceil(totalMinutes / 30) * 30;
    
    const resultHours = Math.floor(totalMinutes / 60);
    const resultMinutes = totalMinutes % 60;
    
    return {
        hours: resultHours,
        minutes: resultMinutes,
        timeStr: `${resultHours.toString().padStart(2, '0')}:${resultMinutes.toString().padStart(2, '0')}`,
        totalMinutes: totalMinutes
    };
}

// 🔥 FUNCIÓN MODIFICADA: Verificar si una hora ya pasó (considerando +2 horas)
function isTimePassedToday(timeStr24) {
    const now = new Date();
    const minAllowed = getMinAllowedTime();
    
    const [slotHour, slotMinute] = timeStr24.split(':').map(Number);
    const slotTotalMinutes = slotHour * 60 + slotMinute;
    
    // Si el slot es menor que la hora mínima permitida, está pasado
    return slotTotalMinutes < minAllowed.totalMinutes;
}

// 🔥 NUEVA FUNCIÓN: Obtener el próximo horario disponible
function getNextAvailableTime() {
    const minAllowed = getMinAllowedTime();
    return minAllowed.timeStr;
}

// Filtrar slots disponibles considerando reservas existentes y hora mínima
function filterAvailableSlots(baseSlots, durationMinutes, existingBookings, date) {
    const todayStr = getCurrentLocalDate();
    const isToday = date === todayStr;
    
    return baseSlots.filter(slotStartStr => {
        const slotStart = timeToMinutes(slotStartStr);
        const slotEnd = slotStart + durationMinutes;
        
        // Si es hoy, verificar que no sea antes de la hora mínima
        if (isToday) {
            const minAllowed = getMinAllowedTime();
            if (slotStart < minAllowed.totalMinutes) {
                return false; // Descartar slots antes de la hora mínima
            }
        }

        // Verificar conflictos con reservas existentes
        const hasConflict = existingBookings.some(booking => {
            const bookingStart = timeToMinutes(booking.hora_inicio);
            const bookingEnd = timeToMinutes(booking.hora_fin);
            return (slotStart < bookingEnd) && (slotEnd > bookingStart);
        });

        return !hasConflict;
    });
}

// Calcular hora de fin basada en hora de inicio y duración
function calculateEndTime(startTimeStr, durationMinutes) {
    const startMins = timeToMinutes(startTimeStr);
    return minutesToTime(startMins + durationMinutes);
}

// 🔥 CONVERTIR ÍNDICE DE 30 MIN A HORA (0 = 00:00, 1 = 00:30, 2 = 01:00, etc.)
function indiceToHora(indice) {
    const horas = Math.floor(indice / 2);
    const minutos = indice % 2 === 0 ? '00' : '30';
    return `${horas.toString().padStart(2, '0')}:${minutos}`;
}

// 🔥 CONVERTIR HORA A ÍNDICE DE 30 MIN
function horaToIndice(horaStr) {
    const [hours, minutes] = horaStr.split(':').map(Number);
    return hours * 2 + (minutes === 30 ? 1 : 0);
}