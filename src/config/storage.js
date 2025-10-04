import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Crea y retorna un cliente S3 configurado para MinIO en Railway
 */
export const getStorageClient = () => {
  const config = {
    region: import.meta.env.VITE_STORAGE_REGION || "us-east-1",
    credentials: {
      accessKeyId: import.meta.env.VITE_STORAGE_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_STORAGE_SECRET_ACCESS_KEY,
    },
    // Force path style es necesario para MinIO
    forcePathStyle: true,
  };

  // Agregar endpoint si está definido (MinIO/R2)
  if (import.meta.env.VITE_STORAGE_ENDPOINT) {
    config.endpoint = import.meta.env.VITE_STORAGE_ENDPOINT;
  }

  return new S3Client(config);
};

/**
 * Sube un PDF al storage MinIO y retorna la URL pública
 * @param {Blob} pdfBlob - El blob del PDF generado por jsPDF
 * @param {string} userId - ID del usuario de Firebase
 * @param {string} pdfId - ID único del PDF (nombre del archivo)
 * @returns {Promise<string>} URL pública del PDF
 */
export const uploadPdfToStorage = async (pdfBlob, userId, pdfId) => {
  try {
    const client = getStorageClient();
    const bucketName = import.meta.env.VITE_STORAGE_BUCKET_NAME;
    const key = `quotations_pdf/${userId}/${pdfId}`;

    // Convertir Blob a ArrayBuffer para S3
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: "application/pdf",
      // Metadata opcional para debugging
      Metadata: {
        uploadedAt: new Date().toISOString(),
        userId: userId,
      },
    });

    await client.send(command);

    // Construir URL pública del archivo
    // Formato: https://tu-minio.railway.app/bucket-name/path/to/file.pdf
    const publicUrl = import.meta.env.VITE_STORAGE_PUBLIC_URL;
    return `${publicUrl}/${bucketName}/${key}`;
  } catch (error) {
    console.error("Error uploading to MinIO storage:", error);
    throw new Error(`Error al subir PDF a MinIO: ${error.message}`);
  }
};

/**
 * Verifica que todas las variables de entorno necesarias estén configuradas
 * @returns {boolean} true si la configuración es válida
 */
export const checkStorageConfig = () => {
  const required = [
    "VITE_STORAGE_ACCESS_KEY_ID",
    "VITE_STORAGE_SECRET_ACCESS_KEY",
    "VITE_STORAGE_BUCKET_NAME",
    "VITE_STORAGE_PUBLIC_URL",
    "VITE_STORAGE_ENDPOINT",
  ];

  const missing = required.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    console.error(
      "❌ Faltan variables de entorno para MinIO storage:",
      missing
    );
    return false;
  }

  console.log("✅ Configuración de MinIO storage verificada correctamente");
  return true;
};
