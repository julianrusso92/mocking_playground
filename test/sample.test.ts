import { expect, test, vi } from 'vitest'
import { addPost, addPost2, createUser, getPostByID, getPosts, updateUser } from '../script'
import prisma from '../libs/__mocks__/prisma'
import exp from 'constants'

// test('1 === 1', () => {
//     expect(1).toBe(1);
// })

vi.mock('../libs/prisma')

test('createUser should return the generated user', async () => {
    const newUser = { email: 'julian@gmail.com', name: 'Prisma fan' }
    prisma.user.create.mockResolvedValue({ ...newUser, id: 1 })
    const user = await createUser(newUser);
    expect(user).toStrictEqual({ ...newUser, id: 1 });
})

test('getPosts should return an object with published & un-published posts separated', async () => {
    const mockPublishedPost = { id: 1, content: 'content', published: true, title: 'title', authorId: 1 };
    prisma.post.findMany
        .mockResolvedValueOnce([mockPublishedPost])
        .mockResolvedValueOnce([{ ...mockPublishedPost, published: false }]);

    const posts = await getPosts();
    expect(posts).toStrictEqual({
        published: [mockPublishedPost],
        unpublished: [{ ...mockPublishedPost, published: false }]
    })
})

test("getPostById should throw an error when no ID found", async () => {
    prisma.post.findUniqueOrThrow.mockImplementation(() => {
        throw new Error('There was an error.');
    });

    // const response = await getPostByID(200);
    // expect(response).toBe('There was an error.');

    await expect(getPostByID(1)).rejects.toThrow()
    await expect(getPostByID(1)).rejects.toThrowError('There was an error')
});

test('addPost should return an object containing the new post and the total count', async () => {
    const mockPost = {
        authorId: 1,
        title: 'title',
        content: 'content',
        published: true
    }

    const mockResponse = [{ ...mockPost, id: 1 }, 100];
    prisma.$transaction.mockResolvedValue(mockResponse);

    const data = await addPost(mockPost);

    expect(data).toStrictEqual({
        newPost: mockResponse[0],
        count: mockResponse[1]
    });
});

test('addPost2 should return an object containing the new post and the total count', async () => {
    const mockPost = {
        authorId: 1,
        title: 'title',
        content: 'content'
    }

    const mockResponse = {
        newPost: { ...mockPost, id: 1, published: true },
        count: 100
    };

    prisma.post.create.mockResolvedValue(mockResponse.newPost);
    prisma.post.count.mockResolvedValue(mockResponse.count);

    prisma.$transaction.mockImplementation((callback) => callback(prisma));

    const data = await addPost2(mockPost);

    expect(data.newPost.published).toBe(true);
    expect(data).toStrictEqual(mockResponse);

});

test("updateUser should delete user posts if clearPosts flag is true", async () => {
    prisma.user.update.mockResolvedValue({
        id: 1,
        email: 'julian@gmail.com',
        name: 'Julian R'
    });

    await updateUser(1, {}, true);

    expect(prisma.post.deleteMany).toHaveBeenCalled();
    expect(prisma.post.deleteMany).toHaveBeenCalledWith({
        where: { authorId: 1 }
    });
});