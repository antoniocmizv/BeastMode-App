// Ejemplo de implementación QR en React Native
// Instalar dependencias: npm install react-native-qrcode-generator react-native-qrcode-scanner

import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Button, ActivityIndicator } from 'react-native-paper';
import QRCode from 'react-native-qrcode-generator';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

interface QRGenResponse {
  qrToken: string;
  expiresAt: string;
  gymAccess: {
    id: string;
    user: { name: string };
    gym: { name: string };
  };
}

export default function QRAccessScreen() {
  const { authState, API_URL } = useContext(AuthContext);
  const [qrData, setQrData] = useState<QRGenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  
  // Generar QR para acceso
  const generateQR = async (gymId: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/qr/generate`,
        { gymId },
        {
          headers: {
            Authorization: `Bearer ${authState?.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      setQrData(response.data);
      Alert.alert(
        '✅ QR Generado',
        `Tu código QR para acceso al ${response.data.gymAccess.gym.name} está listo. Expira en 5 minutos.`
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo generar el QR'
      );
    } finally {
      setLoading(false);
    }
  };

  // Validar QR escaneado (para personal del gym)
  const validateQR = async (qrToken: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/qr/validate`,
        { qrToken },
        {
          headers: {
            Authorization: `Bearer ${authState?.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      Alert.alert(
        '✅ Acceso Autorizado',
        `Bienvenido ${response.data.user.name} a ${response.data.gym.name}`
      );
      setScanMode(false);
    } catch (error: any) {
      Alert.alert(
        '❌ Acceso Denegado',
        error.response?.data?.message || 'QR inválido'
      );
    } finally {
      setLoading(false);
    }
  };

  // Obtener historial de accesos
  const getHistory = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/qr/history`,
        {
          headers: {
            Authorization: `Bearer ${authState?.token}`,
          },
        }
      );
      
      // Aquí puedes navegar a una pantalla de historial
      console.log('Historial:', response.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener el historial');
    }
  };

  const onQRScanned = (e: any) => {
    if (e.data) {
      validateQR(e.data);
    }
  };

  if (scanMode) {
    return (
      <View style={styles.container}>
        <QRCodeScanner
          onRead={onQRScanned}
          topContent={
            <Text style={styles.centerText}>
              Escanea el código QR para validar acceso
            </Text>
          }
          bottomContent={
            <TouchableOpacity
              style={styles.buttonTouchable}
              onPress={() => setScanMode(false)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acceso QR al Gimnasio</Text>
      
      {qrData && (
        <View style={styles.qrContainer}>
          <QRCode
            value={qrData.qrToken}
            size={200}
            bgColor="white"
            fgColor="black"
          />
          <Text style={styles.qrInfo}>
            Gimnasio: {qrData.gymAccess.gym.name}
          </Text>
          <Text style={styles.expiry}>
            Expira: {new Date(qrData.expiresAt).toLocaleTimeString()}
          </Text>
        </View>
      )}

      <View style={styles.buttonsContainer}>
        <Button
          mode="contained"
          onPress={() => generateQR('YOUR_GYM_ID')} // Reemplazar con gymId real
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Generar QR de Acceso
        </Button>

        <Button
          mode="outlined"
          onPress={() => setScanMode(true)}
          disabled={loading}
          style={styles.button}
        >
          Escanear QR (Staff)
        </Button>

        <Button
          mode="text"
          onPress={getHistory}
          disabled={loading}
          style={styles.button}
        >
          Ver Historial
        </Button>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>Procesando...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  qrInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  expiry: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  buttonsContainer: {
    gap: 15,
  },
  button: {
    marginVertical: 5,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    fontSize: 18,
    padding: 32,
    color: '#777',
    textAlign: 'center',
  },
  buttonTouchable: {
    padding: 16,
    backgroundColor: '#ff0000',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 21,
    color: 'white',
    textAlign: 'center',
  },
});
