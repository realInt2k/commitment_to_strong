import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = [
  {
    name: 'Alice',
    email: 'alice@prisma.io',
    posts: {
      create: [
        {
          title: 'Join the Prisma Slack',
          content: 'https://slack.prisma.io',
          published: true,
        },
      ],
    },
  },
  {
    name: 'Nilu',
    email: 'nilu@prisma.io',
    posts: {
      create: [
        {
          title: 'Follow Prisma on Twitter',
          content: 'https://www.twitter.com/prisma',
          published: true,
          viewCount: 42,
        },
      ],
    },
  },
  {
    name: 'Mahmoud',
    email: 'mahmoud@prisma.io',
    posts: {
      create: [
        {
          title: 'Ask a question about Prisma on GitHub',
          content: 'https://www.github.com/prisma/prisma/discussions',
          published: true,
          viewCount: 128,
        },
        {
          title: 'Prisma on YouTube',
          content: 'https://pris.ly/youtube',
        },
      ],
    },
  },
]

// const ChallengeData: Prisma.ChallengeCreateInput[] = [
//   {
//     start: new Date('August 19, 2023'),
//     end: new Date('August 22, 2023'),
//     moneyStaked: 30.3,
//     challengeMode: {
//       create: [
//         {

//         }
//       ]
//     }
//   }
// ]

const ChallengeModeData: Prisma.ChallengeModeCreateInput[] = [
  {
    challenge: {
      create: [
        {
          start: new Date('August 19, 2023'),
          end: new Date('August 22, 2023'),
          moneyStaked: 30.3,
        },
        {
          start: new Date('August 23, 2023'),
          end: new Date('August 29, 2023'),
          moneyStaked: 10.3,
        }
      ],
    },
  },
]

async function main() {
  console.log(`Start seeding ...`)
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    })
    console.log(`Created user with id: ${user.id}`)
  }
  for (const m of ChallengeModeData) {
    const mode = await prisma.challengeMode.create({
      data: m,
    });
    console.log(`created challengeMode with id:${mode.id}`);
  }
  console.log(`Seeding finished.`)
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
