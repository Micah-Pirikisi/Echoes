import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import prisma from "./src/config/prisma.js";

async function main() {
  console.log("Seeding...");
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.followRequest.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);
  const users = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.user.create({
        data: {
          email: faker.internet.email().toLowerCase(),
          passwordHash,
          name: faker.person.fullName(),
          avatarUrl: faker.image.avatar(),
          bio: faker.lorem.sentence(),
        },
      })
    )
  );

  const guest = await prisma.user.create({
    data: {
      email: process.env.GUEST_EMAIL || "guest@example.com",
      passwordHash: await bcrypt.hash(
        process.env.GUEST_PASSWORD || "guestpass123",
        10
      ),
      name: "Guest",
      avatarUrl: "https://www.gravatar.com/avatar?d=identicon",
      isGuest: true,
    },
  });

  const authors = [...users, guest];

  // Originals
  const posts = [];
  for (const author of authors) {
    const created = await Promise.all(
      Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() =>
        prisma.post.create({
          data: {
            authorId: author.id,
            content: faker.lorem.paragraph(),
            imageUrl: faker.datatype.boolean() ? faker.image.url() : null,
          },
        })
      )
    );
    posts.push(...created);
  }

  // Echoes
  for (const author of authors) {
    const toEcho = faker.helpers.arrayElements(
      posts,
      faker.number.int({ min: 1, max: 3 })
    );
    for (const p of toEcho) {
      await prisma.post.create({
        data: {
          authorId: author.id,
          content: faker.datatype.boolean() ? faker.lorem.sentence() : "",
          echoParentId: p.id,
          publishedAt: new Date(),
        },
      });
    }
  }

  // Scheduled posts (publishedAt in near future)
  for (const author of faker.helpers.arrayElements(authors, 4)) {
    const when = faker.date.soon({ days: 1 });
    await prisma.post.create({
      data: {
        authorId: author.id,
        content: `Scheduled thought for ${when.toISOString()}`,
        scheduledAt: when,
        publishedAt: when,
      },
    });
  }

  // Comments and likes
  for (const post of posts) {
    const commentsToAdd = faker.number.int({ min: 0, max: 3 });
    for (let i = 0; i < commentsToAdd; i++) {
      const commenter = faker.helpers.arrayElement(authors);
      await prisma.comment.create({
        data: {
          postId: post.id,
          authorId: commenter.id,
          content: faker.lorem.sentence(),
        },
      });
    }
    const likers = faker.helpers.arrayElements(
      authors,
      faker.number.int({ min: 0, max: 5 })
    );
    for (const liker of likers) {
      await prisma.like.create({
        data: { postId: post.id, userId: liker.id },
      });
    }
  }

  // follow relationships
  for (const u of authors) {
    const others = authors.filter((x) => x.id !== u.id);
    const followSome = faker.helpers.arrayElements(
      others,
      faker.number.int({ min: 2, max: 5 })
    );
    for (const target of followSome) {
      await prisma.follow.upsert({
        where: {
          followerId_followingId: { followerId: u.id, followingId: target.id },
        },
        create: { followerId: u.id, followingId: target.id },
        update: {},
      });
    }
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
