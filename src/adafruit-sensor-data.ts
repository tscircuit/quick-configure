export const adafruitSensorIds = [
  "adafruit-bno085",
  "adafruit-mcp9808",
  "adafruit-bno055",
  "adafruit-sht45",
  "adafruit-sht41",
  "adafruit-lis3dh",
  "adafruit-lsm6dsox",
  "adafruit-aht20",
  "adafruit-vl53l4cd",
  "adafruit-veml7700",
] as const

export type AdafruitSensorId = (typeof adafruitSensorIds)[number]
export type I2cAddress = `0x${string}`

export interface AdafruitSensorDefinition {
  id: AdafruitSensorId
  displayName: string
  productName: string
  sku: `PID${number}`
  adafruitProductId: number
  category: string
  sensorPartNumber: string
  interface: "I²C"
  defaultI2cAddress: I2cAddress
  alternateI2cAddresses: readonly I2cAddress[]
  capabilities: readonly string[]
  description: string
  productUrl: `https://www.adafruit.com/product/${number}`
  datasheetUrl: `https://${string}`
}

export const mspm0SensorController = {
  id: "mspm0g3507",
  displayName: "TI MSPM0G3507",
  manufacturerPartNumber: "MSPM0G3507SPMR",
  supplierPartNumber: "C22389960",
} as const

export const adafruitSensors: Record<
  AdafruitSensorId,
  AdafruitSensorDefinition
> = {
  "adafruit-bno085": {
    id: "adafruit-bno085",
    displayName: "BNO085 · 9-DOF Orientation IMU",
    productName: "Adafruit BNO085 9-DOF Orientation IMU Fusion Breakout",
    sku: "PID4754",
    adafruitProductId: 4754,
    category: "9-DOF Orientation Sensor",
    sensorPartNumber: "BNO085",
    interface: "I²C",
    defaultI2cAddress: "0x4A",
    alternateI2cAddresses: ["0x4B"],
    capabilities: [
      "3-axis accelerometer",
      "3-axis gyroscope",
      "3-axis magnetometer",
      "Fused orientation vectors",
    ],
    description:
      "A nine-axis orientation breakout built around the BNO085 sensor hub, providing fused rotation vectors plus accelerometer, gyroscope, and magnetometer data over I²C.",
    productUrl: "https://www.adafruit.com/product/4754",
    datasheetUrl:
      "https://www.ceva-ip.com/wp-content/uploads/BNO080_085-Datasheet.pdf",
  },
  "adafruit-mcp9808": {
    id: "adafruit-mcp9808",
    displayName: "MCP9808 · High-Accuracy Temperature",
    productName: "Adafruit MCP9808 High Accuracy I2C Temperature Sensor",
    sku: "PID1782",
    adafruitProductId: 1782,
    category: "Temperature Sensor",
    sensorPartNumber: "MCP9808T-E/MS",
    interface: "I²C",
    defaultI2cAddress: "0x18",
    alternateI2cAddresses: [
      "0x19",
      "0x1A",
      "0x1B",
      "0x1C",
      "0x1D",
      "0x1E",
      "0x1F",
    ],
    capabilities: ["High-accuracy ambient temperature", "Alert output"],
    description:
      "A high-accuracy digital temperature breakout built around the MCP9808, with an alert output and three address-select inputs for multi-sensor I²C designs.",
    productUrl: "https://www.adafruit.com/product/1782",
    datasheetUrl: "https://www.adafruit.com/datasheets/MCP9808.pdf",
  },
  "adafruit-bno055": {
    id: "adafruit-bno055",
    displayName: "BNO055 · Absolute Orientation Sensor",
    productName: "Adafruit BNO055 Absolute Orientation Sensor",
    sku: "PID2472",
    adafruitProductId: 2472,
    category: "9-DOF Orientation Sensor",
    sensorPartNumber: "BNO055",
    interface: "I²C",
    defaultI2cAddress: "0x28",
    alternateI2cAddresses: ["0x29"],
    capabilities: [
      "3-axis accelerometer",
      "3-axis gyroscope",
      "3-axis magnetometer",
      "On-chip sensor fusion",
    ],
    description:
      "A nine-axis absolute-orientation breakout whose BNO055 combines an accelerometer, gyroscope, magnetometer, and on-chip sensor-fusion processor.",
    productUrl: "https://www.adafruit.com/product/2472",
    datasheetUrl:
      "https://cdn-learn.adafruit.com/assets/assets/000/125/776/original/bst-bno055-ds000.pdf?1698865246",
  },
  "adafruit-sht45": {
    id: "adafruit-sht45",
    displayName: "SHT45 · Precision Temperature & Humidity",
    productName:
      "Adafruit Sensirion SHT45 Precision Temperature & Humidity Sensor",
    sku: "PID5665",
    adafruitProductId: 5665,
    category: "Temperature & Humidity Sensor",
    sensorPartNumber: "SHT45-AD1B-R2",
    interface: "I²C",
    defaultI2cAddress: "0x44",
    alternateI2cAddresses: [],
    capabilities: ["Relative humidity", "Ambient temperature"],
    description:
      "A precision temperature and relative-humidity breakout built around Sensirion's SHT45, with a fixed I²C address and integrated heater.",
    productUrl: "https://www.adafruit.com/product/5665",
    datasheetUrl:
      "https://cdn-shop.adafruit.com/product-files/5665/5665_Datasheet_SHT4x.pdf",
  },
  "adafruit-sht41": {
    id: "adafruit-sht41",
    displayName: "SHT41 · Temperature & Humidity",
    productName: "Adafruit Sensirion SHT41 Temperature & Humidity Sensor",
    sku: "PID5776",
    adafruitProductId: 5776,
    category: "Temperature & Humidity Sensor",
    sensorPartNumber: "SHT41-AD1B-R2",
    interface: "I²C",
    defaultI2cAddress: "0x44",
    alternateI2cAddresses: [],
    capabilities: ["Relative humidity", "Ambient temperature"],
    description:
      "A compact temperature and relative-humidity breakout built around Sensirion's SHT41, with a fixed I²C address and integrated heater.",
    productUrl: "https://www.adafruit.com/product/5776",
    datasheetUrl:
      "https://cdn-shop.adafruit.com/product-files/5776/Datasheet_SHT4x.pdf",
  },
  "adafruit-lis3dh": {
    id: "adafruit-lis3dh",
    displayName: "LIS3DH · 3-Axis Accelerometer",
    productName: "Adafruit LIS3DH Triple-Axis Accelerometer Breakout",
    sku: "PID2809",
    adafruitProductId: 2809,
    category: "3-Axis Motion Sensor",
    sensorPartNumber: "LIS3DHTR",
    interface: "I²C",
    defaultI2cAddress: "0x18",
    alternateI2cAddresses: ["0x19"],
    capabilities: ["3-axis acceleration", "Tap and motion interrupts"],
    description:
      "A low-power three-axis accelerometer breakout built around the LIS3DH, with selectable measurement ranges plus tap and motion interrupt outputs.",
    productUrl: "https://www.adafruit.com/product/2809",
    datasheetUrl:
      "https://cdn-learn.adafruit.com/assets/assets/000/085/846/original/lis3dh.pdf?1576396666",
  },
  "adafruit-lsm6dsox": {
    id: "adafruit-lsm6dsox",
    displayName: "LSM6DSOX · 6-Axis Accelerometer & Gyroscope",
    productName: "Adafruit LSM6DSOX 6 DoF Accelerometer and Gyroscope",
    sku: "PID4438",
    adafruitProductId: 4438,
    category: "6-Axis Motion Sensor",
    sensorPartNumber: "LSM6DSOXTR",
    interface: "I²C",
    defaultI2cAddress: "0x6A",
    alternateI2cAddresses: ["0x6B"],
    capabilities: [
      "3-axis accelerometer",
      "3-axis gyroscope",
      "Programmable machine-learning core",
    ],
    description:
      "A six-axis motion breakout combining the LSM6DSOX accelerometer and gyroscope with programmable interrupt and machine-learning features.",
    productUrl: "https://www.adafruit.com/product/4438",
    datasheetUrl: "https://www.st.com/resource/en/datasheet/lsm6dsox.pdf",
  },
  "adafruit-aht20": {
    id: "adafruit-aht20",
    displayName: "AHT20 · Temperature & Humidity",
    productName: "Adafruit AHT20 Temperature & Humidity Sensor Breakout",
    sku: "PID4566",
    adafruitProductId: 4566,
    category: "Temperature & Humidity Sensor",
    sensorPartNumber: "AHT20",
    interface: "I²C",
    defaultI2cAddress: "0x38",
    alternateI2cAddresses: [],
    capabilities: ["Relative humidity", "Ambient temperature"],
    description:
      "A straightforward temperature and relative-humidity breakout built around the AHT20, using a fixed I²C address for simple environmental sensing.",
    productUrl: "https://www.adafruit.com/product/4566",
    datasheetUrl:
      "https://cdn-learn.adafruit.com/assets/assets/000/123/394/original/Data_Sheet_AHT20.pdf?1691532479",
  },
  "adafruit-vl53l4cd": {
    id: "adafruit-vl53l4cd",
    displayName: "VL53L4CD · Time-of-Flight Distance",
    productName: "Adafruit VL53L4CD Time of Flight Distance Sensor",
    sku: "PID5396",
    adafruitProductId: 5396,
    category: "Time-of-Flight Distance Sensor",
    sensorPartNumber: "VL53L4CDV0DH/1",
    interface: "I²C",
    defaultI2cAddress: "0x29",
    alternateI2cAddresses: [],
    capabilities: ["Time-of-flight distance", "Programmable range threshold"],
    description:
      "A short-range time-of-flight distance breakout built around ST's VL53L4CD, with shutdown and interrupt pins for multi-sensor ranging systems.",
    productUrl: "https://www.adafruit.com/product/5396",
    datasheetUrl: "https://www.st.com/resource/en/datasheet/vl53l4cd.pdf",
  },
  "adafruit-veml7700": {
    id: "adafruit-veml7700",
    displayName: "VEML7700 · Ambient Light",
    productName: "Adafruit VEML7700 Lux Sensor",
    sku: "PID4162",
    adafruitProductId: 4162,
    category: "Ambient Light Sensor",
    sensorPartNumber: "VEML7700-TR",
    interface: "I²C",
    defaultI2cAddress: "0x10",
    alternateI2cAddresses: [],
    capabilities: ["Ambient illuminance", "16-bit light measurement"],
    description:
      "A high-dynamic-range ambient-light breakout built around the VEML7700, providing 16-bit illuminance measurements over I²C.",
    productUrl: "https://www.adafruit.com/product/4162",
    datasheetUrl: "https://www.vishay.com/docs/84286/veml7700.pdf",
  },
}
