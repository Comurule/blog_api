const request = require('supertest');
const app = require('../../src');
const getMockUser = require('../stubs/user');
const getMockBlogPost = require('../stubs/blog');
const { createAPost } = require('../../src/modules/blog/blog.service');
const db = require('../../src/database/models');
const { createAUser, signinAUser } = require('../../src/modules/user/user.service');
const { connectToDB } = require('../../src/database/connectToDB');

const databaseUrl = process.env.DATABASE_URL;
const blogBaseUrl = '/api/v1/blogs';
const blogUrlWithId = (postId) => `${blogBaseUrl}/${postId}`;
const randomMongoId = '659ca111624d319ea45d1465';

describe('Blog CRUD endpoints', () => {
  let user1; let user2;

  beforeAll(async () => {
    await connectToDB(databaseUrl);
    const user1Stub = getMockUser();
    await createAUser(user1Stub);
    user1 = await signinAUser(user1Stub);

    const user2Stub = getMockUser();
    await createAUser(user2Stub);
    user2 = await signinAUser(user2Stub);
  });

  afterAll(async () => {
    await db.User.deleteMany({});
    await db.Blog.deleteMany({});
  });

  describe('POST /blogs', () => {
    it('should run successfully with the right details and user', async () => {
      const postStub = getMockBlogPost();

      const response = await request(app)
        .post(blogBaseUrl)
        .send(postStub)
        .set('authorization', `Bearer ${user1.accessToken}`);

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Post created successfully.');
      expect(response.body.data.author).toBe(String(user1.user._id));
    });

    it('should be protected, responds with 401 error code.', async () => {
      const postStub = getMockBlogPost();

      const response = await request(app)
        .post(blogBaseUrl)
        .send(postStub);

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User not authenticated.');
    });

    it('should respond with 422 error code when there are missing required fields', async () => {
      const postStub = getMockBlogPost();

      const response = await request(app)
        .post(blogBaseUrl)
        .send({ ...postStub, title: '' })
        .set('authorization', `Bearer ${user1.accessToken}`);

      expect(response.statusCode).toBe(422);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation Error(s)');
    });

    it("should respond with 409 error code when there's a duplicate post title", async () => {
      const postTitle = 'duplicate';
      const postStub = getMockBlogPost(undefined, postTitle);
      await createAPost(postStub, user1.user._id);

      const response = await request(app)
        .post(blogBaseUrl)
        .send(postStub)
        .set('authorization', `Bearer ${user1.accessToken}`);

      expect(response.statusCode).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Blog post, with title: duplicate, already exists by this author.');
    });
  });

  describe('PUT /blogs/:id', () => {
    it('should run successfully with the right details and user', async () => {
      const postStub = getMockBlogPost();
      const postTitle = 'changeName';
      const post = await createAPost(postStub, user1.user._id);

      const response = await request(app)
        .put(blogUrlWithId(String(post._id)))
        .send({ ...postStub, title: postTitle })
        .set('authorization', `Bearer ${user1.accessToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Post updated successfully.');
      expect(response.body.data.title).toBe(postTitle);
    });

    it('should be protected, responds with 401 error code.', async () => {
      const postStub = getMockBlogPost();
      const post = await createAPost(postStub, user1.user._id);

      const response = await request(app)
        .put(blogUrlWithId(String(post._id)))
        .send(postStub);

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User not authenticated.');
    });

    it('should only run for owners of the post, responds with 403 error code', async () => {
      const postStub = getMockBlogPost();
      const post = await createAPost(postStub, user1.user._id);

      const response = await request(app)
        .put(blogUrlWithId(String(post._id)))
        .send(postStub)
        .set('authorization', `Bearer ${user2.accessToken}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('You can only edit posts you created.');
    });

    it('should respond with 422 error code when there are empty fields', async () => {
      const postStub = getMockBlogPost();
      const post = await createAPost(postStub, user1.user._id);

      const response = await request(app)
        .put(blogUrlWithId(String(post._id)))
        .send({ ...postStub, title: '' })
        .set('authorization', `Bearer ${user1.accessToken}`);

      expect(response.statusCode).toBe(422);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation Error(s)');
    });

    it('should respond with 404 error code when product record is not found', async () => {
      const postStub = getMockBlogPost();

      const response = await request(app)
        .put(blogUrlWithId(randomMongoId))
        .send(postStub)
        .set('authorization', `Bearer ${user1.accessToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Post record not found.');
    });

    it("should responds with 409 error code when there's a duplicate post title", async () => {
      const postTitle = 'update-duplicate';
      const postStub1 = getMockBlogPost(undefined, postTitle);
      const postStub2 = getMockBlogPost();
      const post = await createAPost(postStub2, user1.user._id);

      // Control record
      await createAPost(postStub1, user1.user._id);

      const response = await request(app)
        .put(blogUrlWithId(String(post._id)))
        .send({ ...postStub2, title: postTitle })
        .set('authorization', `Bearer ${user1.accessToken}`);

      expect(response.statusCode).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe(`Blog post, with title: ${postTitle}, already exists by this author.`);
    });
  });

  describe('DELETE /blogs/:id', () => {
    it('should run successfully with the right details and user', async () => {
      const postStub = getMockBlogPost();
      const post = await createAPost(postStub, user1.user._id);

      const response = await request(app)
        .delete(blogUrlWithId(post._id))
        .set('authorization', `Bearer ${user1.accessToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Post deleted successfully.');
    });

    it('should be protected, responds with 401 error code.', async () => {
      const postStub = getMockBlogPost();
      const post = await createAPost(postStub, user1.user._id);

      const response = await request(app)
        .delete(blogUrlWithId(String(post._id)));

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User not authenticated.');
    });

    it('should only run for owners of the post, responds with 403 error code', async () => {
      const postStub = getMockBlogPost();
      const post = await createAPost(postStub, user1.user._id);

      const response = await request(app)
        .delete(blogUrlWithId(post._id))
        .set('authorization', `Bearer ${user2.accessToken}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('You can only delete posts you created.');
    });

    it('should respond with 404 error code when product record is not found', async () => {
      const response = await request(app)
        .delete(blogUrlWithId(randomMongoId))
        .set('authorization', `Bearer ${user1.accessToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Post record not found.');
    });
  });

  describe('GET /blogs/:id', () => {
    it('should run successfully with the right details', async () => {
      const postStub = getMockBlogPost();
      const post = await createAPost(postStub, user1.user._id);

      const response = await request(app).get(blogUrlWithId(post._id));

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Post details.');
      expect(response.body.data.title).toBe(post.title);
    });

    it('should respond with 404 error code when product record is not found', async () => {
      const response = await request(app).get(blogUrlWithId(randomMongoId));

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Post record not found.');
    });
  });

  describe('GET /blogs', () => {
    it('should run successfully with the right details', async () => {
      const response = await request(app).get(blogBaseUrl);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Post list.');
      expect(typeof response.body.data).toBe('object');
      expect(Array.isArray(response.body.data.docs)).toBeTruthy();
    });

    describe('with the pagination query params', () => {
      it('should get all posts for that page number, with the given page size', async () => {
        const pageNumber = 2;
        const pageSize = 10;
        const response = await request(app)
          .get(blogBaseUrl)
          .query({ pageNumber, pageSize });

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe('Post list.');
        expect(typeof response.body.data).toBe('object');
        expect(Array.isArray(response.body.data.docs)).toBeTruthy();
        expect(response.body.data.meta.page).toBe(pageNumber);
        expect(response.body.data.meta.perPage).toBe(pageSize);
      });

      it('should respond with 422 error code if pagination query fields are present, but empty', async () => {
        const response = await request(app)
          .get(blogBaseUrl)
          .query({ pageNumber: '', pageSize: '' });

        expect(response.statusCode).toBe(422);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Validation Error(s)');
      });
    });

    describe('with the sorting query param', () => {
      it('should get all posts sorted in the given order, using the given column name.', async () => {
        const sortKey = 'createdAt';
        const sortOrder = 'desc';
        const response = await request(app)
          .get(blogBaseUrl)
          .query({ sortKey, sortOrder });

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe('Post list.');
        expect(typeof response.body.data).toBe('object');
        expect(Array.isArray(response.body.data.docs)).toBeTruthy();
        expect(response.body.data.meta.sortKey).toBe(sortKey);
        expect(response.body.data.meta.sortOrder).toBe(sortOrder);
      });

      it('should respond with 422 error code if sorting query fields are present, but empty', async () => {
        const response = await request(app)
          .get(blogBaseUrl)
          .query({ sortOrder: '', sortKey: '' });

        expect(response.statusCode).toBe(422);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Validation Error(s)');
      });
    });
  });
});
