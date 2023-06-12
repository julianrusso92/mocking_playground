import { Prisma, PrismaClient } from '@prisma/client'
import prisma from './libs/prisma'


// A `main` function so that we can use async/await
async function main() {
  // // Seed the database with users and posts
  // const user1 = await prisma.user.create({
  //   data: {
  //     email: 'alice@prisma.io',
  //     name: 'Alice',
  //     posts: {
  //       create: {
  //         title: 'Watch the talks from Prisma Day 2019',
  //         content: 'https://www.prisma.io/blog/z11sg6ipb3i1/',
  //         published: true,
  //       },
  //     },
  //   },
  //   include: {
  //     posts: true,
  //   },
  // })
  // const user2 = await prisma.user.create({
  //   data: {
  //     email: 'bob@prisma.io',
  //     name: 'Bob',
  //     posts: {
  //       create: [
  //         {
  //           title: 'Subscribe to GraphQL Weekly for community news',
  //           content: 'https://graphqlweekly.com/',
  //           published: true,
  //         },
  //         {
  //           title: 'Follow Prisma on Twitter',
  //           content: 'https://twitter.com/prisma/',
  //           published: false,
  //         },
  //       ],
  //     },
  //   },
  //   include: {
  //     posts: true,
  //   },
  // })
  // console.log(
  //   `Created users: ${user1.name} (${user1.posts.length} post) and ${user2.name} (${user2.posts.length} posts) `,
  // )

  // // Retrieve all published posts
  // const allPosts = await prisma.post.findMany({
  //   where: { published: true },
  // })
  // console.log(`Retrieved all published posts: ${allPosts}`)

  // // Create a new post (written by an already existing user with email alice@prisma.io)
  // const newPost = await prisma.post.create({
  //   data: {
  //     title: 'Join the Prisma Slack community',
  //     content: 'http://slack.prisma.io',
  //     published: false,
  //     author: {
  //       connect: {
  //         email: 'alice@prisma.io',
  //       },
  //     },
  //   },
  // })
  // console.log(`Created a new post: ${newPost}`)

  // // Publish the new post
  // const updatedPost = await prisma.post.update({
  //   where: {
  //     id: newPost.id,
  //   },
  //   data: {
  //     published: true,
  //   },
  // })
  // console.log(`Published the newly created post: ${updatedPost}`)

  // // Retrieve all posts by user with email alice@prisma.io
  // const postsByUser = await prisma.user
  //   .findUnique({
  //     where: {
  //       email: 'alice@prisma.io',
  //     },
  //   })
  //   .posts()
  // console.log(`Retrieved all posts from a specific user: ${postsByUser}`)
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

//Mock Prisma Client
export const createUser = async (user: Prisma.UserCreateInput) => {
  return await prisma.user.create({
    data: user,
  })
}

//Mocking query responses
export const getPosts = async () => {
  const published = await prisma.post.findMany({ where: { published: true } })
  const unpublished = await prisma.post.findMany({ where: { published: false } })

  return { published, unpublished }
}

//Triggering and capturing errors
// export const getPostByID = async (id: number) => {
//   try {
//     return await prisma.post.findUniqueOrThrow({ where: { id } })
//   } catch (e: any) {
//     return e.message
//   }
// }
export const getPostByID = async (id: number) => {
  return await prisma.post.findUniqueOrThrow({ where: { id } })
}

//Mocking transactions
export const addPost = async (data: Prisma.PostCreateInput) => {
  const [newPost, count] = await prisma.$transaction([
    prisma.post.create({ data }),
    prisma.post.count()
  ]);

  return { newPost, count };
}

export const addPost2 = async (data: Prisma.PostCreateInput) => {
  return await prisma.$transaction(async (tx) => {
    if (!('published' in data)) {
      data['published'] = true
    }

    const newPost = await tx.post.create({ data })
    const count = await tx.post.count()

    return { newPost, count }
  })
}

//Spy on methods
export const updateUser = async (
  id: number, 
  data: Prisma.UserUpdateInput,
  clearPosts: boolean
) => {
  const user = await prisma.user.update({
    where: { id },
    data
  })
  if (clearPosts) {
    await prisma.post.deleteMany({ where: { authorId: id }})
  }

  return user
}