export type SensorId = "bme280" | "mpu6050" | "mlx90640"

export interface SensorDefinition {
  id: SensorId
  displayName: string
  productName: string
  sku: string
  category: string
  manufacturer: string
  manufacturerPartNumber: string
  supplierPartNumber: string
  interface: "I²C"
  defaultI2cAddress: `0x${string}`
  capabilities: string[]
  description: string
  productUrl: string
  datasheetUrl: string
}

export const sensors: Record<SensorId, SensorDefinition> = {
  bme280: {
    id: "bme280",
    displayName: "BME280 · Humidity, Temperature & Pressure",
    productName: "BME280 Environmental Sensor Board",
    sku: "BME280",
    category: "Environmental Sensor",
    manufacturer: "Bosch Sensortec",
    manufacturerPartNumber: "BME280",
    supplierPartNumber: "C92489",
    interface: "I²C",
    defaultI2cAddress: "0x76",
    capabilities: ["Relative humidity", "Temperature", "Barometric pressure"],
    description:
      "A Bosch BME280 environmental sensor reference board for relative humidity, ambient temperature, and barometric pressure measurements over I²C.",
    productUrl:
      "https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/",
    datasheetUrl:
      "https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme280-ds002.pdf",
  },
  mpu6050: {
    id: "mpu6050",
    displayName: "MPU-6050 · 6-Axis Accelerometer & Gyroscope",
    productName: "MPU-6050 Motion Sensor Board",
    sku: "MPU6050",
    category: "6-Axis Motion Sensor",
    manufacturer: "TDK InvenSense",
    manufacturerPartNumber: "MPU-6050",
    supplierPartNumber: "C24112",
    interface: "I²C",
    defaultI2cAddress: "0x68",
    capabilities: ["3-axis accelerometer", "3-axis gyroscope"],
    description:
      "A six-axis motion-sensing reference board built around the MPU-6050, combining a three-axis accelerometer and three-axis gyroscope with an interrupt output.",
    productUrl:
      "https://product.tdk.com/en/search/sensor/mortion-inertial/imu/info?part_no=MPU-6050",
    datasheetUrl:
      "https://invensense.tdk.com/wp-content/uploads/2015/02/MPU-6000-Datasheet.pdf",
  },
  mlx90640: {
    id: "mlx90640",
    displayName: "MLX90640 · 32×24 Thermal Camera",
    productName: "MLX90640 Thermal Camera Board",
    sku: "MLX90640",
    category: "Thermal Camera",
    manufacturer: "Melexis",
    manufacturerPartNumber: "MLX90640ESF-BAA-000-TU",
    supplierPartNumber: "C17380659",
    interface: "I²C",
    defaultI2cAddress: "0x33",
    capabilities: ["32×24 far-infrared array", "110°×75° field of view"],
    description:
      "A wide-angle MLX90640 far-infrared thermal camera reference board with a 32×24-pixel sensor array and I²C interface.",
    productUrl:
      "https://www.melexis.com/en/product/MLX90640/Far-Infrared-Thermal-Sensor-Array",
    datasheetUrl:
      "https://media.melexis.com/-/media/files/documents/datasheets/mlx90640-datasheet-melexis.pdf",
  },
}
