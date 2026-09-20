/**
 * Environment config. Change the export at the bottom to switch between vms and lpr.
 * Usage: export default vms  OR  export default lpr
 */

const vms = {
  port: 3001,
  globalPrefix: '',
  swaggerServers: ['/', '/manager/'],
};

const lpr = {
  port: 3004,
  globalPrefix: '/manager',
  swaggerServers: ['/', '/manager/', '/test_manager/'],
};

export default vms;
