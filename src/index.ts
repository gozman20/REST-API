import prisma from "../lib/prisma";
import express from "express";
import * as debug from "./debug";
import * as promise from "./promise-fs";
import { Post } from "@prisma/client";
import * as user from "./user";
console.log(promise);
console.log(debug);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.post(`/signup`, async (req, res) => {
  const { name, email, posts } = req.body;

  const postData = posts?.map((post: Post) => {
    return { title: post?.title, content: post?.content };
  });

  const result = await prisma.user.create({
    data: {
      name,
      email,
      posts: {
        create: postData,
      },
    },
    include: {
      posts: true, //   includes all post in the returned obj
    },
  });
  res.json(result);
});

app.post(`/post`, async (req, res) => {
  const { title, content, authorEmail } = req.body;
  const result = await prisma.post.create({
    data: {
      title,
      content,
      author: { connect: { email: authorEmail } },
    },
  });
  res.json(result);
});

app.put("/post/:id/views", async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    res.json(post);
  } catch (error) {
    res.json({ error: `Post with ID ${id} does not exist in the database` });
  }
});

//i added this
//this returns posts with published authors
app.get("/published", async (req, res) => {
  const publishedAuthors = await prisma.user.findMany({
    include: {
      posts: {
        where: {
          published: true,
        },
      },
    },
  });
  res.json(publishedAuthors);
});
app.put("/publish/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const postData = await prisma.post.findUnique({
      where: { id: Number(id) },
      select: {
        published: true,
      },
    });

    const updatedPost = await prisma.post.update({
      where: { id: Number(id) || undefined },
      data: { published: !postData?.published },
    });
    res.json(updatedPost);
  } catch (error) {
    res.json({ error: `Post with ID ${id} does not exist in the database` });
  }
});

//update user info
app.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  const user = await prisma.user.update({
    where: {
      id: +id,
    },
    data: {
      email: email,
    },
    include: {
      posts: true,
    },
  });

  res.json(user);
});

app.delete(`/post/:id`, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.delete({
    where: {
      id: +id,
    },
  });
  res.json(post);
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get("/user/:id/drafts", async (req, res) => {
  const { id } = req.params;

  const drafts = await prisma.user
    .findUnique({
      where: {
        id: +id,
      },
    })
    .posts({
      where: { published: false },
    });

  res.json(drafts);
});

// i added this
app.get("/post", async (req, res) => {
  const post = await prisma.post.findMany({
    where: {
      NOT: {
        createdAt: {
          gte: new Date("2023-07-24"),
          lte: new Date("2023-07-28"),
        },
      },
    },
  });
  res.json(post);
});
//returns post with a specific id
app.get(`/post/:id`, async (req, res) => {
  const { id }: { id?: string } = req.params;

  const post = await prisma.post.findUnique({
    where: { id: +id },
  });
  res.json(post);
});

// I added this
// this returns all single user post
app.get(`/userpost/:id`, async (req, res) => {
  const { id }: { id?: string } = req.params;

  const post = await prisma.post.findMany({
    where: { author: { id: +id } },
  });
  res.json(post);
});

app.get("/feed", async (req, res) => {
  const { searchString, skip, take, orderBy } = req.query;

  const or = searchString
    ? {
        OR: [
          { title: { contains: searchString as string } },
          { content: { contains: searchString as string } },
        ],
      }
    : {};

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      ...or,
    },
    include: { author: true },
    take: Number(take) || undefined,
    skip: Number(skip) || undefined,
    orderBy: {
      updatedAt: "desc",
    },
  });

  res.json(posts);
});

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`)
);
