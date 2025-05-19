import { RequestHandler } from 'express';
import { consultarRutinaIA } from '../services/openai.service';

export const consultarIA: RequestHandler = async (req, res, next) => {
  try {
    const { pregunta } = req.body;

    if (!pregunta) {
      res.status(400).json({ error: 'La pregunta es requerida.' });
      return;
    }

    const respuesta = await consultarRutinaIA(pregunta);
    res.status(200).json({ respuesta });
  } catch (error) {
    next(error); // Delegar el error al middleware global de manejo de errores
  }
};