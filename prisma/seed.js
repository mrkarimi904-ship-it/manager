const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.user_accounts.create({
    data: {
      id: '6cf8dd12-daca-4c9c-8f11-779b27714041',
      username: 'administrator',
      password: '$2a$10$SMVaxzUw3iuOxF6zay3tUe4Lpg2HoVsWL0WpWqiiTEHoREfat5VTq',
      expired: false,
      expireInterval: 3650,
      mustchangepassword: false,
      firstname: 'VMS',
      lastname: 'SuperAdmin',
      description: 'default account',
      isSuperAdmin: true
    }
  })

  await prisma.user_groups.create({
    data: {
      id: '287efac4-9c1a-4702-af86-ebea21ff5094',
      name: 'Admins'
    }
  })

  await prisma.user_account_group.create({
    data: {
      id: '44306b45-4e06-4fff-a44e-e2097a7705d0',
      account_id: '6cf8dd12-daca-4c9c-8f11-779b27714041',
      group_id: '287efac4-9c1a-4702-af86-ebea21ff5094'
    }
  })

  await prisma.user_roles.create({
    data: {
      id: '2d6781bd-8093-4a58-a927-45975c3a478a',
      name: 'list_accounts',
      description: 'list all accounts',
      default: false
    }
  })

  await prisma.user_group_roles.create({
    data: {
      id: 'e0e4cc85-ebb2-411b-8a72-c4f3c69ad3c4',
      group_id: '287efac4-9c1a-4702-af86-ebea21ff5094',
      role_id: '2d6781bd-8093-4a58-a927-45975c3a478a',
      value: 0
    }
  })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })