import { Request, Response } from 'express';
import axios from 'axios';

const QR_SERVICE_URL = process.env.QR_SERVICE_URL || 'http://qr-service:8000';

export const generateQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gymId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Token de autenticación requerido' });
      return;
    }

    if (!gymId) {
      res.status(400).json({ error: 'gymId es requerido' });
      return;
    }

    // Llamar al servicio QR de Python
    const response = await axios.post(
      `${QR_SERVICE_URL}/generate-qr`,
      { gymId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 segundos timeout
      }
    );

    res.json(response.data);
  } catch (error: any) {
    console.error('Error generando QR:', error.message);
    
    if (error.response) {
      // Error desde el servicio QR
      res.status(error.response.status).json({
        error: error.response.data.detail || 'Error del servicio QR',
        details: error.response.data
      });
    } else if (error.request) {
      // Error de red
      res.status(503).json({
        error: 'Servicio QR no disponible',
        message: 'No se pudo conectar al servicio de generación de QR'
      });
    } else {
      // Error interno
      res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }
};

export const validateQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrToken } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Token de autenticación requerido' });
      return;
    }

    if (!qrToken) {
      res.status(400).json({ error: 'qrToken es requerido' });
      return;
    }

    // Llamar al servicio QR de Python para validación
    const response = await axios.post(
      `${QR_SERVICE_URL}/validate-qr`,
      { qr_token: qrToken },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );

    res.json(response.data);
  } catch (error: any) {
    console.error('Error validando QR:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data.detail || 'Error validando QR',
        details: error.response.data
      });
    } else if (error.request) {
      res.status(503).json({
        error: 'Servicio QR no disponible',
        message: 'No se pudo conectar al servicio de validación de QR'
      });
    } else {
      res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }
};

export const getQRServiceHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.get(`${QR_SERVICE_URL}/health`, {
      timeout: 5000,
    });
    
    res.json({
      qr_service: 'available',
      status: response.data,
      url: QR_SERVICE_URL
    });
  } catch (error: any) {
    res.status(503).json({
      qr_service: 'unavailable',
      error: error.message,
      url: QR_SERVICE_URL
    });
  }
};