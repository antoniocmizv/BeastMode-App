// src/services/ai.service.ts
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.OPENROUTER_API_KEY!;
const BASE_URL = process.env.OPENROUTER_BASE_URL!;
const MODEL = 'deepseek/deepseek-r1:free';

export const consultarRutinaIA = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('Error al consultar OpenAI:', error.response?.data || error.message);
    throw new Error('No se pudo obtener respuesta de la IA');
  }
};
