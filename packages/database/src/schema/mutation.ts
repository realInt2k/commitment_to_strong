// import { arg, enumType, inputObjectType, intArg, nonNull, objectType, stringArg } from "nexus"
// import { Context } from "../context"


// const SortOrder = enumType({
//     name: 'SortOrder',
//     members: ['asc', 'desc'],
//   })
  
// const PostOrderByUpdatedAtInput = inputObjectType({
// name: 'PostOrderByUpdatedAtInput',
// definition(t) {
//     t.nonNull.field('updatedAt', { type: 'SortOrder' })
// },
// })

// export const Mutation = objectType({
//     name: 'Mutation',
//     definition(t) {
//       t.nonNull.field('signupUser', {
//         type: 'User',
//         args: {
//           data: nonNull(
//             arg({
//               type: 'UserCreateInput',
//             }),
//           ),
//         },
//         resolve: (_, args, context: Context) => {
//           const postData = args.data.posts?.map((post) => {
//             return { title: post.title, content: post.content || undefined }
//           })
//           return context.prisma.user.create({
//             data: {
//               name: args.data.name,
//               email: args.data.email,
//               posts: {
//                 create: postData,
//               },
//             },
//           })
//         },
//       })
  
//       t.field('createDraft', {
//         type: 'Post',
//         args: {
//           data: nonNull(
//             arg({
//               type: 'PostCreateInput',
//             }),
//           ),
//           authorEmail: nonNull(stringArg()),
//         },
//         resolve: (_, args, context: Context) => {
//           return context.prisma.post.create({
//             data: {
//               title: args.data.title,
//               content: args.data.content,
//               author: {
//                 connect: { email: args.authorEmail },
//               },
//             },
//           })
//         },
//       })
  
//       t.field('togglePublishPost', {
//         type: 'Post',
//         args: {
//           id: nonNull(intArg()),
//         },
//         resolve: async (_, args, context: Context) => {
//           try {
//             const post = await context.prisma.post.findUnique({
//               where: { id: args.id || undefined },
//               select: {
//                 published: true,
//               },
//             })
//             return context.prisma.post.update({
//               where: { id: args.id || undefined },
//               data: { published: !post?.published },
//             })
//           } catch (e) {
//             throw new Error(
//               `Post with ID ${args.id} does not exist in the database.`,
//             )
//           }
//         },
//       })
  
//       t.field('incrementPostViewCount', {
//         type: 'Post',
//         args: {
//           id: nonNull(intArg()),
//         },
//         resolve: (_, args, context: Context) => {
//           return context.prisma.post.update({
//             where: { id: args.id || undefined },
//             data: {
//               viewCount: {
//                 increment: 1,
//               },
//             },
//           })
//         },
//       })
  
//       t.field('deletePost', {
//         type: 'Post',
//         args: {
//           id: nonNull(intArg()),
//         },
//         resolve: (_, args, context: Context) => {
//           return context.prisma.post.delete({
//             where: { id: args.id },
//           })
//         },
//       })
//     },
//   })