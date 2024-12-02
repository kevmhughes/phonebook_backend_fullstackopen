function getFormattedTimestamp() {
    const date = new Date();
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
    const month = date.toLocaleString('en-US', { month: 'short' });
    const dayOfMonth = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    const timezoneOffset = -date.getTimezoneOffset();
    const sign = timezoneOffset >= 0 ? '+' : '-';
    const hoursOffset = String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(2, '0');
    const minutesOffset = String(Math.abs(timezoneOffset) % 60).padStart(2, '0');
    const timezoneName = new Intl.DateTimeFormat('en-US', { timeZoneName: 'long' }).format(date);
    const timeZoneParts = timezoneName.split(',');  // Split by comma
    const timeZoneAbbreviation = timeZoneParts.length > 1 ? timeZoneParts[1].trim() : "";


    return `${dayOfWeek} ${month} ${dayOfMonth} ${year} ${hour}:${minute}:${second} GMT ${sign}${hoursOffset}${minutesOffset} (${timeZoneAbbreviation})`;
}

module.exports = {
    getFormattedTimestamp,
  };