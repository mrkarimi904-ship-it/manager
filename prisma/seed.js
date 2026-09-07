const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// =============================================================================
// SEED DATA - Edit these objects to modify seed data
// =============================================================================

const userRolesData = [
  { id: '876c22c2-af58-4a20-ae9a-fdbd53e5e716', name: 'camera_add', description: 'camera : add', default: true },
  { id: 'f1c603d9-1030-4b67-b41c-6a4cde030bb5', name: 'camera_delete', description: 'camera : delete', default: true },
  { id: '45f16606-7276-48ff-9d1e-9753acacc22a', name: 'camera_edit', description: 'camera : edit', default: true },
  { id: 'e25a719c-65e4-4b56-9813-1423e00fe29a', name: 'camera_list', description: 'camera : list', default: true },
  { id: 'c85d6db0-26d0-4a44-8db6-9c83285d7da7', name: 'logger_list', description: 'logs : list', default: true },
  { id: '7e2b8daa-1e8f-4b78-98b9-725c42254bbe', name: 'usergroup_list', description: 'user group : list', default: true },
  { id: 'ac2ae165-2ed8-4f25-befc-a48acfdcc074', name: 'usergroup_add', description: 'user group : add', default: true },
  { id: '65b98110-8e15-42b6-b9ee-08d7e143f718', name: 'usergroup_edit', description: 'user group : edit', default: true },
  { id: 'c395f2db-7772-41b8-811b-a3d9d8121f33', name: 'usergroup_delete', description: 'user group : delete', default: true },
  { id: 'f9a2f8fd-f577-44be-b7af-82fa0e9822e9', name: 'account_add', description: 'user : add', default: true },
  { id: '89c67cc2-c348-4027-920c-0adb2e1815ae', name: 'account_delete', description: 'user : delete', default: true },
  { id: '02e10f22-d8b4-4d58-9d29-e41a16888968', name: 'account_edit', description: 'user : edit', default: true },
  { id: 'f7c8e9d0-b1a2-4c3d-9e8f-a7b6c5d4e3f2', name: 'account_service_token', description: 'user : manage service tokens', default: false },
  { id: 'd2d6a705-ead9-4786-a94c-c00741fd4403', name: 'account_list', description: 'user : list', default: false },
  { id: 'de1d6219-57b8-45a6-a036-2bf5783b7cab', name: 'cameragroup_list', description: 'camera group : list', default: true },
  { id: 'b9e3d061-ddc0-4e14-aab0-8e7c2e843dc8', name: 'cameragroup_add', description: 'camera group : add', default: true },
  { id: '60641770-d9d6-4c98-861e-5917b16dc653', name: 'cameragroup_edit', description: 'camera group : edit', default: true },
  { id: 'a1b34714-d183-49dd-b54c-f566a1043d74', name: 'cameragroup_delete', description: 'camera group : delete', default: true },
  { id: '47f25f14-4ebd-46b3-8263-2c9b056dc6cd', name: 'assign_entities', description: 'assign : entities', default: true },
  { id: '9291d52b-9ae4-469e-a353-5ca808b4490c', name: 'assign_roles', description: 'assign: roles', default: true },
  { id: '40d2dfed-cf76-4a87-86ed-3de2c4abf872', name: 'actions_recorder', description: 'actions : recorder', default: true },
  { id: '2d422f4f-4907-4f43-a6e4-152fd8426a8d', name: 'actions_playback', description: 'actions: playback', default: true },
  { id: 'ab384e6b-231e-4971-844d-bb315b148bf6', name: 'actions_live', description: 'actions: live', default: true },
  { id: 'bd370f0b-7a20-4476-9134-08e6b14704c1', name: 'scheduler_user_account', description: 'scheduler : user', default: true },
  { id: 'dd8dbb08-2d67-4c28-8d07-327d58538c70', name: 'scheduler_user_group', description: 'scheduler : user group', default: true },
  { id: 'a4c3641d-d19c-472a-bc0c-33cb4e33606e', name: 'settings_password', description: 'settings : password complexity', default: true },
  { id: '6d3c12ff-1a38-4ed0-9d8c-0dc8d1a8f2a1', name: 'settings_webhook', description: 'settings : webhooks', default: true },
  { id: 'cdc49697-d21a-4156-9be9-ce60b306558d', name: 'bookmark_list', description: 'bookmarks: list', default: true },
  { id: '53c9df01-5911-477b-a33d-eb8b97a3025e', name: 'bookmark_add', description: 'bookmarks: add', default: true },
  { id: '66bece2f-80ed-47de-9782-0a7529d6d971', name: 'bookmark_delete', description: 'bookmarks: delete', default: true },
  { id: '8bd4331b-a682-491f-94aa-74f5b4e12dff', name: 'license', description: 'License', default: true },
  { id: '1a6e9b42-8bdb-44ae-9a29-8a9864bb6fc1', name: 'client_blacklist_add', description: 'Client : add blacklist', default: true },
  { id: 'ffa2e0a3-c15d-42e4-8fd0-b239227047c4', name: 'client_blacklist_delete', description: 'Client : delete blacklist', default: true },
  { id: '916dfa23-ba40-42c1-a065-443d787cbbfb', name: 'client_whitelist_add', description: 'Client : add whitelist', default: true },
  { id: '55b25533-dece-447f-993f-de10aa5220b1', name: 'client_whitelist_delete', description: 'Client : delete whitelist', default: true },
  { id: '2a7dccfa-247a-4d5d-9c82-116b4f2256f6', name: 'client_driver_add', description: 'Client : add driver', default: true },
  { id: '1ea91127-7cf3-4257-972d-fc55831419b6', name: 'client_driver_delete', description: 'Client : delete driver', default: true },
  { id: 'a491acec-b978-4853-a07d-09eb7261c6a8', name: 'client_db_export', description: 'Client : export db', default: true },
  { id: 'abbacb8a-65d0-4781-8ec0-72737f42cb70', name: 'client_db_import', description: 'Client : import db', default: true },
  { id: '70fd306e-5855-4d24-bab5-96872a8f7ee7', name: 'client_operation_add', description: 'Client : add operation', default: true },
  { id: '9d27b7b3-5e1c-47d1-81b2-ab4e70ea944e', name: 'client_operation_delete', description: 'Client : delete operation', default: true },
  { id: '423b4eb7-42cd-4e08-af58-1733619f5f87', name: 'client_whitelist_show', description: 'Client : show whitelist', default: true },
  { id: 'b707a824-2a3b-4dbd-85f5-5034c3d99f6e', name: 'client_manage_view', description: 'Client : Manage Views', default: true },
  { id: '32f70e39-b1c1-431a-a0ef-1c5b452096a6', name: 'client_manage_layout', description: 'Client : Manage Layouts', default: true },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'client_vms_login', description: 'Client : VMS login', default: false },
  { id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', name: 'client_lpr_login', description: 'Client : LPR login', default: false },
]

const userAccountsData = [
  {
    id: '6cf8dd12-daca-4c9c-8f11-779b27714041',
    username: 'super@dm!n',
    password: '$2a$10$tFiD9THMmbnaavuMiJ2jMOJz6vy4A0GWjrCf3MQeYYL0xDdohygIe',
    expired: false,
    expire_at: new Date('2035-02-02T11:35:20.658Z'),
    expireInterval: 3650,
    mustchangepassword: false,
    firstname: 'Technical',
    lastname: 'Support',
    description: 'default account',
    isActive: true,
    isSuperAdmin: true,
    isHidden: true,
    concurrent: 0,
    totp_secret: '',
    totp_status: false,
    totp_url: '',
  },
]

const settingPasswordComplexityData = {
  id: 'main',
  minimumCharactersCount: 5,
  haveSpecialCharacters: false,
  haveUppercaseCharacters: true,
  haveLowercaseCharacters: true,
  haveDigits: false,
}

const licenseData = {
  id: 'main',
  license: '{"name":"-","org":"-","expire":"3000-12-29T00:00:00.000Z","features":{"camera":5,"recorder":false,"lpr":false,"recorder_count":0,"lpr_count":0},"issued_at":"2020-01-01T12:00:00.000Z","fingerprint":{"hwid":"f2a8e1585b0c31f2e61f3ea7be4721658fc502ced3a1947417efd735f3bc6f8b","strong":{"machine_id":"dcd212fd686741eca0a6ef07c920b582","smbios_uuid":"dd1ad899d2531c76a4b4fc34971289d3","disk_serial":"","tpm_present":false}}}',
  key: '',
}

const licenseKeysData = {
  id: 'main',
  public_key: '-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEATlGLPuEs8MTt5Fmfkd3ANWxNqQgAMgX8ysGfylXbwW0=\n-----END PUBLIC KEY-----',
}

// =============================================================================
// SEED COMMANDS - Execution logic (no need to edit unless changing behavior)
// =============================================================================

async function main() {
  console.log('Starting seed data...')

  // 1. user_roles
  for (const role of userRolesData) {
    await prisma.user_roles.upsert({ where: { id: role.id }, update: {}, create: role })
  }
  console.log(`Seeded ${userRolesData.length} user roles`)

  // 2. user_accounts
  for (const account of userAccountsData) {
    await prisma.user_accounts.upsert({ where: { id: account.id }, update: {}, create: account })
  }
  console.log(`Seeded ${userAccountsData.length} user accounts`)

  // 3. setting_password_complexity
  await prisma.setting_password_complexity.upsert({
    where: { id: settingPasswordComplexityData.id },
    update: {},
    create: settingPasswordComplexityData,
  })
  console.log('Seeded setting_password_complexity')

  // 4. license
  await prisma.license.upsert({ where: { id: licenseData.id }, update: {}, create: licenseData })
  console.log('Seeded license')

  // 5. license_keys
  await prisma.license_keys.upsert({
    where: { id: licenseKeysData.id },
    update: { public_key: licenseKeysData.public_key },
    create: licenseKeysData,
  })
  console.log('Seeded license_keys')

  // 6. setting_backup_restore
  await prisma.setting_backup_restore.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main' },
  })
  console.log('Seeded setting_backup_restore')

  console.log('Seed data completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
