// Bangle.setLCDPower(1);
// Bangle.setLCDTimeout(0);

hourWords = [null, 'ett', 'tv\u00E5', 'tre', 'fyra', 'fem', 'sex', 'sju', '\u00E5tta', 'nio', 'tio', 'elva', 'tolv'];
minuteWords = [null, 'fem över', 'tio över', 'kvart över', 'tjugo över', 'fem i halv', 'halv', 'fem över halv', 'tjugo i', 'kvart i', 'tio i', 'fem i'];
dayWords = ['söndag', 'm\u00E5ndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];


const x0 = 0;
const x1 = g.getWidth();
const width = g.getWidth();
const y0 = 24; // Below widget area
const y1 = g.getHeight();
const height = y1 - y0;
const cx = x0 + width / 2;
const cy = y0 + height / 2;


// @todo use g.theme

const colorBackground = g.theme.bg;
const colorText = g.theme.fg;

function padZero(x) {
  return `${x < 10 ? '0' : ''}${x}`;
}

function getCurrentDateAndWeek(now) {
  const date = new Date(now.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  const formatted = now.getFullYear() + '-' + padZero(now.getMonth() + 1) + '-' + padZero(now.getDate());
  const weekday = dayWords[now.getDay()];
  return [formatted, weekNumber, weekday];
}



let showDate = 0
Bangle.on('touch', () => {
  showDate = showDate > 0 ? 0 : 3;
});

function draw() {
  g.reset();
  g.setColor(colorBackground);
  g.fillRect(x0, y0, x1, y1);

  if (showDate) {
    showDate--;
    drawDate();
  } else {
    drawClock();
  }
}

function drawDate() {

  const d = new Date();
  const fields = getCurrentDateAndWeek(d);
  g.setColor(g.theme.fg);
  g.setFont("Vector", 24);
  g.setFontAlign(0, 1); // align center bottom
  g.drawString(fields[2], cx, cy - 24);
  g.drawString(fields[0], cx, cy);
  g.drawString('v.' + fields[1], cx, cy + 24);
}

function convertToWords(d) {
  const fiveMinutes = Math.floor(d.getMinutes() / 5);
  const h = d.getHours() + (fiveMinutes >= 5 ? 1 : 0);
  let hour = h;
  if (h === 0) {
    hour = 12;
  } else if (h > 12) {
    hour = h - 12;
  }
  if (fiveMinutes === 0) {
    return hourWords[hour];
  }
  return `${minuteWords[fiveMinutes]} ${hourWords[hour]}`;
}

function drawClock() {
  const d = new Date();
  const words = convertToWords(d);
  g.setColor(g.theme.bg);
  g.fillRect(x0, y0, width, height);
  g.setFont("Vector", 48);
  const wrapped = g.wrapString(words, x1 - 10);
  g.setColor(g.theme.fg);
  g.setFontAlign(0, 0); // align middle bottom
  const ystart = cy - wrapped.length * 40 / 2 + 20;
  for (i = 0; i < wrapped.length; i++) {
    g.drawString(wrapped[i], cx, ystart + i * 40, false /*clear background*/);
  }
}

// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw();
let secondInterval = setInterval(draw, 1000);
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower', on => {
  if (on && !secondInterval) {
    secondInterval = setInterval(draw, 1000);
    draw(); // draw immediately
  } else if (!on && secondInterval) {
    clearInterval(secondInterval);
    secondInterval = undefined;
  }
});




// Show launcher when middle button pressed
Bangle.setUI('clock');
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();