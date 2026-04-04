import QRCode from 'qrcode';

export const qrCodeService = {
  async generateQRCode(shortUrl) {
    try {
      const dataUrl = await QRCode.toDataURL(shortUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return dataUrl;
    } catch (error) {
      console.error('QR code generation failed:', error);
      return null;
    }
  },

  async generateQRCodePNG(shortUrl) {
    try {
      const buffer = await QRCode.toBuffer(shortUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return buffer;
    } catch (error) {
      console.error('QR code PNG generation failed:', error);
      return null;
    }
  },
};
