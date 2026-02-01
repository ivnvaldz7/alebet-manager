import { config } from 'dotenv'
config({ path: '.env.local' })

import connectDB from '../lib/db/mongoose'
import CustomerModel from '../lib/models/Customer'

async function seedClientes() {
  try {
    await connectDB()

    // Verificar si ya hay clientes
    const count = await CustomerModel.countDocuments()
    if (count > 0) {
      console.log(`✅ Ya hay ${count} clientes en la base de datos`)
      process.exit(0)
    }

    // Clientes del PDF CLIENTES.pdf
    const clientes = [
      { nombre: 'ZENON', calle: 'CORRIENTES', numero: '1165', localidad: 'GOYA, CORRIENTES' },
      { nombre: 'NORTE CORPORACION SANTIAGO MORALES', calle: 'S/N', numero: '453', localidad: 'SALTA' },
      { nombre: 'DROVET', calle: 'GUTENBERG', numero: '1557', localidad: 'ROSARIO, SANTA FÉ' },
      { nombre: 'LA RED COMERCIAL SRL', calle: 'URQUIZA', numero: '3050', localidad: 'ESPERANZA, SANTA FÉ' },
      { nombre: 'DISTRIBUIDORA TAURO', calle: 'LIENCURA', numero: '8450', localidad: 'B° UOCRA, ARGUELLO, CORDOBA' },
      { nombre: 'PASINATO, HERNAN', calle: 'PERON', numero: '640', localidad: 'MACIA, ENTRE RIOS' },
      { nombre: 'VET STORE', calle: 'PASTEUR', numero: '289', localidad: 'BARRIO LAMADRID, CORDOBA' },
      { nombre: 'OLIVERA, LUCAS DARÍO', calle: 'LA LAJA', numero: '2118', localidad: 'ALBARDÓN, SAN JUAN' },
      { nombre: 'BALBUENA, ROSA MANUELA', calle: 'CONCEPCIÓN DEL URUGUAY', numero: '2793', localidad: 'OBERÁ, MISIONES' },
      { nombre: 'YUQUERY', calle: 'RIVADAVIA', numero: '673', localidad: 'ESQUINA, CORRIENTES' },
      { nombre: 'SCHANG', calle: 'SALCEDA', numero: '1502', localidad: 'TANDIL, BUENOS AIRES' },
      { nombre: 'REPISO, GUIDO RAFAEL', calle: 'AVENIDA MADARIAGA', numero: '12', localidad: 'GOYA, CORRIENTES' },
      { nombre: 'ROSARIO INSUMOS AGROPECUARIOS S.A.', calle: 'AV. GRAL PERON', numero: '3697', localidad: 'ROSARIO, SANTA FÉ' },
      { nombre: 'ARIEL JAUREGUIBERRY', calle: 'BARRIO PARANA CASA 46, AV. RAMIREZ', numero: '4000', localidad: 'ENTRE RIOS' },
      { nombre: 'MOLINA, MARIANO-AVELINO, GIACOPUZZI', calle: '25 DE MAYO', numero: '131', localidad: 'VILLAGUAY, ENTRE RIOS' },
      { nombre: 'TRT CHACO', calle: 'SALTA', numero: '985', localidad: 'RESISTENCIA, CHACO' },
      { nombre: 'DOMVIL S.A.', calle: 'CALLE 130, ACCESO RUTA', numero: '11', localidad: 'ENTRE RIOS' },
      { nombre: 'OTERO, JUSTO ROBERTO', calle: 'AV. DE LOS INMIGRANTES', numero: 'S/N', localidad: 'ALDEA SAN ANTONIO, ENTRE RIOS' },
      { nombre: 'VETERINARIA NORTE MIRANDA', calle: '9 DE JULIO', numero: '788', localidad: 'AMEGHINO, BUENOS AIRES' },
      { nombre: 'VOCOS, ROMAN EZEQUIEL', calle: 'PEAJE ANTONIO SAENZ', numero: 'S/N', localidad: 'RIO CUARTO, CORDOBA' },
      { nombre: 'RENIERO, HUGO RAMON', calle: 'BELGRANO', numero: '1805', localidad: 'CHAJARÍ, ENTRE RIOS' },
      { nombre: 'BARRIOS, MARIANELA', calle: 'SARMIENTO', numero: '610', localidad: 'SAN LUIS DEL PALMAR, CORRIENTES' },
      { nombre: 'WIRTH, ALEXIS', calle: 'RUTA 16 ENTRE 12 Y 14', numero: 'S/N', localidad: 'ROQUE SAENZ PEÑA, CHACO' },
      { nombre: 'PIETRAGALLO, JUAN BAUTISTA', calle: 'AVENIDA FERRÉ', numero: '2074', localidad: 'CORRIENTES' },
      { nombre: 'AGROVETERINARIA MI QUERENCIA', calle: 'SARMIENTO', numero: '802', localidad: 'MERCEDES, CORRIENTES' },
      { nombre: 'BORDERES, GERMAN', calle: 'GDOR. GOMEZ', numero: '767', localidad: 'CURUZÚ CUATIA, CORRIENTES' },
      { nombre: 'PICOLINI, JOSE', calle: 'PAGO LARGO', numero: '1261', localidad: 'PASO DE LOS LIBRE, CORRIENTES' },
      { nombre: 'ALLEKOTE, ROMAN', calle: 'CALLE 1 ESQUINA 6', numero: 'S/N', localidad: 'CEIBAS, ENTRE RIOS' },
      { nombre: 'EDUARDO STERTZ E HIJOS', calle: 'MARTIN PANUTTO', numero: '1167', localidad: 'VIALE, ENTRE RIOS' },
      { nombre: 'MAGLIETTI, GUSTAVO RAUL', calle: 'SAAVEDRA', numero: '515', localidad: 'EL COLORADO, FORMOSA' },
      { nombre: 'LOS CHARABONES', calle: 'URQUIZA', numero: '907', localidad: 'CONCORDIA, ENTRE RIOS' },
      { nombre: 'TRT SANTA FE', calle: 'SAN JUAN', numero: '2430', localidad: 'SANTA FE' },
      { nombre: 'TRT MAR DEL PLATA', calle: 'AVENIDA COLON', numero: '3725', localidad: 'BUENOS AIRES' },
      { nombre: 'OCAMPO, NICOLAS RUFINO', calle: 'JUNIN', numero: '1269', localidad: 'SALTA' },
      { nombre: 'AMICO S.A.', calle: 'HUIDOBRO', numero: '1064', localidad: 'GODOY CRUZ, MENDOZA' },
      { nombre: 'NATALIA YAFAR', calle: 'LAVALLE', numero: '2594', localidad: 'ROSARIO, SANTA FE' },
      { nombre: 'DAROCA VICCO Y VERON S.A.', calle: '25 DE MAYO', numero: '651', localidad: 'GUALEGUAYCHU, ENTRE RIOS' },
      { nombre: 'EL PRONUNCIAMIENTO', calle: 'BERNARDO UCHITEL', numero: '399', localidad: 'BASAVILBASO, ENTRE RIOS' },
      { nombre: 'CORDERO, JOSE LUIS', calle: 'SAN MARTIN', numero: '460', localidad: 'SANTA LUCIA, CORRIENTES' },
    ]

    const clientesConFormato = clientes.map((c) => ({
      nombre: c.nombre,
      direccion: {
        calle: c.calle,
        numero: c.numero,
        localidad: c.localidad,
      },
    }))

    await CustomerModel.insertMany(clientesConFormato)

    console.log(`✅ ${clientesConFormato.length} clientes creados exitosamente`)
    console.log('Ejemplos:')
    clientesConFormato.slice(0, 5).forEach((c) => {
      console.log(`   - ${c.nombre} (${c.direccion.localidad})`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creando clientes:', error)
    process.exit(1)
  }
}

seedClientes()
