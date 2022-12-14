import {
  intArg,
  makeSchema,
  nonNull,
  objectType,
  stringArg,
  inputObjectType,
  arg,
  asNexusMethod,
  enumType,
} from 'nexus'
import { DateTimeResolver } from 'graphql-scalars'
import { Context } from './context'

export const DateTime = asNexusMethod(DateTimeResolver, 'date')

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('allUsers', {
      type: 'User',
      resolve: (_parent, _args, context: Context) => {
        return context.prisma.user.findMany()
      },
    })

    t.nullable.list.nullable.field('challengeModes', {
      type: ChallengeMode,
      resolve: (_parent, _args, context: Context) => {
        return context.prisma.challengeMode.findMany()
      },
    })

    t.nullable.list.nullable.field('challenges', {
      type: Challenge,
      // an argument of type ChallengeOrderAtInput, with name "orderBy"
      args: {
        orderBy: arg({
          type: ChallengeOrderAtInput,
        }),
      },
      resolve: (_parent, args, context: Context) => {
        if (args.orderBy) {
          console.log('args.orderBy: ', Object.keys(args.orderBy))
          let arrOrderBy: any = []
          for (const i in Object.keys(args.orderBy)) {
            let obj: any = {}
            obj[Object.keys(args.orderBy)[i]] = Object.values(args.orderBy)[i]
            arrOrderBy.push(obj)
          }
          console.log('arr is: ', arrOrderBy)
          return context.prisma.challenge.findMany({
            orderBy: arrOrderBy,
          })
        } else {
          return context.prisma.challenge.findMany()
        }
      },
    })

    t.nullable.field('postById', {
      type: 'Post',
      args: {
        id: intArg(),
      },
      resolve: (_parent, args, context: Context) => {
        return context.prisma.post.findUnique({
          where: { id: args.id || undefined },
        })
      },
    })

    t.nonNull.list.nonNull.field('feed', {
      type: 'Post',
      args: {
        searchString: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({
          type: 'PostOrderByUpdatedAtInput',
        }),
      },
      resolve: (_parent, args, context: Context) => {
        const or = args.searchString
          ? {
              OR: [
                { title: { contains: args.searchString } },
                { content: { contains: args.searchString } },
              ],
            }
          : {}

        return context.prisma.post.findMany({
          where: {
            published: true,
            ...or,
          },
          take: args.take || undefined,
          skip: args.skip || undefined,
          orderBy: args.orderBy || undefined,
        })
      },
    })

    t.list.field('draftsByUser', {
      type: 'Post',
      args: {
        userUniqueInput: nonNull(
          arg({
            type: 'UserUniqueInput',
          }),
        ),
      },
      resolve: (_parent, args, context: Context) => {
        return context.prisma.user
          .findUnique({
            where: {
              id: args.userUniqueInput.id || undefined,
              email: args.userUniqueInput.email || undefined,
            },
          })
          .posts({
            where: {
              published: false,
            },
          })
      },
    })
  },
})

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.nonNull.field('signupUser', {
      type: 'User',
      args: {
        data: nonNull(
          arg({
            type: 'UserCreateInput',
          }),
        ),
      },
      resolve: (_, args, context: Context) => {
        const postData = args.data.posts?.map((post) => {
          return { title: post.title, content: post.content || undefined }
        })
        return context.prisma.user.create({
          data: {
            name: args.data.name,
            email: args.data.email,
            posts: {
              create: postData,
            },
          },
        })
      },
    })

    t.field('createDraft', {
      type: 'Post',
      args: {
        data: nonNull(
          arg({
            type: 'PostCreateInput',
          }),
        ),
        authorEmail: nonNull(stringArg()),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.post.create({
          data: {
            title: args.data.title,
            content: args.data.content,
            author: {
              connect: { email: args.authorEmail },
            },
          },
        })
      },
    })

    t.field('togglePublishPost', {
      type: 'Post',
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_, args, context: Context) => {
        try {
          const post = await context.prisma.post.findUnique({
            where: { id: args.id || undefined },
            select: {
              published: true,
            },
          })
          return context.prisma.post.update({
            where: { id: args.id || undefined },
            data: { published: !post?.published },
          })
        } catch (e) {
          throw new Error(
            `Post with ID ${args.id} does not exist in the database.`,
          )
        }
      },
    })

    t.field('incrementPostViewCount', {
      type: 'Post',
      args: {
        id: nonNull(intArg()),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.post.update({
          where: { id: args.id || undefined },
          data: {
            viewCount: {
              increment: 1,
            },
          },
        })
      },
    })

    t.field('deletePost', {
      type: 'Post',
      args: {
        id: nonNull(intArg()),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.post.delete({
          where: { id: args.id },
        })
      },
    })
  },
})

const Challenge = objectType({
  name: 'Challenge',
  description: 'challenge created by some user',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.date('start')
    t.nonNull.date('end')
    t.nonNull.float('moneyStaked')
    t.field('challengeMode', {
      type: 'ChallengeMode',
      resolve: (parent, _, context: Context) => {
        return context.prisma.challenge
          .findUnique({
            where: { id: parent.id },
          })
          .challengeMode()
      },
    })
  },
})

const ChallengeMode = objectType({
  name: 'ChallengeMode',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.list.nonNull.field('challenges', {
      type: 'Challenge',
      resolve: (parent, _, context: Context) => {
        return context.prisma.challengeMode
          .findUnique({
            where: { id: parent.id || undefined },
          })
          .challenges()
      },
    })
  },
})

const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.int('id')
    t.string('name')
    t.nonNull.string('email')
    t.nonNull.list.nonNull.field('postsssss', {
      type: 'Post',
      resolve: (parent, _, context: Context) => {
        return context.prisma.user
          .findUnique({
            where: { id: parent.id || undefined },
          })
          .posts()
      },
    })
  },
})

const Post = objectType({
  name: 'Post',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.nonNull.string('title')
    t.string('content')
    t.nonNull.boolean('published')
    t.nonNull.int('viewCount')
    t.field('author', {
      type: 'User',
      resolve: (parent, _, context: Context) => {
        return context.prisma.post
          .findUnique({
            where: { id: parent.id || undefined },
          })
          .author()
      },
    })
  },
})

const Commmitment = objectType({
  name: 'Commitment',
  definition(t) {
    t.nonNull.int('cId')
    t.nonNull.field('creator', {
      type: 'User',
      resolve: (parent, _, context: Context) => {
        return context.prisma.user.findUnique({
          where: { id: parent.id || undefined },
        })
      },
    })
    t.nonNull.int('skipBurnPolicy')
    t.nonNull.int('stake')
  },
})

const SortOrder = enumType({
  name: 'SortOrder',
  members: ['asc', 'desc'],
})

const QueryChallengeOrderAtInput = objectType({
  name: 'QueryChallengeOrderAtInput',
  definition(t) {
    t.nullable.field('moneyStaked', {
      type: SortOrder,
    })
    t.nullable.field('id', {
      type: SortOrder,
    })
  },
})

// a type that accepts a variable of type SortOrder, with name "moneyStaked"
const ChallengeOrderAtInput = inputObjectType({
  name: 'ChallengeOrderAtInput',
  definition(t) {
    t.nullable.field('moneyStaked', {
      type: SortOrder,
    })
    t.nullable.field('id', {
      type: SortOrder,
    })
  },
})

const PostOrderByUpdatedAtInput = inputObjectType({
  name: 'PostOrderByUpdatedAtInput',
  definition(t) {
    t.nonNull.field('updatedAt', { type: 'SortOrder' })
  },
})

const UserUniqueInput = inputObjectType({
  name: 'UserUniqueInput',
  definition(t) {
    t.int('id')
    t.string('email')
  },
})

const PostCreateInput = inputObjectType({
  name: 'PostCreateInput',
  definition(t) {
    t.nonNull.string('title')
    t.string('content')
  },
})

const UserCreateInput = inputObjectType({
  name: 'UserCreateInput',
  definition(t) {
    t.nonNull.string('email')
    t.string('name')
    t.list.nonNull.field('posts', { type: 'PostCreateInput' })
  },
})

export const schema = makeSchema({
  types: [
    Query,
    Mutation,
    Post,
    User,
    ChallengeMode,
    Challenge,
    UserUniqueInput,
    UserCreateInput,
    PostCreateInput,
    SortOrder,
    PostOrderByUpdatedAtInput,
    DateTime,
  ],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts',
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
})
