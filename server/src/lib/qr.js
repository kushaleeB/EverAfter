import QRCode from 'qrcode';

export async function generateQrDataUrl(text, options = {}) {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 300,
    color: { dark: '#6d5c43', light: '#fcf9f8' },
    ...options,
  });
}

export async function generateQrBuffer(text, options = {}) {
  return QRCode.toBuffer(text, {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 400,
    color: { dark: '#6d5c43', light: '#fcf9f8' },
    ...options,
  });
}
