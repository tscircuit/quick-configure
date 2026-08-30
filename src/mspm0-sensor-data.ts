export const mspm0SensorIds = [
  "bno085",
  "mcp9808",
  "bno055",
  "sht45",
  "sht41",
  "lis3dh",
  "lsm6dsox",
  "aht20",
  "vl53l4cd",
  "veml7700",
] as const;

export type Mspm0SensorId = (typeof mspm0SensorIds)[number];
export type I2cAddress = `0x${string}`;

export interface Mspm0SensorDefinition {
  id: Mspm0SensorId;
  displayName: string;
  category: string;
  sensorPartNumber: string;
  interface: "I²C";
  defaultI2cAddress: I2cAddress;
  alternateI2cAddresses: readonly I2cAddress[];
  capabilities: readonly string[];
  description: string;
  datasheetUrl: `https://${string}`;
}

export const mspm0SensorController = {
  id: "mspm0g3507",
  displayName: "TI MSPM0G3507",
  manufacturerPartNumber: "MSPM0G3507SPMR",
  supplierPartNumber: "C22389960",
} as const;

export const mspm0Sensors: Record<Mspm0SensorId, Mspm0SensorDefinition> = {
  bno085: {
    id: "bno085",
    displayName: "BNO085 · 9-DOF Orientation IMU",
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
      "A nine-axis orientation reference board built around the BNO085 sensor hub, providing fused rotation vectors plus accelerometer, gyroscope, and magnetometer data over I²C.",
    datasheetUrl:
      "https://www.ceva-ip.com/wp-content/uploads/BNO080_085-Datasheet.pdf",
  },
  mcp9808: {
    id: "mcp9808",
    displayName: "MCP9808 · High-Accuracy Temperature",
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
      "A high-accuracy digital temperature reference board built around the MCP9808, with an alert output and three address-select inputs for multi-sensor I²C designs.",
    datasheetUrl:
      "https://ww1.microchip.com/downloads/aemDocuments/documents/OTH/ProductDocuments/DataSheets/MCP9808-0.5C-Maximum-Accuracy-Digital-Temperature-Sensor-Data-Sheet-DS20005095B.pdf",
  },
  bno055: {
    id: "bno055",
    displayName: "BNO055 · Absolute Orientation Sensor",
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
      "A nine-axis absolute-orientation reference board whose BNO055 combines an accelerometer, gyroscope, magnetometer, and on-chip sensor-fusion processor.",
    datasheetUrl:
      "https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bno055-ds000.pdf",
  },
  sht45: {
    id: "sht45",
    displayName: "SHT45 · Precision Temperature & Humidity",
    category: "Temperature & Humidity Sensor",
    sensorPartNumber: "SHT45-AD1B-R2",
    interface: "I²C",
    defaultI2cAddress: "0x44",
    alternateI2cAddresses: [],
    capabilities: ["Relative humidity", "Ambient temperature"],
    description:
      "A precision temperature and relative-humidity reference board built around Sensirion's SHT45, with a fixed I²C address and integrated heater.",
    datasheetUrl: "https://sensirion.com/resource/datasheet/sht4x",
  },
  sht41: {
    id: "sht41",
    displayName: "SHT41 · Temperature & Humidity",
    category: "Temperature & Humidity Sensor",
    sensorPartNumber: "SHT41-AD1B-R2",
    interface: "I²C",
    defaultI2cAddress: "0x44",
    alternateI2cAddresses: [],
    capabilities: ["Relative humidity", "Ambient temperature"],
    description:
      "A compact temperature and relative-humidity reference board built around Sensirion's SHT41, with a fixed I²C address and integrated heater.",
    datasheetUrl: "https://sensirion.com/resource/datasheet/sht4x",
  },
  lis3dh: {
    id: "lis3dh",
    displayName: "LIS3DH · 3-Axis Accelerometer",
    category: "3-Axis Motion Sensor",
    sensorPartNumber: "LIS3DHTR",
    interface: "I²C",
    defaultI2cAddress: "0x18",
    alternateI2cAddresses: ["0x19"],
    capabilities: ["3-axis acceleration", "Tap and motion interrupts"],
    description:
      "A low-power three-axis accelerometer reference board built around the LIS3DH, with selectable measurement ranges plus tap and motion interrupt outputs.",
    datasheetUrl: "https://www.st.com/resource/en/datasheet/lis3dh.pdf",
  },
  lsm6dsox: {
    id: "lsm6dsox",
    displayName: "LSM6DSOX · 6-Axis Accelerometer & Gyroscope",
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
      "A six-axis motion reference board combining the LSM6DSOX accelerometer and gyroscope with programmable interrupt and machine-learning features.",
    datasheetUrl: "https://www.st.com/resource/en/datasheet/lsm6dsox.pdf",
  },
  aht20: {
    id: "aht20",
    displayName: "AHT20 · Temperature & Humidity",
    category: "Temperature & Humidity Sensor",
    sensorPartNumber: "AHT20",
    interface: "I²C",
    defaultI2cAddress: "0x38",
    alternateI2cAddresses: [],
    capabilities: ["Relative humidity", "Ambient temperature"],
    description:
      "A temperature and relative-humidity reference board built around the AHT20, using a fixed I²C address for straightforward environmental sensing.",
    datasheetUrl:
      "https://www.aosong.com/userfiles/files/media/AHT20%20%E8%8B%B1%E6%96%87%E7%89%88%E8%AF%B4%E6%98%8E%E4%B9%A6%20A0%2020201222.pdf",
  },
  vl53l4cd: {
    id: "vl53l4cd",
    displayName: "VL53L4CD · Time-of-Flight Distance",
    category: "Time-of-Flight Distance Sensor",
    sensorPartNumber: "VL53L4CDV0DH/1",
    interface: "I²C",
    defaultI2cAddress: "0x29",
    alternateI2cAddresses: [],
    capabilities: ["Time-of-flight distance", "Programmable range threshold"],
    description:
      "A short-range time-of-flight reference board built around ST's VL53L4CD, with shutdown and interrupt pins for multi-sensor ranging systems.",
    datasheetUrl: "https://www.st.com/resource/en/datasheet/vl53l4cd.pdf",
  },
  veml7700: {
    id: "veml7700",
    displayName: "VEML7700 · Ambient Light",
    category: "Ambient Light Sensor",
    sensorPartNumber: "VEML7700-TR",
    interface: "I²C",
    defaultI2cAddress: "0x10",
    alternateI2cAddresses: [],
    capabilities: ["Ambient illuminance", "16-bit light measurement"],
    description:
      "A high-dynamic-range ambient-light reference board built around the VEML7700, providing 16-bit illuminance measurements over I²C.",
    datasheetUrl: "https://www.vishay.com/docs/84286/veml7700.pdf",
  },
};
