// todo: add more tests
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User } from '@prisma/client';
import { verify } from 'argon2';

describe('App E2E Tests', (): void => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const client: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
  });

  beforeAll(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.listen(3000);
    await app.init();

    prismaService = app.get(PrismaService);
    await prismaService.client.$transaction([
      prismaService.client.user.deleteMany(),
    ]);
  });

  afterAll((): void => {
    app.close();
  });

  describe('/auth', (): void => {
    const user: { email: string; password: string } = {
      email: 'john@doe.com',
      password: 'johndoe',
    };

    describe('POST /register', (): void => {
      it('should return status 400 if email and/or password are not provided or provided incorrectly', async (): Promise<void> => {
        try {
          await client.post('/auth/register', {
            password: user.password,
          });
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toStrictEqual([
            'email should not be empty',
            'email must be an email',
          ]);
        }

        try {
          await client.post('/auth/register', {
            email: user.email,
          });
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toStrictEqual([
            'password should not be empty',
            'password must be a string',
          ]);
        }

        try {
          await client.post('/auth/register');
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toStrictEqual([
            'email should not be empty',
            'email must be an email',
            'password should not be empty',
            'password must be a string',
          ]);
        }

        try {
          await client.post('/auth/register', {
            email: '',
            password: '',
          });
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toStrictEqual([
            'email should not be empty',
            'email must be an email',
            'password should not be empty',
          ]);
        }

        try {
          await client.post('/auth/register', {
            email: 'foobar',
            password: '',
          });
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toStrictEqual([
            'email must be an email',
            'password should not be empty',
          ]);
        }

        try {
          await client.post('/auth/register', {
            email: 'foobar',
            password: 'foobar',
          });
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toStrictEqual([
            'email must be an email',
          ]);
        }

        try {
          await client.post('/auth/register', {
            email: '',
            password: 'foobar',
          });
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toStrictEqual([
            'email should not be empty',
            'email must be an email',
          ]);
        }
      });

      it('should return an id', async (): Promise<void> => {
        const response: AxiosResponse = await client.post(
          '/auth/register',
          user,
        );

        expect(response.status).toBe(201);

        expect(response.data).toHaveProperty('id');
      });
    });

    describe('POST /signin', (): void => {
      it('should return status 400 if email and/or password are not provided or provided incorrectly', async (): Promise<void> => {
        try {
          await client.post('/auth/signin', {
            password: user.password,
          });
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toStrictEqual([
            'email should not be empty',
            'email must be an email',
          ]);
        }

        try {
          await client.post('/auth/signin', {
            email: user.email,
          });
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toStrictEqual([
            'password should not be empty',
            'password must be a string',
          ]);
        }

        try {
          await client.post('/auth/signin');
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toStrictEqual([
            'email should not be empty',
            'email must be an email',
            'password should not be empty',
            'password must be a string',
          ]);
        }

        try {
          await client.post('/auth/signin', {
            email: '',
            password: '',
          });
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toStrictEqual([
            'email should not be empty',
            'email must be an email',
            'password should not be empty',
          ]);
        }

        try {
          await client.post('/auth/signin', {
            email: 'foobar',
            password: '',
          });
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toStrictEqual([
            'email must be an email',
            'password should not be empty',
          ]);
        }

        try {
          await client.post('/auth/register', {
            email: 'foobar',
            password: 'foobar',
          });
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toStrictEqual([
            'email must be an email',
          ]);
        }

        try {
          await client.post('/auth/register', {
            email: '',
            password: 'foobar',
          });
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toStrictEqual([
            'email should not be empty',
            'email must be an email',
          ]);
        }
      });

      it('should return a token', async (): Promise<void> => {
        const response: AxiosResponse = await client.post('/auth/signin', {
          email: 'john@doe.com',
          password: 'johndoe',
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('token');
      });
    });
  });

  describe('/users', async (): Promise<void> => {
    const { data }: { data: { token: string } } = await client.post(
      '/auth/signin',
      {
        email: 'john@doe.com',
        password: 'johndoe',
      },
    );

    const { token }: { token: string } = data;

    describe('GET /me', (): void => {
      it('should return a user', async (): Promise<void> => {
        const response: AxiosResponse = await client.get('/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('id');
      });
    });

    describe('PATCH /me', (): void => {
      it('should update a user', async (): Promise<void> => {
        const response: AxiosResponse = await client.patch(
          '/users/me',
          {
            email: 'foo@bar.com',
            password: 'foobar',
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('email');
        expect(response.data.email).toBe('foo@bar.com');

        const user: User = await prismaService.client.user.findUnique({
          where: { email: 'foo@bar.com' },
        });

        const { password }: { password: string } = user;

        expect(await verify(password, 'foobar')).toBe(true);
      });
    });
  });

  describe('/bookmarks', async (): Promise<void> => {
    const { data }: { data: { token: string } } = await client.post(
      '/auth/signin',
      {
        email: 'foo@bar.com',
        password: 'foobar',
      },
    );

    const { token }: { token: string } = data;

    const bookmark: {
      url: string;
      title?: string;
      description?: string;
    } = {
      url: 'https://www.google.com',
      title: 'Google',
    };

    let id: string;

    describe('POST /', (): void => {
      it('should return a bookmark', async (): Promise<void> => {
        const response: AxiosResponse = await client.post(
          '/bookmarks',
          bookmark,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        id = response.data.id;

        expect(response.status).toBe(201);
      });
    });

    describe('GET /', (): void => {
      it('should return all user bookmarks', async (): Promise<void> => {
        const response: AxiosResponse = await client.get('/bookmarks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.status).toBe(200);
        expect(response.data[0]).toHaveProperty('id');
        expect(response.data[0]).toHaveProperty('url');
        expect(response.data[0]).toHaveProperty('title');
        expect(response.data[0]).toHaveProperty('description');
        expect(response.data[0]).toHaveProperty('createdAt');
      });
    });

    describe('GET /bookmarks/:id', (): void => {
      it('should return an user bookmark', async (): Promise<void> => {
        const response: AxiosResponse = await client.get(`/bookmarks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('url');
        expect(response.data).toHaveProperty('title');
        expect(response.data).toHaveProperty('description');
        expect(response.data).toHaveProperty('createdAt');
      });
    });

    describe('PATCH /bookmarks/:id', (): void => {
      it('should update an user bookmark', async (): Promise<void> => {
        const response: AxiosResponse = await client.patch(
          `/bookmarks/${id}`,
          {
            description: 'Search engine',
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('url');
        expect(response.data).toHaveProperty('title');
        expect(response.data).toHaveProperty('description');
        expect(response.data.description).toBe('Search engine');
        expect(response.data).toHaveProperty('updatedAt');
      });
    });

    describe('DELETE /bookmarks/:id', (): void => {
      it('should delete an user bookmark', async (): Promise<void> => {
        const response: AxiosResponse = await client.delete(
          `/bookmarks/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        expect(response.status).toBe(200);
      });
    });
  });
});
