export const IDLE_KAFKA_TOPIC = '0';
export const IDLE_ZMQ_PORT = 0;

export const IDLE_STREAM_FIELDS = {
  kafka_topic: IDLE_KAFKA_TOPIC,
  zmq_port: IDLE_ZMQ_PORT,
  use_kafka: false,
  use_service_ip: false,
  service_ip: null,
  kafka_server: null,
} as const;

export type CameraStreamWorkerAssignment = {
  tcp: boolean;
  use_kafka: boolean;
  use_service_ip: boolean;
  zmq_port: number;
  service_ip: string;
  kafka_server: string;
  kafka_topic: string;
  rtsp_url: string | null;
  camera_id: string;
};

export type StreamClientData = {
  status: boolean;
  kafka_topic: string;
  zmq_port: number;
  use_kafka: boolean;
  use_service_ip: boolean;
  service_ip: string | null;
  kafka_server: string | null;
  cameraService: object;
};

export type StreamRowFields = {
  status: boolean;
  kafka_topic: string;
  use_kafka: boolean;
  use_service_ip: boolean;
  zmq_port: number;
  service_ip: string | null;
  kafka_server: string | null;
};

export function isActiveKafkaTopic(kafkaTopic: string | null | undefined): boolean {
  return Boolean(kafkaTopic && kafkaTopic !== IDLE_KAFKA_TOPIC);
}

export function isActiveZmqPort(zmqPort: number | null | undefined): boolean {
  return Number(zmqPort) > IDLE_ZMQ_PORT;
}

export function isActiveStreamAssignment(row: { kafka_topic?: string | null; zmq_port?: number | null }): boolean {
  return isActiveKafkaTopic(row.kafka_topic) || isActiveZmqPort(row.zmq_port);
}

export function parseWorkerStreamAssignment(response: { data?: unknown } | null | undefined): CameraStreamWorkerAssignment | null {
  const data = response?.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;

  const row = data as Record<string, unknown>;
  const kafkaTopic = row.kafka_topic != null ? String(row.kafka_topic) : '';
  const cameraId = row.camera_id != null ? String(row.camera_id) : '';

  if (!kafkaTopic && !cameraId) return null;

  return {
    tcp: Boolean(row.tcp),
    use_kafka: Boolean(row.use_kafka),
    use_service_ip: Boolean(row.use_service_ip),
    zmq_port: Number(row.zmq_port) || IDLE_ZMQ_PORT,
    service_ip: row.service_ip != null ? String(row.service_ip) : '',
    kafka_server: row.kafka_server != null ? String(row.kafka_server) : '',
    kafka_topic: kafkaTopic || IDLE_KAFKA_TOPIC,
    rtsp_url: row.rtsp_url != null ? String(row.rtsp_url) : null,
    camera_id: cameraId,
  };
}

export function toDbStreamFields(assignment: CameraStreamWorkerAssignment) {
  return {
    status: true,
    kafka_topic: assignment.kafka_topic,
    use_kafka: assignment.use_kafka,
    use_service_ip: assignment.use_service_ip,
    zmq_port: assignment.zmq_port || IDLE_ZMQ_PORT,
    service_ip: assignment.service_ip || null,
    kafka_server: assignment.kafka_server || null,
  };
}

export function toStreamClientData(row: StreamRowFields, cameraService: object): StreamClientData {
  return {
    status: row.status,
    kafka_topic: row.kafka_topic,
    zmq_port: row.zmq_port ?? IDLE_ZMQ_PORT,
    use_kafka: row.use_kafka,
    use_service_ip: row.use_service_ip,
    service_ip: row.service_ip,
    kafka_server: row.kafka_server,
    cameraService,
  };
}

export function getStreamHost(
  row: { use_service_ip?: boolean; service_ip?: string | null },
  cameraService: { url: string },
): string {
  return row.use_service_ip && row.service_ip ? row.service_ip : cameraService.url;
}

export function getWorkerListItemCameraId(item: Record<string, unknown>): string {
  return String(item.camera_id ?? item.cameraId ?? '');
}

export function getWorkerListItemKafkaTopic(item: Record<string, unknown>): string {
  const topic = item.kafka_topic;
  return topic != null && String(topic) !== '' ? String(topic) : IDLE_KAFKA_TOPIC;
}

export function getWorkerListItemZmqPort(item: Record<string, unknown>): number {
  return Number(item.zmq_port) || IDLE_ZMQ_PORT;
}

export function getWorkerListItemUseKafka(item: Record<string, unknown>): boolean {
  return Boolean(item.use_kafka);
}

export function getWorkerListItemRtspUrl(item: Record<string, unknown>): string {
  return String(item.rtsp_url ?? item.rtspUrl ?? '');
}

export function workerListItemMatchesDbRow(
  item: Record<string, unknown>,
  cameraId: string,
  kafkaTopic: string,
): boolean {
  return getWorkerListItemCameraId(item) === cameraId && getWorkerListItemKafkaTopic(item) === kafkaTopic;
}

export function toCameraServiceStartBody(params: {
  url: string;
  zmqPort: number;
  cameraId: string;
  tcp: boolean;
}) {
  return {
    rtsp_url: params.url,
    zmq_port: params.zmqPort,
    camera_id: params.cameraId,
    tcp: params.tcp,
  };
}

export function toStreamConnectionFields(row: {
  use_kafka: boolean;
  use_service_ip: boolean;
  zmq_port: number;
  service_ip?: string | null;
  kafka_server?: string | null;
  kafka_topic: string;
}) {
  return {
    use_kafka: row.use_kafka,
    use_service_ip: row.use_service_ip,
    zmq_port: row.zmq_port,
    service_ip: row.service_ip ?? '',
    kafka_server: row.kafka_server ?? '',
    kafka_topic: row.kafka_topic,
  };
}

/** @deprecated use toStreamConnectionFields */
export const toLprStreamStartFields = toStreamConnectionFields;
